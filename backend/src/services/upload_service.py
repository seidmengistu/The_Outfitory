import os
from flask import current_app, send_from_directory
from werkzeug.utils import secure_filename


# ============================================================
# 🔹 CONFIGURAZIONE E UTILITY
# ============================================================

def _get_upload_dir():
    """
    Restituisce la directory dove salvare i file e la crea se non esiste.
    """
    upload_dir = current_app.config.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def _allowed_file(filename: str) -> bool:
    """
    Controlla se il file ha un'estensione valida.
    """
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


# ============================================================
# 🔹 FUNZIONE: SALVATAGGIO IMMAGINE
# ============================================================

def save_image(file, filename: str):
    """
    Salva un file immagine nella cartella di upload.
    Restituisce un dizionario con code, message e image_url.
    """
    if not file:
        return {"code": 400, "message": "Campo file mancante."}

    if not filename:
        return {"code": 400, "message": "Parametro 'filename' obbligatorio."}

    filename = secure_filename(filename)

    if not _allowed_file(filename):
        return {
            "code": 400,
            "message": "Formato non valido. Usa png, jpg, jpeg o gif."
        }

    upload_dir = _get_upload_dir()
    save_path = os.path.join(upload_dir, filename)

    try:
        # Salva e sovrascrive se già esiste
        file.save(save_path)
        image_url = f"http://localhost:8000/upload/files/{filename}"

        return {
            "code": 201,
            "message": "Immagine caricata con successo.",
            "image_url": image_url
        }

    except Exception as e:
        current_app.logger.error(f"Errore durante il salvataggio dell'immagine: {e}")
        return {"code": 500, "message": "Errore durante il caricamento del file."}


# ============================================================
# 🔹 FUNZIONE: RESTITUZIONE IMMAGINE
# ============================================================

def get_image(filename: str):
    """
    Restituisce il file immagine richiesto se esiste.
    """
    upload_dir = _get_upload_dir()
    file_path = os.path.join(upload_dir, filename)

    if not os.path.exists(file_path):
        return {
            "code": 404,
            "message": f"File '{filename}' non trovato.",
            "data": None
        }

    # Flask invia il file binario (usato dal gateway)
    return send_from_directory(upload_dir, filename)
