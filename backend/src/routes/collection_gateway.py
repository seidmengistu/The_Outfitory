from flask import Blueprint, jsonify, request, g
from services import collection_service

collection_bp = Blueprint('collection_bp', __name__, url_prefix='/collection')


# ============================================================
# 1️⃣ POST - Crea una nuova Collection
# ============================================================
@collection_bp.route('/add_collection', methods=['POST'])
def add_collection():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Forza user_id dal token
    data["user_id"] = user_id

    result = collection_service.add_collection(data)
    return jsonify(result), result["code"]


# ============================================================
# 2️⃣ POST - Crea Collection + aggiungi outfit
# ============================================================
@collection_bp.route('/add_collection_with_outfits', methods=['POST'])
def add_collection_with_outfits():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    name = data.get("name")
    if not name:
        return jsonify({"code": 400, "message": "name è obbligatorio."}), 400

    # 1) Crea la collection
    collection_data = {
        "user_id": user_id,
        "name": name,
        "description": data.get("description", "")
    }

    result = collection_service.add_collection(collection_data)
    if result["code"] != 201:
        return jsonify(result), result["code"]

    collection_id = result["data"]["collection_id"]
    outfits = data.get("outfits", [])

    added, failed = [], []

    for outfit_id in outfits:
        res = collection_service.add_outfit_to_collection({
            "user_id": user_id,  # 🔥 Forzato
            "collection_id": collection_id,
            "outfit_id": outfit_id
        })

        if res["code"] == 201:
            added.append(outfit_id)
        else:
            failed.append({"outfit_id": outfit_id, "error": res.get("message")})

    return jsonify({
        "code": 201,
        "message": f"Collection '{name}' creata. {len(added)} aggiunti. {len(failed)} errori.",
        "data": {
            "collection_id": collection_id,
            "added_outfits": added,
            "failed_outfits": failed
        }
    }), 201


# ============================================================
# 3️⃣ GET - Tutte le Collection dell'utente
# ============================================================
@collection_bp.route('/get_all_collections', methods=['GET'])
def get_all_collections():
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = collection_service.get_all_collections(user_id)
    return jsonify(result), result["code"]


# ============================================================
# 4️⃣ GET - Singola Collection
# ============================================================
@collection_bp.route('/get_collection/<int:collection_id>', methods=['GET'])
def get_collection(collection_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = collection_service.get_collection(user_id, collection_id)
    return jsonify(result), result["code"]


# ============================================================
# 5️⃣ GET - Ricerca per nome
# ============================================================
@collection_bp.route('/get_collection_by_name/<string:collection_name>', methods=['GET'])
def get_collection_by_name(collection_name):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = collection_service.get_collection_by_name(user_id, collection_name)
    return jsonify(result), result["code"]


# ============================================================
# 6️⃣ PUT - Aggiorna Collection
# ============================================================
@collection_bp.route('/update_collection/<int:collection_id>', methods=['PUT'])
def update_collection(collection_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Forza user_id nel body
    data["user_id"] = user_id

    result = collection_service.update_collection(user_id, collection_id, data)
    return jsonify(result), result["code"]


# ============================================================
# 7️⃣ DELETE - Elimina collection
# ============================================================
@collection_bp.route('/delete_collection/<int:collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = collection_service.delete_collection(user_id, collection_id)
    return jsonify(result), result["code"]


# ============================================================
# 8️⃣ POST - Aggiungi outfit a Collection
# ============================================================
@collection_bp.route('/add_outfit_to_collection', methods=['POST'])
def add_outfit_to_collection():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Forza user_id nel body
    data["user_id"] = user_id

    result = collection_service.add_outfit_to_collection(data)
    return jsonify(result), result["code"]


# ============================================================
# 9️⃣ DELETE - Rimuovi outfit da Collection  ==> TODO update query with userID
# ============================================================
@collection_bp.route('/remove_outfit_from_collection/<int:collection_id>/<int:outfit_id>', methods=['DELETE'])
def remove_outfit_from_collection(collection_id, outfit_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = collection_service.remove_outfit_from_collection(collection_id, outfit_id)
    return jsonify(result), result["code"]
