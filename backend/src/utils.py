import os

import jwt
import datetime
from flask import jsonify

FLASK_DEBUG = False  # Do not use debug mode in production



USER_ID = None
USER_EMAIL = None

LOCAL = False

HOST = "db" if LOCAL else os.getenv('DB_HOST')
USER = "root" if LOCAL else os.getenv('DB_USER')
PASSWORD = "root" if LOCAL else os.getenv('DB_PASSWORD')
DATABASE = "outfitory" if LOCAL else os.getenv('DB_NAME')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

GENERIC_ERROR="Unkonwn error. "
NOT_FOUND="Error! Not Found. "
BAD_REQUEST= "Bad Request. "
UNAUTHORIZED= "Unauthorized "


OUTFITORY_SERVICE_URL = "http://127.0.0.1:8002" if LOCAL else "https://outfitory-service:8002"
DB_MANAGER_URL = "http://127.0.0.1:8005" if LOCAL else "https://db-manager:8005"

ALLOWED_INT = "0123456789"
ALLOWED_CHAR = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@."

RESPONSE = {
    "code": 200,
    "data": [],
    "message": ""
}


def reset_response():
    RESPONSE["code"] = 200
    RESPONSE["data"] = []
    RESPONSE["message"] = ""
    return RESPONSE


def generic_error(message="Unkonwn error"):
    RESPONSE["code"] = 500
    RESPONSE["data"] = []
    RESPONSE["message"] = message
    return RESPONSE


def not_found(message=""):
    RESPONSE["code"] = 404
    RESPONSE["data"] = []
    RESPONSE["message"] = "Error! Not Found. " + message
    return RESPONSE


def bad_request(message=""):
    RESPONSE["code"] = 400
    RESPONSE["data"] = []
    RESPONSE["message"] = "Bad Request. " + message
    return RESPONSE

def success(data=None, message=""):
    RESPONSE["code"] = 200
    RESPONSE["data"] = data if data is not None else []
    RESPONSE["message"] = message
    return RESPONSE


def created(message="", data=None):
    RESPONSE["code"] = 201
    RESPONSE["data"] = data if data is not None else []
    RESPONSE["message"] = message
    return RESPONSE


def error(code=400, message=""):
    RESPONSE["code"] = code
    RESPONSE["data"] = []
    RESPONSE["message"] = message
    return RESPONSE


def unauthorized(message=""):
    RESPONSE["code"] = 401
    RESPONSE["data"] = []
    RESPONSE["message"] = "Unauthorized " + message
    return RESPONSE


def forbidden(message=""):
    RESPONSE["code"] = 403
    RESPONSE["data"] = []
    RESPONSE["message"] = "Forbidden " + message
    return RESPONSE


def method_not_allowed(message=""):
    RESPONSE["code"] = 405
    RESPONSE["data"] = []
    RESPONSE["message"] = "Method not Allowed " + message
    return RESPONSE


def handle_error(code):
    if code == 400:
        return bad_request()
    elif code == 401:
        return unauthorized()
    elif code == 403:
        return forbidden()
    elif code == 404:
        return not_found()
    elif code == 405:
        return method_not_allowed()
    else:
        return generic_error()


def set_response(response):
    global RESPONSE
    RESPONSE["code"] = response.status_code
    RESPONSE["data"] = response.json().get("data")
    return RESPONSE




def send_response(message=""):
    RESPONSE["message"] = RESPONSE["message"] + " / " + message
    return jsonify(RESPONSE), RESPONSE["code"]


# Secret keys and configurations
# Secret keys and configurations
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_EXPIRATION_TIME = int(os.getenv("JWT_EXPIRATION_TIME", "7200"))
ALGORITHM = "HS256"


def require_secret_key():
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is required. Set it in the environment.")
    return SECRET_KEY

# Placeholder for user roles
USER_ROLES = ["user", "admin"]

# Blacklist dei token JWT invalidati
BLACKLIST = []

# Variabile globale per il token
AUTH_TOKEN = None


# Funzione per aggiornare il token
def set_auth_token(token):
    global AUTH_TOKEN
    AUTH_TOKEN = token


# Helper: Generate JWT
def generate_tokens(user_id, role,username,email):
    """
    Genera un ID Token e un Access Token usando HS256.
    """
    issuer = "https://0.0.0.0:8000"  # Cambia con il tuo URL

    # ID Token
    id_payload = {
        "iss": issuer,
        "sub": str(user_id),  # Identificativo unico dell'utente
        "username" : username,
        "role": role,  # Ruolo dell'utente (user/admin)
        "iat": datetime.datetime.now(datetime.timezone.utc),  # Data di emissione
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=JWT_EXPIRATION_TIME)
        # Scadenza
    }
    id_token = jwt.encode(id_payload, require_secret_key(), algorithm=ALGORITHM)

    # Access Token
    access_payload = {
        "iss": issuer,
        "sub": str(user_id),  # Identificativo unico dell'utente
        "username":username,
        "email":email,
        "role": role,  # Ruolo dell'utente (user/admin)
        "scope": "user_operations", #"admin_operations",  # Scope basato sul ruolo
        "iat": datetime.datetime.now(datetime.timezone.utc),  # Data di emissione
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=JWT_EXPIRATION_TIME),
        # Scadenza
        "jti": f"{user_id}-{datetime.datetime.now(datetime.timezone.utc)}"  # ID unico del token
    }
    access_token = jwt.encode(access_payload, require_secret_key(), algorithm=ALGORITHM)

    return {"id_token": id_token, "access_token": access_token,"expires_in":access_payload["exp"]}


def validate_token(token):
    """
    Valida un token JWT e ritorna il payload decodificato.
    """
    # Controlla se il token è nella blacklist
    if token in BLACKLIST:
        return {"error": "Token has been invalidated"}
    try:
        # Decodifica e verifica il token
        decoded = jwt.decode(token, require_secret_key(), algorithms=[ALGORITHM])
        return {"valid": True, "decoded": decoded}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token has expired"}
    except Exception as e:
        print(e)
        return {"valid": False, "error": "Invalid token"}


def check_token(enc_token):
    if enc_token is None:
        unauthorized()
        return False

    return True


def check_token_admin(enc_token):
    if not check_token(enc_token):
        return False

    token = validate_token(enc_token)
    role = token.get("role")

    if role != 'admin':
        unauthorized()
        return False

    return True


def process_fields(fields):
    """
    Itera sui campi forniti e restituisce una lista con i campi elaborati.
    """
    results = []
    for field in fields:
        reset_response()
        if field:
            # Applica la funzione di sanitizzazione
            sanitize_hash(field)
            # controlla la risposta ricevuta dalla funzione sanitize_username e determina se l'input è valido o meno
            if RESPONSE["code"] == 400:
                results.append('')
            else:
                tmp = RESPONSE["data"].strip("[]")
                results.append(tmp)
        else:
            results.append('')
    return results


def sanitize_hash(input_str):
    allowed_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-: "
    sanitized_str = input_str
    for char in sanitized_str:
        if char not in allowed_characters:
            sanitized_str = sanitized_str.replace(char, "")
    if input_str != sanitized_str:
        RESPONSE["code"] = 400
        RESPONSE["data"] = sanitized_str
        return RESPONSE
    else:
        RESPONSE["code"] = 200
        RESPONSE["data"] = sanitized_str
        return RESPONSE


def sanitize(input_str, allowed_characters):
    sanitized_str = input_str
    for char in sanitized_str:
        if char not in allowed_characters:
            sanitized_str = sanitized_str.replace(char, "")
    if input_str != sanitized_str:

        return None
    else:
        return sanitized_str


def safe_parse_int(value: str) -> int:
    if str is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        print(f"Errore: Impossibile convertire '{value}' in un intero.")
        return None

