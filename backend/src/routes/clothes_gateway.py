from flask import Blueprint, request, jsonify, g
from services import clothes_service

clothes_bp = Blueprint('clothes_bp', __name__, url_prefix='/clothes')

# ============================================================
# 1️⃣ GET - Tutti i vestiti di un utente
# ============================================================
@clothes_bp.route('/get_all_clothes', methods=['GET'])
def get_all_clothes_of_user():
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = clothes_service.get_all_clothes_of_user(user_id)
    return jsonify(result), result["code"]


# ============================================================
# 2️⃣ GET - Singolo vestito
# ============================================================
@clothes_bp.route('/get_single_cloth/<int:cloth_id>', methods=['GET'])
def get_cloth_of_user(cloth_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = clothes_service.get_cloth_of_user(user_id, cloth_id)
    return jsonify(result), result["code"]


# ============================================================
# 3️⃣ POST - Aggiungi vestito
# ============================================================
@clothes_bp.route('/add_cloth', methods=['POST'])
def add_cloth():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Forziamo user_id dal token
    data["user_id"] = user_id

    result = clothes_service.add_cloth(data)
    return jsonify(result), result["code"]


# ============================================================
# 4️⃣ PUT - Aggiorna vestito
# ============================================================
@clothes_bp.route('/update_cloth/<int:cloth_id>', methods=['PUT'])
def update_cloth(cloth_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    result = clothes_service.update_cloth(user_id, cloth_id, data)
    return jsonify(result), result["code"]


# ============================================================
# 5️⃣ DELETE - Elimina vestito
# ============================================================
@clothes_bp.route('/delete_cloth/<int:cloth_id>', methods=['DELETE'])
def delete_cloth(cloth_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = clothes_service.delete_cloth(user_id, cloth_id)
    return jsonify(result), result["code"]


# ============================================================
# 6️⃣ POST - Filtra vestiti
# ============================================================
@clothes_bp.route('/filter', methods=['POST'])
def filter_clothes():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    result = clothes_service.filter_clothes_of_user(user_id, data)
    return jsonify(result), result["code"]
