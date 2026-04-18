#sqlite server fetching
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from datetime import date

from backend.database import create_auth_table, create_content_table, get_conn
from backend.auth import pw_hashing, hash_match, create_token, decode_token, check_banned
from backend.models import UserAuth, UserNoteInput, BanStatus

import os

import datetime

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://frontend-fd99.up.railway.app",
    "https://noteb.up.railway.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def startup():
    create_auth_table()
    create_content_table()

    conn = get_conn()
    admin = conn.execute("SELECT * FROM tauth WHERE is_admin = 1").fetchone()
    if not admin:
        hashed = pw_hashing(os.getenv("ADMIN_PASSWORD"))
        conn.execute("INSERT INTO tauth (name, password, is_admin, is_banned, created_at) VALUES (?, ?, ?, ?, ?)", 
                    ("admin", hashed, 1, 0, date.today()))
        conn.commit()


@app.post("/register")
def user_register(user: UserAuth):
    try:
        conn = get_conn()
        with conn:
            hashed = pw_hashing(user.password)
            conn.execute("INSERT INTO tauth (name, password, is_admin, is_banned, created_at) values (?, ?, ?, ?, ?)", (user.name, hashed, 0, 0, date.today()))
        return {"message": "registered successfully"}
    except Exception as e:
        print(e)
        return {"message": "Name already in use"}
    

@app.post("/login")
def user_login(user: UserAuth):
    try:
        conn = get_conn()
        with conn:
            result = conn.execute("SELECT * FROM tauth WHERE name = ?", (user.name,)).fetchone()
            if not result:
                return {"error": "User not found"}
            if hash_match(result['password'], user.password):
                token = create_token(result["id"], result["is_admin"], result["is_banned"])
                return {"token": token, "message": 'Login success'}
            return {"error": "Password doesn't match"}
    except Exception as e:
        print(e)


# =============
# NOTES SECTION
# =============


@app.post("/notes")
def create_note(user: UserNoteInput, authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}

        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if banned := check_banned(decoded): return banned

        conn = get_conn()
        with conn:
            conn.execute("INSERT INTO tcontent (user_id, title, content, created_at) values (?, ?, ?, ?)", (decoded['user_id'], user.title, user.content, date.today()))
            last_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            return {'message': 'Note posted', 'id': last_id}
    except Exception as e:
        print(e)
        return {'message': 'Note not posted'}


@app.get("/notes")
def fetch_notes(authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if banned := check_banned(decoded): return banned

        conn = get_conn()
        with conn:
            notes = conn.execute("SELECT * FROM tcontent WHERE user_id = ?", (decoded['user_id'], )).fetchall()
            user = conn.execute("SELECT name FROM tauth WHERE id = ?", (decoded['user_id'], )).fetchone()
            is_admin = conn.execute("SELECT is_admin FROM tauth WHERE id = ?", (decoded['user_id'], )).fetchone()['is_admin']
            return {"notes": [dict(note) for note in notes], 'admin': is_admin, 'username': user['name'], 'message': 'Notes fetched'}
    except Exception as e:
        print(e)
        return {'message': 'Notes not fetched'}


@app.delete("/notes/{id}")
def delete_note(id: int, authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if banned := check_banned(decoded): return banned

        conn = get_conn()
        with conn:
            conn.execute("DELETE FROM tcontent WHERE id = ? AND user_id = ?", (id, decoded['user_id']))
            return {'message': 'Note deleted'}
    except Exception as e:
        print(e)
        return {'message': 'Note not deleted'}

@app.put("/notes/{id}")
def update_note(id: int, user: UserNoteInput, authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if banned := check_banned(decoded): return banned

        conn = get_conn()
        with conn:
            conn.execute("UPDATE tcontent SET title = ?, content = ? WHERE id = ? AND user_id = ?", (user.title, user.content, id, decoded['user_id']))
            return {'message': 'Note updated'}
    except Exception as e:
        print(e)
        return {'message': 'Note not updated'}
    
# =============
# admin section
# =============

@app.get("/usersnotesadmin")
def fetch_users_admin(authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if not decoded['is_admin']: #"not admin"
            return {"error": "Admin Not Operating"}

        conn = get_conn()
        with conn:
            notes = conn.execute("""
        SELECT 
            tcontent.id,
            tcontent.user_id,
            tcontent.title,
            tcontent.content,
            tauth.name,
            tauth.is_admin
        FROM tcontent
        JOIN tauth ON tcontent.user_id = tauth.id
    """).fetchall()
            return {"notes": [dict(note) for note in notes], 'message': 'Notes fetched'}
    except Exception as e:
        print(e)
        return {'message': 'Notes not fetched'}
    
@app.get("/useraccountsadmin")
def fetch_users_admin(authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if not decoded['is_admin']: #"not admin"
            return {"error": "Admin Not Operating"}

        conn = get_conn()
        with conn:
            users = conn.execute("SELECT id, name, is_admin, is_banned, created_at FROM tauth").fetchall()
            return {"users": [dict(users) for users in users], 'message': 'Notes fetched'}
    except Exception as e:
        print(e)
        return {'message': 'Notes not fetched'}
    
    
@app.get("/finduseradmin/{id}")
def find_user_admin(id: int, authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if not decoded['is_admin']: #"not admin"
            return {"error": "Admin Not Operating"}

        conn = get_conn()
        with conn:
            user = conn.execute("SELECT id, name, is_admin, is_banned, created_at FROM tauth WHERE id = ?", (id,)).fetchone()
            return {"user": user, 'message': 'User fetched'}
    except Exception as e:
        print(e)
        return {'message': 'User not fetched'}
    
    
@app.delete("/adminUserNoteDelete/{id}")
def delete_usernote_admin(id: int, authorization: str = Header(None, alias="Authorization")):
    try:
        if not authorization or " " not in authorization:
            return {"error": "No token provided"}
        
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if not decoded['is_admin']: #"not admin"
            return {"error": "Admin Not Operating"}

        conn = get_conn()
        with conn:
            conn.execute("DELETE FROM tcontent WHERE id = ?", (id,))
            return {'message': 'Note deleted'}
    except Exception as e:
        print(e)
        return {'message': 'Note not deleted'}
    

@app.put("/adminbanuser/{id}")
def ban_user_admin(id: int, body: BanStatus, authorization: str = Header(None, alias="Authorization")):
    try:
        ban_status = body.ban_status
        if not authorization or " " not in authorization:
            return {"message": "No token provided"}
        
        token = authorization.split(" ")[1]
        decoded = decode_token(token)

        if not decoded['is_admin']: #"not admin"
            return {"message": "Admin Not Operating"}

        conn = get_conn()
        with conn:
            is_user_admin = conn.execute("SELECT is_admin FROM tauth WHERE id = ?", (id, )).fetchone()
            if is_user_admin["is_admin"]:
                return {'message': 'admin cannot be banned'}

            if ban_status == 1:
                conn.execute("UPDATE tauth SET is_banned = ? WHERE id = ?", (ban_status, id))
                return {'message': 'User banned'}
            # ban_status = 0
            conn.execute("UPDATE tauth SET is_banned = ? WHERE id = ?", (ban_status, id))
            return {'message': 'User unbanned'}
    except Exception as e:
        print(e)
        return {'message': f'User not banned {e}'}
    
#python -m uvicorn backend.main:app --reload
