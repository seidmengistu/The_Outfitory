import utils as u
from services import db_manager as db


# OUTFTIT FUNCTIONALITY
# ===========================================
# 1️⃣ CREA UN NUOVO OUTFIT
# ===========================================
def add_outfit(data):
    """
    Crea un nuovo outfit per un utente.
    Può includere una lista opzionale di cloth_id da associare all'outfit.
    """
    u.reset_response()

    user_id = data.get("user_id")
    name = data.get("name")
    description = data.get("description", "")
    clothes = data.get("clothes", [])

    if not user_id or not name:
        return u.bad_request("user_id e name sono obbligatori.")

    result = db.add_outfit(user_id, name, description, clothes)
    return result


# ===========================================
# 2️⃣ RECUPERA TUTTI GLI OUTFIT DI UN UTENTE
# ===========================================
def get_all_outfits(user_id):
    """
    Recupera tutti gli outfit completamente,
    ma nei vestiti prende solo cloth_id, name, image_url.
    """
    u.reset_response()

    # 1) Recupera lista outfit base (solo dati, non wrapper)
    base = db.get_all_outfits(user_id)
    if base.get("code") != 200:
        return base

    outfits = base["data"]  # ← IMPORTANTE

    full_outfits = []

    # 2) Per ogni outfit → dettaglio completo dal DB
    for o in outfits:
        detailed = db.get_outfit(user_id, o["outfit_id"])
        if detailed.get("code") != 200:
            continue

        outfit = detailed["data"]  # ← PRENDIAMO SOLO I DATI PURI

        # 3) Filtriamo i vestiti
        filtered_clothes = [
            {
                "cloth_id": c["cloth_id"],
                "name": c["name"],
                "image_url": c["image_url"]
            }
            for c in outfit.get("clothes", [])
        ]

        # 4) Ricostruzione JSON finale pulito
        full_outfits.append({
            "outfit_id": outfit["outfit_id"],
            "user_id": outfit["user_id"],
            "name": outfit["name"],
            "description": outfit["description"],
            "created_at": outfit["created_at"],
            "clothes": filtered_clothes
        })

    u.RESPONSE["code"] = 200
    u.RESPONSE["message"] = "Outfit completi recuperati con successo!"
    u.RESPONSE["data"] = full_outfits
    return u.RESPONSE


# ===========================================
# 3️⃣ RECUPERA UN OUTFIT SPECIFICO (CON I SUOI CAPI)
# ===========================================
def get_outfit(user_id, outfit_id):
    """
    Restituisce un outfit specifico con i vestiti associati.
    """
    u.reset_response()
    result = db.get_outfit(user_id, outfit_id)
    return result


# ===========================================
# 4️⃣ AGGIORNA UN OUTFIT
# ===========================================
def update_outfit(user_id, outfit_id, data):
    """
    Aggiorna un outfit esistente e opzionalmente la lista dei vestiti associati.
    """
    u.reset_response()

    name = data.get("name")
    description = data.get("description")
    clothes = data.get("clothes")

    result = db.update_outfit(user_id, outfit_id, name, description, clothes)
    return result


# ===========================================
# 5️⃣ ELIMINA UN OUTFIT
# ===========================================
def delete_outfit(user_id, outfit_id):
    """
    Elimina un outfit e le relative associazioni in OutfitItems.
    """
    u.reset_response()
    result = db.delete_outfit(user_id, outfit_id)
    return result




# ===========================================
# 6️⃣ RECUPERA L'ID DI UN OUTFIT DAL NOME
# ===========================================
def get_outfit_id_by_name_of_user(user_id, outfit_name):
    """
    Restituisce l'ID di un outfit basato sul nome (ricerca parziale, case-insensitive).
    """
    u.reset_response()

    if not outfit_name:
        return u.bad_request("Il nome dell'outfit è obbligatorio.")

    result = db.get_outfit_id_by_name(user_id, outfit_name)
    return result

# ===========================================
# 7️⃣ FILTRA GLI OUTFIT DI UN UTENTE
# ===========================================
def filter_outfits_of_user(user_id, data):
    """
    Filtra gli outfit di un utente usando combinazioni dinamiche di filtri.

    Il parametro `data` deve contenere:
        - filters: dict dei filtri dinamici
        - order_by: campo di ordinamento (default: created_at)
        - order_dir: ASC/DESC (default: DESC)

    Esempio:
    {
        "filters": {"name": "Casual"},
        "order_by": "name",
        "order_dir": "ASC"
    }
    """
    u.reset_response()

    # -----------------------------
    # Estrazione parametri dal body
    # -----------------------------
    if not isinstance(data, dict):
        return u.bad_request("Il body deve essere un JSON valido.")

    filters = data.get("filters", {})
    order_by = data.get("order_by", "created_at")
    order_dir = data.get("order_dir", "DESC")

    # Sanity check
    if filters is None:
        filters = {}

    if not isinstance(filters, dict):
        return u.bad_request("`filters` deve essere un dizionario.")

    # -----------------------------
    # Chiamata al DB manager
    # -----------------------------
    result = db.filter_outfits(
        user_id=user_id,
        filters=filters,
        order_by=order_by,
        order_dir=order_dir
    )

    return result

