from flask import jsonify, make_response
from .db_manager import get_user,register_user
import bcrypt
import base64
from utils import generate_tokens
from utils import validate_token

from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional, Tuple

def verify_password(password: str, stored_hash: bytes) -> bool:

    return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))

def hash_password(password: str) -> bytes:
    # Da usare in fase di registrazione
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def login(email: str, password: str,user_ip):
    
    try:
        user = get_user(email)
        if user["code"] != 200 and user["code"]!= 500:
            return make_response(jsonify({"ok": False,"message":"Unauthorized!","data":{}}), 401)
        
        if user["code"] == 500:
            return  make_response(jsonify({"ok": False,"data":{},"message":"Internal server error."}), 500)
        
        login_successful = verify_password(password, user["data"]["password_hash"])
        if not login_successful:
            return make_response(jsonify({"ok": False,"message":"Unauthorized!","data":{}}), 401)
        else:
            user_id = user["data"]["user_id"]
            user_role = user["data"]["role"]
            username = user["data"]["username"]
            user_email = username = user["data"]["email"]
            token = generate_tokens(user_id,user_role,username,user_email)
            token_expiration = token["expires_in"]
            access_token = token["access_token"]
            return make_response(jsonify({"ok": True, 
            "message":"Login successful!",
            "data":{
                "access_token" : access_token,
                "token_type" : "Bearer",
                "expires_in" : token_expiration,
                "client_ip":user_ip
            }}), 200)
    except Exception as e:
        print(e)
        return  make_response(jsonify({"ok": False,"data":{},"message":"Internal server error."}), 500)


def register(username: str,email: str, password: str) -> dict:
    try:
        password_hash = hash_password(password)
        response = register_user(username,email, password_hash, role="Student")
        if response["code"] == 201:
            return make_response(jsonify({"ok": True,
                "message" :"User registered!",
                "data":{
            }}), 200)
        if response["code"] == 400:
            return make_response(jsonify({"ok": False, 
                "message" : "User already exists!",
                "data":{
            }}), 400)
        

    except Exception as e:
        return make_response(jsonify({"ok": False, 
        "message" : "Internal server error",
        "data":{

            }}), 500)
    return response



    ok: bool
    code: str
    message: Optional[str] = None
    data: Optional[Any] = None

    def to_http(self, status: int = 200) -> Tuple[Dict[str, Any], int]:
        return asdict(self), status

    @staticmethod
    def ok(data: Any = None, message: Optional[str] = None, code: str = "OK", status: int = 200):
        return ServiceResponse(True, code, message, data).to_http(status)

    @staticmethod
    def fail(code: str, message: str, *, status: int = 400, data: Any = None):
        return ServiceResponse(False, code, message, data).to_http(status)