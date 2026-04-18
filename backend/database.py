import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data/userlite.db")

def create_auth_table():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS tauth (
                     id INTEGER PRIMARY KEY,
                     name TEXT NOT NULL UNIQUE,
                     password TEXT,
                     is_admin INTEGER,
                     is_banned INTEGER,
                     created_at TEXT
                     )
                    """)

def create_content_table():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS tcontent (
                     id INTEGER PRIMARY KEY,
                     user_id INTEGER NOT NULL,
                     title TEXT NOT NULL, 
                     content TEXT,
                     created_at TEXT
                     )
                    """)
        
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn