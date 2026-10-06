import utils as u
from services import db_manager as db


# =====================================================
# CALENDAR SERVICE – CRUD OPERATIONS
# =====================================================
# ============================================================
# 1️⃣ Aggiungi una nuova entry nel calendario
# ============================================================
def add_calendar_entry(data):
    """
    Aggiunge una nuova pianificazione (utente + outfit + data).
    """
    u.reset_response()

    user_id = data.get("user_id")
    outfit_id = data.get("outfit_id")
    date = data.get("date")

    if not user_id or not outfit_id or not date:
        return u.bad_request("user_id, outfit_id e date sono obbligatori.")

    result = db.add_calendar_entry(user_id, outfit_id, date)
    return result


# ============================================================
# 2️⃣ Recupera tutte le pianificazioni di un utente
# ============================================================
def get_all_calendar_entries(user_id):
    """
    Restituisce tutte le pianificazioni di un utente.
    """
    u.reset_response()
    result = db.get_all_calendar_entries(user_id)
    return result


# ============================================================
# 3️⃣ Recupera un singolo evento del calendario
# ============================================================
def get_calendar_entry(user_id, calendar_id):
    """
    Restituisce un singolo evento del calendario.
    """
    u.reset_response()
    result = db.get_calendar_entry(user_id, calendar_id)
    return result


# ============================================================
# 4️⃣ Aggiorna un evento del calendario
# ============================================================
def update_calendar_entry(user_id, calendar_id, data):
    """
    Aggiorna la data o l'outfit di un evento del calendario.
    """
    u.reset_response()

    outfit_id = data.get("outfit_id")
    date = data.get("date")

    if not outfit_id and not date:
        return u.bad_request("Nessun campo da aggiornare.")

    result = db.update_calendar_entry(user_id, calendar_id, outfit_id, date)
    return result


# ============================================================
# 5️⃣ Elimina un evento dal calendario
# ============================================================
def delete_calendar_entry(user_id, calendar_id):
    """
    Elimina un evento dal calendario di un utente.
    """
    u.reset_response()
    result = db.delete_calendar_entry(user_id, calendar_id)
    return result


# ============================================================
# 6️⃣ Recupera eventi per data specifica
# ============================================================
def get_calendar_by_date(user_id, date):
    """
    Restituisce tutte le pianificazioni di un utente per una data specifica (YYYY-MM-DD).
    """
    u.reset_response()
    result = db.get_calendar_by_date(user_id, date)
    return result


# ============================================================
# 7️⃣ Recupera eventi della settimana corrente
# ============================================================
def get_calendar_current_week(user_id):
    """
    Restituisce tutte le pianificazioni di un utente per la settimana corrente (da lunedì a domenica).
    """
    u.reset_response()
    result = db.get_calendar_current_week(user_id)
    return result
