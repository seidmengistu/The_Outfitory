from flask import Blueprint, jsonify, request, g
from services import travel_service

travel_bp = Blueprint('travel_bp', __name__, url_prefix='/travel')

# ============================================================
# 1️⃣ POST - Crea una nuova TravelList
# ============================================================
@travel_bp.route('/add_travel', methods=['POST'])
def add_travel():
    """
    Crea una nuova lista di viaggio per un utente.
    Body JSON:
    {
        "name": "Viaggio a Parigi",
        "start_date": "2025-12-01",
        "end_date": "2025-12-07"
    }
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}
    
    # 🔥 Forziamo user_id dal token
    data["user_id"] = user_id
    
    result = travel_service.add_travel(data)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 2️⃣ GET - Tutte le TravelList di un utente
# ============================================================
@travel_bp.route('/get_all_travels', methods=['GET'])
def get_all_travels():
    """
    Restituisce tutte le liste di viaggio (TravelList) per un utente.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = travel_service.get_all_travels(user_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 3️⃣ GET - Singola TravelList con i capi inclusi
# ============================================================
@travel_bp.route('/get_travel/<int:travel_id>', methods=['GET'])
def get_travel(travel_id):
    """
    Restituisce i dettagli di una singola lista di viaggio e i vestiti associati.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = travel_service.get_travel(user_id, travel_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 4️⃣ PUT - Aggiorna una TravelList
# ============================================================
@travel_bp.route('/update_travel/<int:travel_id>', methods=['PUT'])
def update_travel(travel_id):
    """
    Aggiorna nome, date o altri dati di una TravelList.
    Body JSON:
    {
        "name": "Nuovo nome del viaggio",
        "start_date": "2025-12-05",
        "end_date": "2025-12-10"
    }
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}
    result = travel_service.update_travel(user_id, travel_id, data)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 5️⃣ DELETE - Elimina una TravelList
# ============================================================
@travel_bp.route('/delete_travel/<int:travel_id>', methods=['DELETE'])
def delete_travel(travel_id):
    """
    Elimina una lista di viaggio e i vestiti associati.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = travel_service.delete_travel(user_id, travel_id)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 6️⃣ POST - Aggiungi un capo a una TravelList
# ============================================================
@travel_bp.route('/add_cloth_to_travel', methods=['POST'])
def add_cloth_to_travel():
    """
    Aggiunge un capo di abbigliamento a una lista di viaggio.
    Body JSON:
    {
        "travel_id": 3,
        "cloth_id": 15
    }
    """
    data = request.get_json() or {}
    result = travel_service.add_cloth_to_travel(data)
    return jsonify(result), result.get("code", 500)


# ============================================================
# 7️⃣ DELETE - Rimuovi un capo da una TravelList
# ============================================================
@travel_bp.route('/remove_cloth_from_travel/<int:travel_id>/<int:cloth_id>', methods=['DELETE'])
def remove_cloth_from_travel(travel_id, cloth_id):
    """
    Rimuove un capo dalla TravelList.
    """
    result = travel_service.remove_cloth_from_travel(travel_id, cloth_id)
    return jsonify(result), result.get("code", 500)