import utils as u
from .db_manager import get_user_by_id as db_get_user_by_id,update_user as db_update_user
from .authentication_service import hash_password

def get_user_by_id(user_id):
    """
    Restituisce un singolo utente tramite ID.
    """
    result = db_get_user_by_id(user_id)
    return result

def update_user(user_id, data):
    """
    Aggiorna i dati di un utente (username, email, role o password_hash).
    """
    u.reset_response()

    username = data.get("username")
    email = data.get("email")
    role = data.get("role")
    password_hash = hash_password(data.get("password_hash"))

    if not any([username, email, role, password_hash]):
        return u.bad_request("Nessun campo da aggiornare.")

    result = db_update_user(user_id, username, email, role, password_hash)
    return result
    
def update_user(user_id, data):
    """
    Aggiorna i dati di un utente (username, email, role o password_hash).
    """
    u.reset_response()

    username = data.get("username")
    email = data.get("email")
    role = data.get("role")
    password_hash = data.get("password")

    if not any([username, email, role, password_hash]):
        return u.bad_request("Nessun campo da aggiornare.")

    result = db_update_user(user_id, username, email, role, password_hash)
    return result

# # ============================================================
# # 1️⃣ Registrazione utente
# # ============================================================
# def register_user(data):
#     """
#     Registra un nuovo utente.
#     """
#     u.reset_response()

#     username = data.get("username")
#     email = data.get("email")
#     password_hash = data.get("password_hash")
#     role = data.get("role", "Student")

#     if not username or not email or not password_hash:
#         return u.bad_request("Campi obbligatori mancanti (username, email, password_hash).")

#     result = db.register_user(username, email, password_hash, role)
#     return result


# # ============================================================
# # 2️⃣ Login utente (verifica credenziali)
# # ============================================================
# def login_user(data):
#     """
#     Verifica le credenziali dell'utente (autenticazione base).
#     """
#     u.reset_response()

#     email = data.get("email")
#     password_hash = data.get("password_hash")

#     if not email or not password_hash:
#         return u.bad_request("Email e password_hash sono obbligatorie.")

#     result = db.login_user(email, password_hash)
#     return result


# # ============================================================
# # 3️⃣ Recupera tutti gli utenti
# # ============================================================
# def get_all_users():
#     """
#     Restituisce tutti gli utenti.
#     """
#     u.reset_response()
#     result = db.get_all_users()
#     return result


# # ============================================================
# # 4️⃣ Recupera utente per ID
# # ============================================================


# # ============================================================
# # 5️⃣ Recupera utente per email
# # ============================================================
# def get_user_by_email(email):
#     """
#     Restituisce un utente tramite email.
#     """
#     u.reset_response()

#     if not email:
#         return u.bad_request("Email obbligatoria per la ricerca.")

#     result = db.get_user_by_email(email)
#     return result


# # ============================================================
# # 6️⃣ Aggiorna un utente
# # ============================================================



# # ============================================================
# # 7️⃣ Elimina un utente
# # ============================================================
# def delete_user(user_id):
#     """
#     Elimina un utente in base al suo ID.
#     """
#     u.reset_response()
#     result = db.delete_user(user_id)
#     return result


# # ============================================================
# # 8️⃣ Controlla se un'email esiste già
# # ============================================================
# def check_email_exists(email):
#     """
#     Controlla se un'email è già registrata nel sistema.
#     """
#     u.reset_response()

#     if not email:
#         return u.bad_request("Email obbligatoria per il controllo.")

#     result = db.check_email_exists(email)
#     return result
