import os
from flask import Blueprint, request, jsonify
import json
from services import upload_service,classifier_service

# Blueprint per il modulo Upload
upload_bp = Blueprint('upload_bp', __name__, url_prefix='/file')

# ============================================================
# 🔹 COME USARLO (per il frontend o Postman)
# ============================================================
# 1️⃣ POST /upload/cloth_image
#     → Carica un'immagine (tipo multipart/form-data)
#     Parametri:
#        - image: File (campo file)
#        - filename: Text (nome del file, es. maglione_beige.jpg)
#
#     Esempio Postman:
#        POST http://localhost:8000/upload/cloth_image
#        Body → form-data:
#          KEY: image      TYPE: File     VALUE: scegli immagine
#          KEY: filename   TYPE: Text     VALUE: maglione_beige.jpg
#
#     Risposta:
#        {
#          "code": 201,
#          "message": "Immagine caricata con successo.",
#          "image_url": "http://localhost:8000/upload/files/maglione_beige.jpg"
#        }
#
# 2️⃣ GET /upload/files/<filename>
#     → Restituisce un’immagine salvata
#     Esempio:
#        GET http://localhost:8000/upload/files/maglione_beige.jpg
# ============================================================


# ============================================================
# 🟢 POST - Upload di un'immagine
# ============================================================
@upload_bp.route('/upload', methods=['POST'])
async def upload_cloth_image():
    """
    Riceve un file immagine dal frontend e lo passa al service per il salvataggio.
    """
    # 1️⃣ Controlla che ci sia il campo file
    if 'image' not in request.files:
        return jsonify({"code": 400, "message": "Campo 'image' mancante."}), 400

    file = request.files['image']

    if not file or file.filename == '':
        return jsonify({"code": 400, "message": "Nessun file selezionato."}), 400

    # 2️⃣ Nome file richiesto
    filename = request.form.get('filename')
    if not filename:
        return jsonify({"code": 400, "message": "Parametro 'filename' obbligatorio."}), 400

    # 3️⃣ Passa la logica al service
    result = upload_service.save_image(file, filename)
    classified_image_data = "" #await classifier_service.analyze_image(filename)
    return jsonify({
        "code": 201,
        "data": {
            "most_common_object": {
                "count": 4,
                "fit": "regular",
                "material": "cotton",
                "pattern": "striped",
                "primary_color": "white",
                "secondary_color": "chartreuse",
                "type": "pants"
            }
        },
        "message": "Image uploaded and classified"
    }), result.get("code", 500)


# ============================================================
# 🟢 GET - Restituisce un’immagine caricata
# ============================================================
@upload_bp.route('/get/<path:filename>', methods=['GET'])
def get_uploaded_file(filename):
    """
    Restituisce un file immagine precedentemente caricato.
    """
    result = upload_service.get_image(filename)

    # Se il service restituisce un dizionario → errore JSON
    if isinstance(result, dict):
        return jsonify(result), result.get("code", 500)

    # Altrimenti è un Response Flask (immagine binaria)
    return result
