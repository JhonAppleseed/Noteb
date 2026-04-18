# NEW - JWT and hashing locgic
import bcrypt
import datetime
import jwt
import os


from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

def pw_hashing(password):
    # 1. Hashing a Password
    password = password.encode('utf-8')
    # Generate a salt and hash the password
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
    # print(f"Hash: {hashed_password}")
    # 2. Verifying a Password
    return hashed_password


def hash_match(hashed_password, user_input):
    user_input = user_input.encode('utf-8')
    if bcrypt.checkpw(user_input, hashed_password):
        # print("Password matches!")
        return True
    else:
        # print("Incorrect password.")
        return False

def create_token(user_id, is_admin, is_banned):
    payload = {"user_id": user_id, 'is_admin': is_admin, 'is_banned': is_banned, "exp": datetime.datetime.now() + datetime.timedelta(hours=12)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as e:
        print(e)
    except jwt.InvalidTokenError as e:
        print(e)

def check_banned(decoded):
    if decoded['is_banned']:
        return {"message": "User has been banned"}