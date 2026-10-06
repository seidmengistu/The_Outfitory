import utils as u
from services import db_manager as db

### ===========================================
### CLOTHES SERVICE 
### ===========================================

# 🔹 GET all clothes of user
def get_all_clothes_of_user(user_id):
    """
    Restituisce tutti i vestiti appartenenti a un utente.
    """
    u.reset_response()
    return db.get_all_clothes_of_user(user_id)


# 🔹 GET single cloth
def get_cloth_of_user(user_id, cloth_id):
    """
    Restituisce un singolo vestito di un utente.
    """
    u.reset_response()
    return db.get_cloth_of_user(user_id, cloth_id)

# 🔹 ADD new cloth
def add_cloth(data):
    """
    Aggiunge un nuovo vestito per un utente.
    """
    u.reset_response()

    user_id = data.get("user_id")
    name = data.get("name")
    category = data.get("category")
    season = data.get("season")
    occasion = data.get("occasion")
    image_url = data.get("image_url")
    notes = data.get("notes")

    # 🔥 Campi del nuovo schema Clothes
    pattern = data.get("pattern")
    primary_color = data.get("primary_color")
    secondary_color = data.get("secondary_color")
    typeCloth = data.get("typeCloth")

    # ⬇️ NUOVI CAMPI AGGIUNTI
    fit = data.get("fit")            # Regular, Oversized, Slim, etc.
    material = data.get("material")  # Cotton, Polyester, Wool, etc.

    return db.add_cloth(
        user_id,
        name,
        category,
        season,
        occasion,
        image_url,
        notes,
        pattern,
        primary_color,
        secondary_color,
        typeCloth,
        fit,
        material
    )


# 🔹 UPDATE cloth
def update_cloth(user_id, cloth_id, data):
    """
    Aggiorna un vestito esistente.
    """
    u.reset_response()
    return db.update_cloth(user_id, cloth_id, **data)


# 🔹 DELETE cloth
def delete_cloth(user_id, cloth_id):
    """
    Elimina un vestito esistente.
    """
    u.reset_response()
    return db.delete_cloth(user_id, cloth_id)


# 🔹 FILTER clothes
def filter_clothes_of_user(user_id, data):
    """
    Filtra i vestiti di un utente usando combina­zioni dinamiche di filtri.
    """
    u.reset_response()

    filters = data.get("filters", {})
    order_by = data.get("order_by", "created_at")
    order_dir = data.get("order_dir", "DESC")

    return db.filter_clothes(
        user_id=user_id,
        filters=filters,
        order_by=order_by,
        order_dir=order_dir
    )
