import mysql.connector
from mysql.connector import Error
# from src import utils as u
import utils as u

def get_connection():
    return mysql.connector.connect(
        host=u.HOST,
        user=u.USER,
        password=u.PASSWORD,
        database=u.DATABASE
    )


#### ===========================================
#### CLOTHES CRUD OPERATIONS
#### ===========================================
def add_cloth(user_id, name, category=None, season=None,
              occasion=None, image_url=None, notes=None,
              pattern=None, primary_color=None, secondary_color=None,
              typeCloth=None, fit=None, material=None):
    """
    Aggiunge un nuovo vestito per un determinato utente (user_id).
    Restituisce un dizionario con il risultato dell'operazione.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        if not user_id or not name:
            return {
                "code": 400,
                "data": [],
                "message": u.BAD_REQUEST
            }

        query = """
            INSERT INTO Clothes 
            (user_id, name, category, season, occasion, image_url, notes,
             pattern, primary_color, secondary_color, typeCloth, fit, material)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            user_id, name, category, season, occasion, image_url, notes,
            pattern, primary_color, secondary_color, typeCloth, fit, material
        )

        cursor.execute(query, values)
        connection.commit()

        return {
            "code": 201,
            "data": [],
            "message": "Vestito aggiunto con successo!"
        }

    except Error as e:
        return u.generic_error(f"Errore DB: {e}")

    finally:
        cursor.close()
        connection.close()


def get_all_clothes_of_user(user_id):
    """
    Restituisce tutti i vestiti appartenenti a un determinato utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM Clothes
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        print(f"Eseguo query: {query} con user_id={user_id}")

        cursor.execute(query, (user_id,))
        result = cursor.fetchall()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun vestito trovato per questo utente."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Vestiti recuperati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": "Errore durante il recupero dei vestiti: {e}"
        }
    finally:
        cursor.close()
        connection.close()

def get_cloth_of_user(user_id, cloth_id):
    """
    Restituisce un vestito specifico appartenente a un determinato utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM Clothes
            WHERE user_id = %s AND cloth_id = %s
        """

        print(f"Eseguo query: {query} con user_id={user_id}, cloth_id={cloth_id}")

        cursor.execute(query, (user_id, cloth_id))
        result = cursor.fetchone()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun vestito trovato per questo utente."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Vestito recuperato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero del vestito: {e}"
        }

    finally:
        cursor.close()
        connection.close()


def filter_clothes(user_id, filters, order_by="created_at", order_dir="DESC"):
    """
    Filtra i vestiti in base a filtri dinamici.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # QUERY BASE
        query = "SELECT * FROM Clothes WHERE user_id = %s"
        values = [user_id]

        # FILTRI DINAMICI
        for key, value in filters.items():

            if value is None or value == "":
                continue

            # Range date
            if key == "created_at__gte":
                query += " AND created_at >= %s"
                values.append(value)
                continue

            if key == "created_at__lte":
                query += " AND created_at <= %s"
                values.append(value)
                continue

            # Liste
            if isinstance(value, list):
                placeholders = ", ".join(["%s"] * len(value))
                query += f" AND {key} IN ({placeholders})"
                values.extend(value)
                continue

            # LIKE generico
            query += f" AND {key} LIKE %s"
            values.append(f"%{value}%")

        # ORDINAMENTO
        allowed_fields = [ "created_at", "name", "category", "season", "occasion", "notes",
                           "pattern", "primary_color", "secondary_color", "typeCloth",
                           "fit", "material"]

        allowed_dir = ["ASC", "DESC"]

        if order_by not in allowed_fields:
            order_by = "created_at"
        if order_dir.upper() not in allowed_dir:
            order_dir = "DESC"

        query += f" ORDER BY {order_by} {order_dir.upper()}"

        # ESECUZIONE QUERY
        cursor.execute(query, tuple(values))
        result = cursor.fetchall()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun vestito trovato con questi filtri."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Vestiti filtrati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il filtraggio: {e}"
        }

    finally:
        cursor.close()
        connection.close()



# ============================================================
# 3️⃣ Aggiorna un vestito
# ============================================================
def update_cloth(user_id, cloth_id, **fields):
    """
    Aggiorna un vestito esistente.
    Accetta campi opzionali come argomenti keyword.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        updates = []
        values = []

        allowed_fields = [
    "name", "category", "season", "occasion", "image_url", "notes",
    "pattern", "primary_color", "secondary_color", "typeCloth",
    "fit", "material"
]


        # Costruzione dinamica dei campi da aggiornare
        for field in allowed_fields:
            if fields.get(field) is not None:
                updates.append(f"{field} = %s")
                values.append(fields[field])

        if not updates:
            return {
                "code": 400,
                "data": [],
                "message": "Nessun campo da aggiornare."
            }

        # Parametri WHERE
        values.extend([user_id, cloth_id])

        query = f"""
            UPDATE Clothes
            SET {', '.join(updates)}
            WHERE user_id = %s AND cloth_id = %s
        """

        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Vestito non trovato o nessuna modifica effettuata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Vestito aggiornato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento del vestito: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 4️⃣ Elimina un vestito
# ============================================================
def delete_cloth(user_id, cloth_id):
    """
    Elimina un vestito specifico appartenente a un determinato utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM Clothes WHERE user_id = %s AND cloth_id = %s"
        cursor.execute(query, (user_id, cloth_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Vestito non trovato o già eliminato."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Vestito eliminato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione del vestito: {e}"
        }

    finally:
        cursor.close()
        connection.close()


#### ===========================================
#### OUTFITS CRUD OPERATIONS
#### ===========================================
# ============================================================
# 1️⃣ Crea un nuovo outfit
# ============================================================
def add_outfit(user_id, name, description="", clothes=None):
    """
    Crea un nuovo outfit per un utente.
    Può includere una lista opzionale di cloth_id da associare all'outfit.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        if not user_id or not name:
            return {
                "code": 400,
                "data": [],
                "message": "user_id e name sono obbligatori."
            }

        clothes = clothes or []  # lista di cloth_id

        # Inserisci l'outfit
        query_outfit = """
            INSERT INTO Outfits (user_id, name, description)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query_outfit, (user_id, name, description))
        outfit_id = cursor.lastrowid

        # Se sono presenti vestiti, aggiungili a OutfitItems
        if clothes:
            query_items = """
                INSERT INTO OutfitItems (outfit_id, cloth_id)
                VALUES (%s, %s)
            """
            for cloth_id in clothes:
                cursor.execute(query_items, (outfit_id, cloth_id))

        connection.commit()

        return {
            "code": 201,
            "data": {"outfit_id": outfit_id},
            "message": f"Outfit '{name}' creato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la creazione dell'outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 2️⃣ Recupera tutti gli outfit di un utente
# ============================================================
def get_all_outfits(user_id):
    """
    Restituisce solo la lista degli outfit (senza vestiti).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM Outfits
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        cursor.execute(query, (user_id,))
        outfits = cursor.fetchall()

        if not outfits:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun outfit trovato per questo utente."
            }

        return {
            "code": 200,
            "data": outfits,
            "message": "Outfit recuperati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero degli outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 3️⃣ Recupera un singolo outfit con i suoi vestiti
# ============================================================
def get_outfit(user_id, outfit_id):
    """
    Restituisce un outfit specifico con i vestiti associati.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Recupera i dati dell'outfit
        query_outfit = """
            SELECT *
            FROM Outfits
            WHERE user_id = %s AND outfit_id = %s
        """
        cursor.execute(query_outfit, (user_id, outfit_id))
        outfit = cursor.fetchone()

        if not outfit:
            return {
                "code": 404,
                "data": [],
                "message": "Outfit non trovato per questo utente."
            }

        # Recupera i vestiti associati
        query_clothes = """
            SELECT c.*
            FROM Clothes c
            JOIN OutfitItems oi ON c.cloth_id = oi.cloth_id
            WHERE oi.outfit_id = %s
        """
        cursor.execute(query_clothes, (outfit_id,))
        clothes = cursor.fetchall()

        outfit["clothes"] = clothes

        return {
            "code": 200,
            "data": outfit,
            "message": "Outfit recuperato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero dell'outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 4️⃣ Aggiorna un outfit
# ============================================================
def update_outfit(user_id, outfit_id, name=None, description=None, clothes=None):
    """
    Aggiorna un outfit esistente e opzionalmente la lista dei vestiti associati.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Aggiorna nome e descrizione (se presenti)
        updates = []
        values = []

        if name:
            updates.append("name = %s")
            values.append(name)
        if description:
            updates.append("description = %s")
            values.append(description)

        # Se ci sono campi da aggiornare → UPDATE
        if updates:
            query_update = f"""
                UPDATE Outfits 
                SET {', '.join(updates)} 
                WHERE user_id = %s AND outfit_id = %s
            """
            values.extend([user_id, outfit_id])
            cursor.execute(query_update, tuple(values))

        # Aggiorna i vestiti associati
        if clothes is not None:
            # Rimuovi tutti i collegamenti attuali
            cursor.execute(
                "DELETE FROM OutfitItems WHERE outfit_id = %s",
                (outfit_id,)
            )

            # Reinserisci quelli nuovi
            for cloth_id in clothes:
                cursor.execute(
                    "INSERT INTO OutfitItems (outfit_id, cloth_id) VALUES (%s, %s)",
                    (outfit_id, cloth_id)
                )

        connection.commit()

        return {
            "code": 200,
            "data": [],
            "message": "Outfit aggiornato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento dell'outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 5️⃣ Elimina un outfit
# ============================================================

def delete_outfit(user_id, outfit_id):
    """
    Elimina un outfit e le relative associazioni in OutfitItems.
    """
    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Cancella prima le relazioni in OutfitItems
        cursor.execute("DELETE FROM OutfitItems WHERE outfit_id = %s", (outfit_id,))
        
        # Poi cancella l'outfit
        query = "DELETE FROM Outfits WHERE user_id = %s AND outfit_id = %s"
        cursor.execute(query, (user_id, outfit_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Outfit non trovato o già eliminato."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Outfit eliminato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione dell'outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()

def filter_outfits(user_id, filters, order_by="created_at", order_dir="DESC"):
    """
    Filtra gli outfit dell'utente con filtri dinamici.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Se filters è None → fallback
        if not filters or not isinstance(filters, dict):
            filters = {}

        allowed_filter_fields = {
            "name",
            "description",
            "created_at__gte",
            "created_at__lte"
        }

        query = "SELECT * FROM Outfits WHERE user_id = %s"
        values = [user_id]

        # FILTRI DINAMICI
        for key, value in filters.items():

            if key not in allowed_filter_fields:
                continue

            if value is None:
                continue

            clean_val = value.strip() if isinstance(value, str) else value
            if clean_val == "":
                continue

            # Range DATE
            if key in ["created_at__gte", "created_at__lte"]:
                base_field = key.split("__")[0]

                op = ">=" if key.endswith("__gte") else "<="
                query += f" AND {base_field} {op} %s"
                values.append(clean_val)
                continue

            # LISTE — usate solo se richieste per nome e descrizione
            if isinstance(clean_val, list):
                placeholders = ", ".join(["%s"] * len(clean_val))
                query += f" AND {key} IN ({placeholders})"
                values.extend(clean_val)
                continue

            # LIKE case-insensitive
            if key in ["name", "description"]:
                query += f" AND LOWER({key}) LIKE %s"
                values.append(f"%{clean_val.lower()}%")
                continue

        # ORDINAMENTO (whitelisted)
        allowed_order_fields = ["created_at", "name", "description"]
        allowed_order_dir = ["ASC", "DESC"]

        if order_by not in allowed_order_fields:
            order_by = "created_at"
        if order_dir.upper() not in allowed_order_dir:
            order_dir = "DESC"

        query += f" ORDER BY {order_by} {order_dir.upper()}"

        cursor.execute(query, tuple(values))
        result = cursor.fetchall()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun outfit trovato con questi filtri."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Outfit filtrati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il filtraggio degli outfit: {e}"
        }

    finally:
        if "cursor" in locals() and cursor:
            cursor.close()
        if "connection" in locals() and connection and connection.is_connected():
            connection.close()


def get_outfit_id_by_name(user_id, outfit_name):
    """
    Restituisce l'ID di un outfit in base al nome (parziale, case-insensitive).
    Se ci sono più match, restituisce il primo più recente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        if not outfit_name:
            return {
                "code": 400,
                "data": [],
                "message": "Il nome dell'outfit è obbligatorio."
            }

        query = """
            SELECT outfit_id, name
            FROM Outfits
            WHERE user_id = %s
              AND LOWER(name) LIKE LOWER(%s)
            ORDER BY created_at DESC
            LIMIT 1
        """

        like_pattern = f"%{outfit_name}%"
        cursor.execute(query, (user_id, like_pattern))
        result = cursor.fetchone()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": f"Nessun outfit trovato con nome simile a '{outfit_name}'."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Outfit trovato."
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la ricerca dell'outfit: {e}"
        }

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection and connection.is_connected():
            connection.close()

#### ===========================================
#### CALENDAR CRUD OPERATIONS
#### ===========================================

# ============================================================
# 1️⃣ Aggiungi una nuova entry nel calendario
# ============================================================

def add_calendar_entry(user_id, outfit_id, date):
    """
    Aggiunge una nuova pianificazione al calendario (utente + outfit + data).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        if not user_id or not outfit_id or not date:
            return {
                "code": 400,
                "data": [],
                "message": "user_id, outfit_id e date sono obbligatori."
            }

        query = """
            INSERT INTO Calendar (user_id, outfit_id, date)
            VALUES (%s, %s, %s)
        """

        cursor.execute(query, (user_id, outfit_id, date))
        connection.commit()
        calendar_id = cursor.lastrowid

        return {
            "code": 201,
            "data": {"calendar_id": calendar_id},
            "message": "Evento aggiunto al calendario con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiunta dell'evento: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 2️⃣ Recupera tutte le pianificazioni di un utente
# ============================================================

def get_all_calendar_entries(user_id):
    """
    Restituisce tutte le pianificazioni del calendario per un determinato utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                    c.calendar_id,
                    c.date,
                    o.outfit_id,
                    o.name AS outfit_name,
                    o.description
            FROM Calendar c
            JOIN Outfits o ON c.outfit_id = o.outfit_id
            WHERE c.user_id = %s
            ORDER BY c.date ASC
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessuna pianificazione trovata per questo utente."
            }

        return {
            "code": 200,
            "data": results,
            "message": "Updated!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero delle pianificazioni: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 3️⃣ Recupera un singolo evento del calendario
# ============================================================
def get_calendar_entry(user_id, calendar_id):
    """
    Restituisce un singolo evento del calendario di un utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT 
                c.calendar_id,
                c.date,
                o.outfit_id,
                o.name AS outfit_name,
                o.description
            FROM Calendar c
            JOIN Outfits o ON c.outfit_id = o.outfit_id
            WHERE c.user_id = %s AND c.calendar_id = %s
        """

        cursor.execute(query, (user_id, calendar_id))
        result = cursor.fetchone()

        if not result:
            return {
                "code": 404,
                "data": [],
                "message": "Evento non trovato nel calendario."
            }

        return {
            "code": 200,
            "data": result,
            "message": "Updated!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero dell'evento: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 4️⃣ Aggiorna un evento del calendario
# ============================================================
def update_calendar_entry(user_id, calendar_id, outfit_id=None, date=None):
    """
    Aggiorna la data o l'outfit di un evento del calendario.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        updates = []
        values = []

        if outfit_id is not None:
            updates.append("outfit_id = %s")
            values.append(outfit_id)

        if date is not None:
            updates.append("date = %s")
            values.append(date)

        if not updates:
            return {
                "code": 400,
                "data": [],
                "message": "Nessun campo da aggiornare."
            }

        # Aggiungi user_id e calendar_id per la clausola WHERE
        values.extend([user_id, calendar_id])

        query = f"""
            UPDATE Calendar
            SET {', '.join(updates)}
            WHERE user_id = %s AND calendar_id = %s
        """

        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Evento non trovato o nessuna modifica effettuata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Evento del calendario aggiornato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento dell'evento: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 5️⃣ Elimina un evento dal calendario
# ============================================================
def delete_calendar_entry(user_id, calendar_id):
    """
    Elimina un evento dal calendario di un utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM Calendar WHERE user_id = %s AND calendar_id = %s"
        cursor.execute(query, (user_id, calendar_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Evento non trovato o già eliminato."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Evento del calendario eliminato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione dell'evento: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 6️⃣ Recupera eventi per data specifica
# ============================================================
def get_calendar_by_date(user_id, date):
    """
    Restituisce tutte le pianificazioni di un utente per un determinato giorno (YYYY-MM-DD).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
            FROM Calendar c
            JOIN Outfits o ON c.outfit_id = o.outfit_id
            WHERE c.user_id = %s AND c.date = %s
            ORDER BY c.date ASC
        """

        cursor.execute(query, (user_id, date))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": f"Nessuna pianificazione trovata per il giorno {date}."
            }

        return {
            "code": 200,
            "data": results,
            "message": f"Eventi del {date} recuperati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero delle pianificazioni giornaliere: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 7️⃣ Recupera eventi della settimana corrente
# ============================================================
def get_calendar_current_week(user_id):
    """
    Restituisce tutte le pianificazioni di un utente per la settimana corrente (da lunedì a domenica).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
            FROM Calendar c
            JOIN Outfits o ON c.outfit_id = o.outfit_id
            WHERE c.user_id = %s
              AND YEARWEEK(c.date, 1) = YEARWEEK(CURDATE(), 1)
            ORDER BY c.date ASC
        """

        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessuna pianificazione trovata per la settimana corrente."
            }

        return {
            "code": 200,
            "data": results,
            "message": "Eventi della settimana corrente recuperati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero delle pianificazioni settimanali: {e}"
        }

    finally:
        cursor.close()
        connection.close()


#### ===========================================
#### TRAVEL LIST CRUD & RELATIONS
#### ===========================================
# ============================================================
# 1️⃣ Crea una nuova TravelList
# ============================================================
def add_travel(user_id, name, start_date, end_date):
    """
    Aggiunge una nuova lista di viaggio (TravelList) per un utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        if not all([user_id, name, start_date, end_date]):
            return {
                "code": 400,
                "data": [],
                "message": "Tutti i campi (user_id, name, start_date, end_date) sono obbligatori."
            }

        query = """
            INSERT INTO TravelList (user_id, name, start_date, end_date)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, name, start_date, end_date))
        connection.commit()

        travel_id = cursor.lastrowid

        return {
            "code": 201,
            "data": {"travel_id": travel_id},
            "message": "Viaggio creato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la creazione del viaggio: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 2️⃣ Recupera tutte le TravelList di un utente
# ============================================================
def get_all_travels(user_id):
    """
    Restituisce tutte le liste di viaggio (TravelList) per un utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM TravelList
            WHERE user_id = %s
            ORDER BY start_date ASC
        """

        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessuna lista di viaggio trovata per questo utente."
            }

        return {
            "code": 200,
            "data": results,
            "message": "Liste di viaggio recuperate con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero delle TravelList: {e}"
        }

    finally:
        cursor.close()
        connection.close()


def get_travel(user_id, travel_id):
    """
    Restituisce i dettagli di una singola lista di viaggio e i capi associati,
    aggiornato per il nuovo schema Clothes.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT 
                t.travel_id, t.name, t.start_date, t.end_date,

                c.cloth_id,
                c.name AS cloth_name,
                c.category,
                c.season,
                c.occasion,
                c.image_url,
                c.notes,
                c.pattern,
                c.primary_color,
                c.secondary_color,
                c.typeCloth,
                c.fit,
                c.material,
                c.created_at

            FROM TravelList t
            LEFT JOIN TravelItems ti ON t.travel_id = ti.travel_id
            LEFT JOIN Clothes c ON ti.cloth_id = c.cloth_id

            WHERE t.user_id = %s AND t.travel_id = %s
        """

        cursor.execute(query, (user_id, travel_id))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun viaggio trovato per questo utente."
            }

        # Ricostruzione della struttura viaggio
        travel = {
            "travel_id": results[0]["travel_id"],
            "name": results[0]["name"],
            "start_date": str(results[0]["start_date"]),
            "end_date": str(results[0]["end_date"]),
            "clothes": []
        }

        for row in results:
            if row["cloth_id"]:
                travel["clothes"].append({
                    "cloth_id": row["cloth_id"],
                    "cloth_name": row["cloth_name"],
                    "category": row["category"],
                    "season": row["season"],
                    "occasion": row["occasion"],
                    "image_url": row["image_url"],
                    "notes": row["notes"],
                    "pattern": row["pattern"],
                    "primary_color": row["primary_color"],
                    "secondary_color": row["secondary_color"],
                    "typeCloth": row["typeCloth"],
                    "fit": row["fit"],
                    "material": row["material"],
                    "created_at": str(row["created_at"]) if row["created_at"] else None
                })

        return {
            "code": 200,
            "data": travel,
            "message": "Viaggio recuperato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero del viaggio: {e}"
        }

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection and connection.is_connected():
            connection.close()



# ============================================================
# 4️⃣ Aggiorna una TravelList
# ============================================================
def update_travel(user_id, travel_id, name=None, start_date=None, end_date=None):
    """
    Aggiorna nome, date o altri dati di un viaggio.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        updates = []
        values = []

        if name:
            updates.append("name = %s")
            values.append(name)
        if start_date:
            updates.append("start_date = %s")
            values.append(start_date)
        if end_date:
            updates.append("end_date = %s")
            values.append(end_date)

        if not updates:
            return {
                "code": 400,
                "data": [],
                "message": "Nessun campo da aggiornare."
            }

        values.extend([user_id, travel_id])
        query = f"UPDATE TravelList SET {', '.join(updates)} WHERE user_id = %s AND travel_id = %s"

        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Viaggio non trovato o nessuna modifica effettuata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Viaggio aggiornato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento del viaggio: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 5️⃣ Elimina una TravelList
# ============================================================
def delete_travel(user_id, travel_id):
    """
    Elimina una lista di viaggio e i vestiti associati.
    """
    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM TravelList WHERE user_id = %s AND travel_id = %s"
        cursor.execute(query, (user_id, travel_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Viaggio non trovato o già eliminato."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Viaggio eliminato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione del viaggio: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 6️⃣ Aggiungi un capo a una TravelList
# ============================================================
def add_cloth_to_travel(travel_id, cloth_id):
    """
    Aggiunge un capo di abbigliamento a una TravelList.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Validazione parametri
        if not travel_id or not cloth_id:
            return {
                "code": 400,
                "data": [],
                "message": "travel_id e cloth_id sono obbligatori."
            }

        query = "INSERT INTO TravelItems (travel_id, cloth_id) VALUES (%s, %s)"
        cursor.execute(query, (travel_id, cloth_id))
        connection.commit()

        return {
            "code": 201,
            "data": [],
            "message": "Capo aggiunto alla valigia!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiunta del capo alla valigia: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 7️⃣ Rimuovi un capo da una TravelList
# ============================================================
def remove_cloth_from_travel(travel_id, cloth_id):
    """
    Rimuove un capo dalla TravelList.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM TravelItems WHERE travel_id = %s AND cloth_id = %s"
        cursor.execute(query, (travel_id, cloth_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Capo non trovato nella valigia."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Capo rimosso dalla valigia!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la rimozione del capo: {e}"
        }

    finally:
        cursor.close()
        connection.close()


#### ===========================================
#### COLLECTION CRUD & PLAYLIST-LIKE OPERATIONS
#### ===========================================

# ============================================================
# 1️⃣ Crea una nuova Collection
# ============================================================
def add_collection(user_id, name, description=None):
    """
    Crea una nuova collection (playlist di outfit).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        if not user_id or not name:
            return {
                "code": 400,
                "data": [],
                "message": "user_id e name sono obbligatori."
            }

        query = """
            INSERT INTO Collections (user_id, name, description)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (user_id, name, description))
        connection.commit()

        collection_id = cursor.lastrowid

        return {
            "code": 201,
            "data": {"collection_id": collection_id},
            "message": "Collection creata con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la creazione della collection: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 2️⃣ Recupera tutte le Collection di un utente
# ============================================================
def get_all_collections(user_id):
    """
    Restituisce tutte le collection di un utente.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT collection_id, name, description, created_at
            FROM Collections
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessuna collection trovata per questo utente."
            }

        return {
            "code": 200,
            "data": results,
            "message": "Collections recuperate con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero delle collections: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 3️⃣ Recupera una singola Collection con i suoi outfit
# ============================================================
def get_collection(user_id, collection_id):
    """
    Restituisce una collection e tutti gli outfit collegati.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT c.collection_id, c.name AS collection_name, c.description, c.created_at,
                   o.outfit_id, o.name AS outfit_name, o.description AS outfit_description
            FROM Collections c
            LEFT JOIN CollectionOutfits co ON c.collection_id = co.collection_id
            LEFT JOIN Outfits o ON co.outfit_id = o.outfit_id
            WHERE c.user_id = %s AND c.collection_id = %s
        """
        cursor.execute(query, (user_id, collection_id))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Collection non trovata."
            }

        collection = {
            "collection_id": results[0]["collection_id"],
            "name": results[0]["collection_name"],
            "description": results[0]["description"],
            "created_at": str(results[0]["created_at"]),
            "outfits": []
        }

        for row in results:
            if row["outfit_id"]:
                collection["outfits"].append({
                    "outfit_id": row["outfit_id"],
                    "outfit_name": row["outfit_name"],
                    "description": row["outfit_description"]
                })

        return {
            "code": 200,
            "data": collection,
            "message": "Collection recuperata con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero della collection: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 4️⃣ Recupera una Collection per nome (case insensitive, parziale)
# ============================================================
def get_collection_by_name(user_id, collection_name):
    """
    Restituisce una collection di un utente in base al nome (parziale o completo).
    La ricerca non è case sensitive.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        if not collection_name:
            return {
                "code": 400,
                "data": [],
                "message": "Il nome della collection è obbligatorio."
            }

        query = """
            SELECT c.collection_id, c.name AS collection_name, c.description, c.created_at,
                   o.outfit_id, o.name AS outfit_name, o.description AS outfit_description
            FROM Collections c
            LEFT JOIN CollectionOutfits co ON c.collection_id = co.collection_id
            LEFT JOIN Outfits o ON co.outfit_id = o.outfit_id
            WHERE c.user_id = %s AND LOWER(c.name) LIKE %s
        """

        like_pattern = f"%{collection_name.lower()}%"
        cursor.execute(query, (user_id, like_pattern))
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": f"Nessuna collection trovata con nome simile a '{collection_name}'."
            }

        # Ricostruzione oggetto collection
        collection = {
            "collection_id": results[0]["collection_id"],
            "name": results[0]["collection_name"],
            "description": results[0]["description"],
            "created_at": str(results[0]["created_at"]),
            "outfits": []
        }

        for row in results:
            if row["outfit_id"]:
                collection["outfits"].append({
                    "outfit_id": row["outfit_id"],
                    "outfit_name": row["outfit_name"],
                    "description": row["outfit_description"]
                })

        return {
            "code": 200,
            "data": collection,
            "message": "Collection recuperata con successo per nome!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero della collection per nome: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 5️⃣ Aggiorna una Collection
# ============================================================
def update_collection(user_id, collection_id, name=None, description=None):
    """
    Aggiorna nome e descrizione di una collection.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        updates = []
        values = []

        if name:
            updates.append("name = %s")
            values.append(name)
        if description:
            updates.append("description = %s")
            values.append(description)

        if not updates:
            return {
                "code": 400,
                "data": [],
                "message": "Nessun campo da aggiornare."
            }

        values.extend([user_id, collection_id])
        query = f"""
            UPDATE Collections
            SET {', '.join(updates)}
            WHERE user_id = %s AND collection_id = %s
        """

        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Collection non trovata o nessuna modifica effettuata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Collection aggiornata con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento della collection: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 6️⃣ Elimina una Collection
# ============================================================
def delete_collection(user_id, collection_id):
    """
    Elimina una collection e tutti i riferimenti agli outfit.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Prima elimina i riferimenti agli outfit
        cursor.execute("DELETE FROM CollectionOutfits WHERE collection_id = %s", (collection_id,))

        # Poi elimina la collection
        query = "DELETE FROM Collections WHERE user_id = %s AND collection_id = %s"
        cursor.execute(query, (user_id, collection_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Collection non trovata o già eliminata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Collection eliminata con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione della collection: {e}"
        }

    finally:
        cursor.close()
        connection.close()




# ============================================================
# 8️⃣ Rimuovi un outfit da una Collection
# ============================================================
def remove_outfit_from_collection(collection_id, outfit_id):
    """
    Rimuove un outfit da una collection.
    """
    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM CollectionOutfits WHERE collection_id = %s AND outfit_id = %s"
        cursor.execute(query, (collection_id, outfit_id))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Outfit non trovato nella collection."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Outfit rimosso dalla collection!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la rimozione dell'outfit: {e}"
        }

    finally:
        cursor.close()
        connection.close()



#### ===========================================
#### USER CRUD + AUTHENTICATION QUERIES
#### ===========================================

# ============================================================
# 1️⃣ Registrazione utente
# ============================================================
def register_user(username, email, password_hash, role="Student"):
    """
    Registra un nuovo utente.
    """

    try:
        if not username or not email or not password_hash:
            return {
                "code": 400,
                "data": [],
                "message": "Tutti i campi sono obbligatori."
            }

        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO Users (username, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (username, email, password_hash, role))
        connection.commit()

        return {
            "code": 201,
            "data": {
                "user_id": cursor.lastrowid,
                "username": username,
                "email": email
            },
            "message": "Utente registrato con successo!"
        }

    except Error as e:
        # Duplicate email o username
        if "Duplicate entry" in str(e):
            return {
                "code": 400,
                "data": [],
                "message": "L'utente esiste già."
            }

        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la registrazione: {e}"
        }

    finally:
        try:
            cursor.close()
            connection.close()
        except:
            pass


# ============================================================
# 2️⃣ Login utente (verifica credenziali)
# ============================================================
def get_user(email):
    """
    Verifica le credenziali dell'utente (autenticazione base).
    """

    try:
        if not email:
            return {
                "code": 400,
                "data": [],
                "message": "Email è obbligatoria."
            }

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT user_id, username, email, role, password_hash
            FROM Users
            WHERE email = %s
            LIMIT 1
        """
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if not user:
            return {
                "code": 404,
                "data": [],
                "message": "Utente non trovato."
            }

        return {
            "code": 200,
            "data": user,
            "message": "User retrieved."
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il login: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 3️⃣ Recupera tutti gli utenti
# ============================================================
def get_all_users():
    """
    Restituisce tutti gli utenti.
    """
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT user_id, username, email, role, created_at
            FROM Users
            ORDER BY created_at DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()

        if not results:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun utente trovato."
            }

        return {
            "code": 200,
            "data": results,
            "message": "Utenti recuperati con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero utenti: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 4️⃣ Recupera utente per ID
# ============================================================
def get_user_by_id(user_id):
    """
    Restituisce un singolo utente tramite ID.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT user_id, username, email, role, created_at
            FROM Users
            WHERE user_id = %s
        """

        cursor.execute(query, (user_id,))
        user = cursor.fetchone()

        if not user:
            return {
                "code": 404,
                "data": [],
                "message": "Utente non trovato."
            }

        return {
            "code": 200,
            "data": user,
            "message": "Utente recuperato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il recupero dell'utente: {e}"
        }

    finally:
        cursor.close()
        connection.close()



# ============================================================
# 5️⃣ Recupera utente per email
# ============================================================
def get_user_by_email(email):
    """
    Restituisce un utente tramite email.
    """

    try:
        if not email:
            return {
                "code": 400,
                "data": [],
                "message": "Email obbligatoria."
            }

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT user_id, username, email, role, created_at
            FROM Users
            WHERE email = %s
        """

        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if not user:
            return {
                "code": 404,
                "data": [],
                "message": "Nessun utente trovato con questa email."
            }

        return {
            "code": 200,
            "data": user,
            "message": "Utente recuperato con successo per email!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante la ricerca utente per email: {e}"
        }

    finally:
        cursor.close()
        connection.close()


# ============================================================
# 6️⃣ Aggiorna un utente
# ============================================================
def update_user(user_id, username=None, email=None, role=None, password_hash=None):
    """
    Aggiorna i dati di un utente (username, email, role o password_hash).
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        fields = []
        values = []

        if username:
            fields.append("username = %s")
            values.append(username)
        if email:
            fields.append("email = %s")
            values.append(email)
        if role:
            fields.append("role = %s")
            values.append(role)
        if password_hash:
            fields.append("password_hash = %s")
            values.append(password_hash)

        if not fields:
            return {
                "code": 400,
                "data": [],
                "message": "Nessun campo da aggiornare."
            }

        # Prepara query
        values.append(user_id)
        query = f"UPDATE Users SET {', '.join(fields)} WHERE user_id = %s"

        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Utente non trovato o nessuna modifica effettuata."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Utente aggiornato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'aggiornamento dell'utente: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 7️⃣ Elimina un utente
# ============================================================
def delete_user(user_id):
    """
    Elimina un utente in base al suo ID.
    """

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "DELETE FROM Users WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        connection.commit()

        if cursor.rowcount == 0:
            return {
                "code": 404,
                "data": [],
                "message": "Utente non trovato o già eliminato."
            }

        return {
            "code": 200,
            "data": [],
            "message": "Utente eliminato con successo!"
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante l'eliminazione dell'utente: {e}"
        }

    finally:
        cursor.close()
        connection.close()

# ============================================================
# 8️⃣ Controlla se un'email esiste già
# ============================================================
def check_email_exists(email):
    """
    Controlla se un'email è già registrata nel sistema.
    """
    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = "SELECT COUNT(*) FROM Users WHERE email = %s"
        cursor.execute(query, (email,))
        count = cursor.fetchone()[0]

        return {
            "code": 200,
            "data": {"exists": count > 0},
            "message": "Email già registrata." if count > 0 else "Email disponibile."
        }

    except Error as e:
        return {
            "code": 500,
            "data": [],
            "message": f"Errore durante il controllo email: {e}"
        }

    finally:
        cursor.close()
        connection.close()

