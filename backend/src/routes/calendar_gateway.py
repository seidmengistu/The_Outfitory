from flask import Blueprint, jsonify, request, g
from services import calendar_service

calendar_bp = Blueprint('calendar_bp', __name__, url_prefix='/calendar')

# ============================================================
# 1️⃣ POST - Aggiungi una nuova entry nel calendario
# ============================================================
@calendar_bp.route('/add_entry', methods=['POST'])
def add_calendar_entry():
    """
    Aggiunge una nuova pianificazione (utente + outfit + data).
    Body JSON:
    {
        "outfit_id": 5,
        "date": "2025-11-15"
    }
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}
    
    # 🔥 Forziamo user_id dal token
    data["user_id"] = user_id
    
    result = calendar_service.add_calendar_entry(data)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 2️⃣ GET - Tutte le pianificazioni di un utente
# ============================================================
@calendar_bp.route('/get_all_entries', methods=['GET'])
def get_all_calendar_entries():
    """
    Restituisce tutte le pianificazioni di un utente.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = calendar_service.get_all_calendar_entries(user_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 3️⃣ GET - Singolo evento del calendario
# ============================================================
@calendar_bp.route('/get_entry/<int:calendar_id>', methods=['GET'])
def get_calendar_entry(calendar_id):
    """
    Restituisce un singolo evento del calendario.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = calendar_service.get_calendar_entry(user_id, calendar_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 4️⃣ PUT - Aggiorna un evento del calendario
# ============================================================
@calendar_bp.route('/update_entry/<int:calendar_id>', methods=['PUT'])
def update_calendar_entry(calendar_id):
    """
    Aggiorna la data o l'outfit di un evento del calendario.
    Body JSON:
    {
        "outfit_id": 8,
        "date": "2025-11-20"
    }
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}
    result = calendar_service.update_calendar_entry(user_id, calendar_id, data)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 5️⃣ DELETE - Elimina un evento dal calendario
# ============================================================
@calendar_bp.route('/delete_entry/<int:calendar_id>', methods=['DELETE'])
def delete_calendar_entry(calendar_id):
    """
    Elimina un evento dal calendario di un utente.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = calendar_service.delete_calendar_entry(user_id, calendar_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 6️⃣ GET - Eventi per data specifica
# ============================================================
@calendar_bp.route('/get_by_date/<string:date>', methods=['GET'])
def get_calendar_by_date(date):
    """
    Restituisce tutte le pianificazioni di un utente per una data specifica (YYYY-MM-DD).
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = calendar_service.get_calendar_by_date(user_id, date)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 7️⃣ GET - Eventi della settimana corrente
# ============================================================
@calendar_bp.route('/get_current_week', methods=['GET'])
def get_calendar_current_week():
    """
    Restituisce tutte le pianificazioni di un utente per la settimana corrente (da lunedì a domenica).
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = calendar_service.get_calendar_current_week(user_id)
    return jsonify(result), result.get("code", 500)
