import utils as u
from services import db_manager as db



# =====================================================
# 🧭 TRAVEL LIST SERVICE – CRUD OPERATIONS
# =====================================================

# ============================================================
# 1️⃣ Crea una nuova TravelList
# ============================================================
def add_travel(data):
    """
    Crea una nuova lista di viaggio per un utente.
    """
    u.reset_response()

    user_id = data.get("user_id")
    name = data.get("name")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not all([user_id, name, start_date, end_date]):
        return u.bad_request("Tutti i campi (user_id, name, start_date, end_date) sono obbligatori.")

    result = db.add_travel(user_id, name, start_date, end_date)
    return result


# ============================================================
# 2️⃣ Recupera tutte le TravelList di un utente
# ============================================================
def get_all_travels(user_id):
    """
    Restituisce tutte le liste di viaggio (TravelList) per un utente.
    """
    u.reset_response()
    result = db.get_all_travels(user_id)
    return result


# ============================================================
# 3️⃣ Recupera una singola TravelList con i capi inclusi
# ============================================================
def get_travel(user_id, travel_id):
    """
    Restituisce i dettagli di una singola lista di viaggio e i vestiti associati.
    """
    u.reset_response()
    result = db.get_travel(user_id, travel_id)
    return result


# ============================================================
# 4️⃣ Aggiorna una TravelList
# ============================================================
def update_travel(user_id, travel_id, data):
    """
    Aggiorna nome, date o altri dati di una TravelList.
    """
    u.reset_response()

    name = data.get("name")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not any([name, start_date, end_date]):
        return u.bad_request("Nessun campo da aggiornare.")

    result = db.update_travel(user_id, travel_id, name, start_date, end_date)
    return result


# ============================================================
# 5️⃣ Elimina una TravelList
# ============================================================
def delete_travel(user_id, travel_id):
    """
    Elimina una lista di viaggio e i vestiti associati.
    """
    u.reset_response()
    result = db.delete_travel(user_id, travel_id)
    return result


# ============================================================
# 6️⃣ Aggiungi un capo a una TravelList
# ============================================================
def add_cloth_to_travel(data):
    """
    Aggiunge un capo di abbigliamento a una lista di viaggio.
    """
    u.reset_response()

    travel_id = data.get("travel_id")
    cloth_id = data.get("cloth_id")

    if not travel_id or not cloth_id:
        return u.bad_request("travel_id e cloth_id sono obbligatori.")

    result = db.add_cloth_to_travel(travel_id, cloth_id)
    return result


# ============================================================
# 7️⃣ Rimuovi un capo da una TravelList
# ============================================================
def remove_cloth_from_travel(travel_id, cloth_id):
    """
    Rimuove un capo dalla TravelList.
    """
    u.reset_response()
    result = db.remove_cloth_from_travel(travel_id, cloth_id)
    return result
