# routes/users.py
from flask import Blueprint, request, jsonify, abort,make_response,current_app,g
from services.user_service import get_user_by_id,update_user
users_bp = Blueprint("users", __name__)

from services.authentication_service import login as user_login
from services.authentication_service import register as user_register

import utils as u


@users_bp.post("/login")
def login():
    email = request.get_json().get('email')
    password = request.get_json().get('password')
    user_ip = request.remote_addr
    response = user_login(email,password,user_ip)
    response.data

    return response

@users_bp.post("/register")
def register():

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return u.bad_request("Username, email and password should all be present.")
    response = user_register(username,email,password)
    
    return response



# GET /user/<id> -> fetch one user
@users_bp.get("/user")
def get_user_from_token():
    print("Autorizzato")

    print("-------------")
    user_id = g.current_user.get("decoded", {}).get("sub")

    # 4) Fetch the user
    try:
        result = get_user_by_id(user_id)
    except Exception as e:
        # Log full traceback to your server logs
        current_app.logger.exception("get_user_by_id(%s) raised", user_id)
        # TEMPORARY: surface the error message while debugging
        return jsonify({"ok": False, "message": f"Internal error: {type(e).__name__}: {e}", "data": {}}), 500

    # 5) Normalize and return
    if not isinstance(result, dict):
        current_app.logger.error("get_user_by_id returned non-dict: %r", result)
        return jsonify({"ok": False, "message": "Handler returned unexpected value", "data": {}}), 500

    status = int(result.get("code", 500))
    ok = 200 <= status < 300
    body = {
        "ok": ok,
        "message": result.get("message", ""),
        "data": result.get("data", {}) if ok else {}
    }
    return jsonify(body), status

# GET /user/<id> -> fetch one user
# @users_bp.get("/<string:user_id>")
# def get_user(user_id: str):

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        u.unauthorized("Authorization header missing")
        return u.send_response()

    try:
        access_token = auth_header.removeprefix("Bearer ").strip()
        print("Access Token:", access_token)
    except IndexError:
        u.unauthorized("Malformed Authorization header")
        return u.send_response()

    token = u.validate_token(access_token)
    if "error" in token:
        u.unauthorized(token["error"])
        return u.send_response()

    token_user_id = token.get("decoded", {}).get("sub")
    if not token_user_id:
        return u.unauthorized("Unauthorized!")

    if token_user_id != user_id:
        return u.unauthorized("Unauthorized!")
    
    try:
        response = get_user_by_id(user_id)
        if response.status_code != 200:
            make_response(jsonify({"ok": False,"message":"User doesn't exist.","data":{}}), 400)
        else:
            return response

    except Exception as e:
        print(e)
        make_response(jsonify({"ok": False,"message":"Internal server error.","data":{}}), 500)

# PUT /user/change_password/<id> -> update user
@users_bp.put("/user/change_password/<string:user_id>")
def user_change_password(user_id: str):
    # 1) Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"ok": False, "message": "Authorization header missing or malformed", "data": {}}), 401

    access_token = auth_header.removeprefix("Bearer ").strip()

    # 2) Validate token
    token = u.validate_token(access_token)  # expected: {"valid": bool, "decoded": {...}} or {"valid": False, "error": "..."}
    if not token.get("valid"):
        return jsonify({"ok": False, "message": token.get("error", "Invalid token"), "data": {}}), 401

    # 3) Extract subject (user id)
    sub = token.get("decoded", {}).get("sub")
    email = token.get("decoded", {}).get("email")
    username = token.get("decoded", {}).get("username")
    role = token.get("decoded", {}).get("role")
    if sub is None or sub == "":
        return jsonify({"ok": False, "message": "Unauthorized", "data": {}}), 401

    try:
        user_id = int(sub)  # your DB likely stores INT
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "Invalid subject claim", "data": {}}), 400

    # 4) Fetch the user
    try:
        request_password = request.data["password"]
        data = {
            "username" : username,
            "email":email,
            "role":role,
            "password":request_password
        }

        result = update_user(user_id,data)
    except Exception as e:
        # Log full traceback to your server logs
        current_app.logger.exception("update_user(%s,<data>) raised", user_id)
        # TEMPORARY: surface the error message while debugging
        return jsonify({"ok": False, "message": f"Internal error: {type(e).__name__}: {e}", "data": {}}), 500

    # 5) Normalize and return
    if not isinstance(result, dict):
        current_app.logger.error("get_user_by_id returned non-dict: %r", result)
        return jsonify({"ok": False, "message": "Handler returned unexpected value", "data": {}}), 500

    status = int(result.get("code", 500))
    ok = 200 <= status < 300
    body = {
        "ok": ok,
        "message": result.get("message", ""),
        "data": result.get("data", {}) if ok else {}
    }
    return jsonify(body), status

# # PUT /user/<id> -> update user
# @users_bp.put("/<string:user_id>")
# def replace_user(user_id: str):



# # DELETE /user/<id> -> delete user
# @users_bp.delete("/<string:user_id>")
# def delete_user(user_id: str):
#     return True