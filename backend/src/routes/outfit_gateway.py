from flask import Blueprint, jsonify, request, g
from services import outfit_service, ai_agent_service as ai_service
from services.ai_agent_service import EnrichedOutfit
from typing import Dict, Any

outfit_bp = Blueprint('outfit_bp', __name__, url_prefix='/outfit')

# ============================================================
# 1️⃣ POST - Crea un nuovo outfit
# ============================================================
@outfit_bp.route('/add_outfit', methods=['POST'])
def add_outfit():
    """
    Crea un nuovo outfit per l'utente autenticato.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Forziamo lo user_id dal token, ignorando quello del body (se presente)
    data["user_id"] = user_id

    result = outfit_service.add_outfit(data)
    return jsonify(result), result["code"]


# ============================================================
# 2️⃣ GET - Tutti gli outfit dell'utente
# ============================================================
@outfit_bp.route('/get_all_outfits', methods=['GET'])
def get_all_outfits():
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = outfit_service.get_all_outfits(user_id)
    return jsonify(result), result["code"]


# ============================================================
# 3️⃣ GET - Singolo outfit
# ============================================================
@outfit_bp.route('/get_outfit/<int:outfit_id>', methods=['GET'])
def get_outfit(outfit_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = outfit_service.get_outfit(user_id, outfit_id)
    return jsonify(result), result["code"]


# ============================================================
# 4️⃣ PUT - Aggiorna un outfit
# ============================================================
@outfit_bp.route('/update_outfit/<int:outfit_id>', methods=['PUT'])
def update_outfit(outfit_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}
    result = outfit_service.update_outfit(user_id, outfit_id, data)
    return jsonify(result), result["code"]


# ============================================================
# 5️⃣ DELETE - Elimina un outfit
# ============================================================
@outfit_bp.route('/delete_outfit/<int:outfit_id>', methods=['DELETE'])
def delete_outfit(outfit_id):
    user_id = g.current_user.get("decoded", {}).get("sub")
    result = outfit_service.delete_outfit(user_id, outfit_id)
    return jsonify(result), result["code"]


# ============================================================
# 6️⃣ POST - Ottieni outfit_id dal nome
# ============================================================
@outfit_bp.route('/get_outfit_id_by_name', methods=['POST'])
def get_outfit_id_by_name():
    """
    Restituisce l'ID di un outfit basato sul nome.
    La ricerca è parziale (LIKE) e case-insensitive.
    """
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    outfit_name = data.get("name")

    result = outfit_service.get_outfit_id_by_name_of_user(
        user_id=user_id,
        outfit_name=outfit_name
    )

    return jsonify(result), result["code"]


# ============================================================
# 7️⃣ POST - Filtra gli outfit dell'utente
# ============================================================
@outfit_bp.route('/filter_outfits', methods=['POST'])
def filter_outfits_route():
    user_id = g.current_user.get("decoded", {}).get("sub")
    data = request.get_json() or {}

    # 🔥 Passiamo SOLO (user_id, data)
    result = outfit_service.filter_outfits_of_user(user_id, data)

    return jsonify(result), result["code"]



# ============================================================
# 7️⃣ POST - AI recommendation
# ============================================================

@outfit_bp.route('/recommend', methods=['POST'])
def generate_outfit() -> Dict[str, Any]:
    try:
        data = request.get_json()
        user_input = data.get('message')
        user_id = g.current_user.get("decoded", {}).get("sub")
        
        if not user_input:
            return jsonify({"error": "Message is required"}), 400

        # result = ai_service.get_recommendation(user_input, user_id)
        enriched_outfit = ai_service.ai_recommendation_service.get_recommendation(user_input, user_id)
        return enriched_outfit.model_dump(), 200
        
        # return jsonify(result), 200

    except Exception as e:
        print(f"Route Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# ============================================================
# 7️⃣ POST - Save - AI recommendation
# ============================================================
@outfit_bp.route('/save-recommendation', methods=['POST'])
def save_recommended_outfit():
    try:
        data = request.get_json()
        user_id = g.current_user.get("decoded", {}).get("sub")
        
        if not data:
            return jsonify({"error": "Outfit data is required"}), 400

        try:
            enriched_outfit = EnrichedOutfit(**data)
        except Exception as e:
            return jsonify({"error": f"Invalid outfit data: {str(e)}"}), 400

        saved_outfit = ai_service.ai_recommendation_service.save_outfit(enriched_outfit, user_id)
        
        if saved_outfit.error_message:
             return jsonify({"error": saved_outfit.error_message}), 500

        return saved_outfit.model_dump(), 200

    except Exception as e:
        print(f"Route Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# ============================================================
# 7️⃣ POST - Save - AI recommendation
# ============================================================
@outfit_bp.route('/delete-recommendation', methods=['POST'])
def delete_ai_recommended_outfit():
    try:
        data = request.get_json()
        user_id = g.current_user.get("decoded", {}).get("sub")
        
        if not data:
            return jsonify({"error": "Data is required"}), 400
        outfit_id = data.get("outfit_id")
        
        if not outfit_id:
             return jsonify({"error": "Outfit ID is required for deletion"}), 400
        try:
            outfit_id_int = int(outfit_id)
        except ValueError:
             return jsonify({"error": "Invalid Outfit ID format"}), 400
        result = outfit_service.delete_outfit(user_id, outfit_id_int)
        if result.get("code") == 200:
             return jsonify({"message": "Outfit deleted successfully", "outfit_id": outfit_id}), 200
        else:
             return jsonify({"error": result.get("message")}), result.get("code", 500)

    except Exception as e:
        print(f"Delete Route Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
