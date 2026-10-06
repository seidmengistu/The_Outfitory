import utils as u
from services import db_manager as db


# =====================================================
# 👗 COLLECTION SERVICE – CRUD OPERATIONS
# =====================================================
# ============================================================
# 1️⃣ Crea una nuova Collection
# ============================================================
def add_collection(data):
    """
    Crea una nuova collection (playlist di outfit).
    """
    u.reset_response()

    user_id = data.get("user_id")
    name = data.get("name")
    description = data.get("description")

    if not user_id or not name:
        return u.bad_request("user_id e name sono obbligatori.")

    result = db.add_collection(user_id, name, description)
    return result


# ============================================================
# 2️⃣ Recupera tutte le Collection di un utente
# ============================================================
def get_all_collections(user_id):
    """
    Restituisce tutte le collection di un utente.
    """
    u.reset_response()
    result = db.get_all_collections(user_id)
    return result


# ============================================================
# 3️⃣ Recupera una singola Collection con i suoi outfit
# ============================================================
def get_collection(user_id, collection_id):
    """
    Restituisce una collection e tutti gli outfit collegati.
    """
    u.reset_response()
    result = db.get_collection(user_id, collection_id)
    return result


# ============================================================
# 4️⃣ Recupera una Collection per nome (case insensitive, parziale)
# ============================================================
def get_collection_by_name(user_id, collection_name):
    """
    Restituisce una collection di un utente in base al nome (parziale o completo).
    """
    u.reset_response()

    if not user_id or not collection_name:
        return u.bad_request("user_id e collection_name sono obbligatori.")

    result = db.get_collection_by_name(user_id, collection_name)
    return result


# ============================================================
# 5️⃣ Aggiorna una Collection
# ============================================================
def update_collection(user_id, collection_id, data):
    """
    Aggiorna nome e descrizione di una collection.
    """
    u.reset_response()

    name = data.get("name")
    description = data.get("description")

    if not any([name, description]):
        return u.bad_request("Nessun campo da aggiornare.")

    result = db.update_collection(user_id, collection_id, name, description)
    return result


# ============================================================
# 6️⃣ Elimina una Collection
# ============================================================
def delete_collection(user_id, collection_id):
    """
    Elimina una collection e tutti i riferimenti agli outfit.
    """
    u.reset_response()
    result = db.delete_collection(user_id, collection_id)
    return result

def add_outfit_to_collection(data):
    """
    Aggiunge un outfit a una collection, gestendo errori not_found e duplicati.
    """
    u.reset_response()

    collection_id = data.get("collection_id")
    outfit_id = data.get("outfit_id")

    if not collection_id or not outfit_id:
        return u.bad_request("collection_id e outfit_id sono obbligatori.")

    result = db.add_outfit_to_collection(collection_id, outfit_id)
    return result

# ============================================================
# 8️⃣ Rimuovi un outfit da una Collection
# ============================================================
def remove_outfit_from_collection(collection_id, outfit_id):
    """
    Rimuove un outfit da una collection.
    """
    u.reset_response()
    result = db.remove_outfit_from_collection(collection_id, outfit_id)
    return result


