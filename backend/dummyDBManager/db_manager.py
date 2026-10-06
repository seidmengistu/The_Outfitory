class Database:
    """
    Context manager sicuro per gestire connessione e cursor MySQL.
    Ritorna se stesso, NON il cursor (così manteniamo rowcount/lastrowid).
    Uso:
        with Database() as db:
            db.execute("SQL", params)
            result = db.fetchall()
    """
    def __enter__(self):
        try:
            self.conn = mysql.connector.connect(
                host=u.HOST,
                user=u.USER,
                password=u.PASSWORD,
                database=u.DATABASE
            )
            self.cursor = self.conn.cursor(dictionary=True)
            return self  # <<< IMPORTANTE
        except Error as e:
            raise Exception(f"Errore di connessione al database: {e}")

    def execute(self, query, params=None):
        self.cursor.execute(query, params or ())

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchall(self):
        return self.cursor.fetchall()

    @property
    def lastrowid(self):
        return self.cursor.lastrowid

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.conn.rollback()
            else:
                self.conn.commit()
        finally:
            self.cursor.close()
            self.conn.close()



# ============================================================
#  CLOTHES CRUD OPERATIONS
# ============================================================

# 1️⃣ CREATE — Aggiungi vestito
def add_cloth(user_id, name, category=None, season=None,
              occasion=None, image_url=None, notes=None,
              pattern=None, primary_color=None, secondary_color=None, typeCloth=None):

    u.reset_response()

    if not user_id or not name:
        return u.bad_request("user_id e name sono obbligatori.")

    try:
        with Database() as db:
            db.execute("""
                INSERT INTO Clothes 
                (user_id, name, category, season, occasion, image_url, notes,
                 pattern, primary_color, secondary_color, typeCloth)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id, name, category, season, occasion, image_url, notes,
                pattern, primary_color, secondary_color, typeCloth
            ))

        return u.created("Vestito aggiunto con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'inserimento del vestito: {e}")



# 2️⃣ READ — Tutti i vestiti dell’utente
def get_all_clothes_of_user(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT *
                FROM Clothes
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))

            rows = db.fetchall()

        if not rows:
            return u.not_found("Nessun vestito trovato per questo utente.")

        return u.success(rows, message="Vestiti recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero dei vestiti: {e}")



# 3️⃣ READ — Singolo vestito
def get_cloth_of_user(user_id, cloth_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT *
                FROM Clothes
                WHERE user_id = %s AND cloth_id = %s
            """, (user_id, cloth_id))

            row = db.fetchone()

        if not row:
            return u.not_found("Nessun vestito trovato per questo utente.")

        return u.success(row, message="Vestito recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero del vestito: {e}")



# 4️⃣ READ — Filtra vestiti dinamicamente
def filter_clothes(user_id, filters, order_by="created_at", order_dir="DESC"):
    u.reset_response()

    try:
        query = "SELECT * FROM Clothes WHERE user_id = %s"
        values = [user_id]

        # FILTRI DINAMICI
        for key, value in filters.items():

            if value is None or value == "":
                continue

            # Range
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

            # Like
            query += f" AND {key} LIKE %s"
            values.append(f"%{value}%")

        # ORDINAMENTO
        allowed_fields = [
            "created_at", "name", "category", "season", "occasion", "notes",
            "pattern", "primary_color", "secondary_color", "typeCloth"
        ]
        allowed_dir = ["ASC", "DESC"]

        if order_by not in allowed_fields:
            order_by = "created_at"
        if order_dir.upper() not in allowed_dir:
            order_dir = "DESC"

        query += f" ORDER BY {order_by} {order_dir.upper()}"

        with Database() as db:
            db.execute(query, tuple(values))
            rows = db.fetchall()

        if not rows:
            return u.not_found("Nessun vestito trovato con questi filtri.")

        return u.success(rows, message="Vestiti filtrati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il filtraggio: {e}")



# 5️⃣ UPDATE — Aggiorna vestito
def update_cloth(user_id, cloth_id, **fields):
    u.reset_response()

    try:
        updates = []
        values = []

        allowed_fields = [
            "name", "category", "season", "occasion", "image_url", "notes",
            "pattern", "primary_color", "secondary_color", "typeCloth"
        ]

        for field in allowed_fields:
            if fields.get(field) is not None:
                updates.append(f"{field} = %s")
                values.append(fields[field])

        if not updates:
            return u.bad_request("Nessun campo da aggiornare.")

        values.extend([user_id, cloth_id])

        with Database() as db:
            db.execute(
                f"UPDATE Clothes SET {', '.join(updates)} WHERE user_id = %s AND cloth_id = %s",
                tuple(values)
            )

            if db.rowcount == 0:
                return u.not_found("Vestito non trovato o nessuna modifica effettuata.")

        return u.success(message="Vestito aggiornato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento del vestito: {e}")



# 6️⃣ DELETE — Elimina vestito
def delete_cloth(user_id, cloth_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute(
                "DELETE FROM Clothes WHERE user_id = %s AND cloth_id = %s",
                (user_id, cloth_id)
            )
            if db.rowcount == 0:
                return u.not_found("Vestito non trovato o già eliminato.")

        return u.success(message="Vestito eliminato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione del vestito: {e}")
    







#### ===========================================
#### OUTFITS CRUD OPERATIONS
#### ===========================================
# ============================================================
# 1️⃣ Crea un nuovo outfit
# ============================================================
# ============================================================
#  OUTFITS CRUD OPERATIONS
# ============================================================

# 1️⃣ CREATE — Crea nuovo outfit
def add_outfit(user_id, name, description="", clothes=None):
    u.reset_response()

    if not user_id or not name:
        return u.bad_request("user_id e name sono obbligatori.")

    clothes = clothes or []  # lista di cloth_id

    try:
        with Database() as db:

            # Inserisci outfit
            db.execute("""
                INSERT INTO Outfits (user_id, name, description)
                VALUES (%s, %s, %s)
            """, (user_id, name, description))

            outfit_id = db.lastrowid

            # Inserisci vestiti collegati
            if clothes:
                for cloth_id in clothes:
                    db.execute("""
                        INSERT INTO OutfitItems (outfit_id, cloth_id)
                        VALUES (%s, %s)
                    """, (outfit_id, cloth_id))

        return u.created(
            f"Outfit '{name}' creato con successo!",
            data={"outfit_id": outfit_id}
        )

    except Exception as e:
        return u.generic_error(f"Errore durante la creazione dell'outfit: {e}")



# 2️⃣ READ — Recupera tutti gli outfit dell’utente
def get_all_outfits(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT *
                FROM Outfits
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))

            outfits = db.fetchall()

        if not outfits:
            return u.not_found("Nessun outfit trovato per questo utente.")

        return u.success(outfits, message="Outfit recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero degli outfit: {e}")



# 3️⃣ READ — Recupera un singolo outfit + i suoi vestiti
def get_outfit(user_id, outfit_id):
    u.reset_response()

    try:
        with Database() as db:

            # Recupera outfit
            db.execute("""
                SELECT *
                FROM Outfits
                WHERE user_id = %s AND outfit_id = %s
            """, (user_id, outfit_id))

            outfit = db.fetchone()
            if not outfit:
                return u.not_found("Outfit non trovato per questo utente.")

            # Recupera vestiti collegati
            db.execute("""
                SELECT c.*
                FROM Clothes c
                JOIN OutfitItems oi ON c.cloth_id = oi.cloth_id
                WHERE oi.outfit_id = %s
            """, (outfit_id,))

            clothes = db.fetchall()
            outfit["clothes"] = clothes

        return u.success(outfit, message="Outfit recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero dell'outfit: {e}")



# 4️⃣ UPDATE — Aggiorna outfit + lista vestiti
def update_outfit(user_id, outfit_id, name=None, description=None, clothes=None):
    u.reset_response()

    try:
        with Database() as db:

            # Aggiornamento campi base
            updates = []
            values = []

            if name:
                updates.append("name = %s")
                values.append(name)

            if description:
                updates.append("description = %s")
                values.append(description)

            if updates:
                values.extend([user_id, outfit_id])
                db.execute(
                    f"UPDATE Outfits SET {', '.join(updates)} WHERE user_id = %s AND outfit_id = %s",
                    tuple(values)
                )

            # Aggiorna lista di vestiti
            if clothes is not None:
                db.execute("DELETE FROM OutfitItems WHERE outfit_id = %s", (outfit_id,))
                for cloth_id in clothes:
                    db.execute(
                        "INSERT INTO OutfitItems (outfit_id, cloth_id) VALUES (%s, %s)",
                        (outfit_id, cloth_id)
                    )

        return u.success(message="Outfit aggiornato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento dell'outfit: {e}")



# 5️⃣ DELETE — Elimina outfit + relazioni
def delete_outfit(user_id, outfit_id):
    u.reset_response()

    try:
        with Database() as db:

            # Prima elimina outfit items
            db.execute(
                "DELETE FROM OutfitItems WHERE outfit_id = %s",
                (outfit_id,)
            )

            # Poi elimina outfit
            db.execute(
                "DELETE FROM Outfits WHERE user_id = %s AND outfit_id = %s",
                (user_id, outfit_id)
            )

            if db.rowcount == 0:
                return u.not_found("Outfit non trovato o già eliminato.")

        return u.success(message="Outfit eliminato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione dell'outfit: {e}")



# 6️⃣ FILTER — Filtri dinamici sugli outfit
def filter_outfits(user_id, filters, order_by="created_at", order_dir="DESC"):
    u.reset_response()

    try:
        allowed_filters = {
            "name",
            "description",
            "created_at__gte",
            "created_at__lte"
        }

        query = "SELECT * FROM Outfits WHERE user_id = %s"
        values = [user_id]

        # Costruzione dinamica
        for key, value in filters.items():

            if key not in allowed_filters or value in (None, ""):
                continue

            if key == "created_at__gte":
                query += " AND created_at >= %s"
                values.append(value)
                continue

            if key == "created_at__lte":
                query += " AND created_at <= %s"
                values.append(value)
                continue

            if isinstance(value, list):
                placeholders = ", ".join(["%s"] * len(value))
                col = key.split("__")[0]
                query += f" AND {col} IN ({placeholders})"
                values.extend(value)
                continue

            # LIKE case insensitive
            query += f" AND LOWER({key}) LIKE %s"
            values.append(f"%{str(value).lower()}%")

        # Ordine
        allowed_order_fields = ["created_at", "name", "description"]
        allowed_order_dir = ["ASC", "DESC"]

        if order_by not in allowed_order_fields:
            order_by = "created_at"

        if order_dir.upper() not in allowed_order_dir:
            order_dir = "DESC"

        query += f" ORDER BY {order_by} {order_dir.upper()}"

        with Database() as db:
            db.execute(query, tuple(values))
            result = db.fetchall()

        if not result:
            return u.not_found("Nessun outfit trovato con questi filtri.")

        return u.success(result, message="Outfit filtrati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il filtraggio degli outfit: {e}")



# 7️⃣ SEARCH — Cerca outfit per nome (LIKE)
def get_outfit_id_by_name(user_id, outfit_name):
    u.reset_response()

    if not outfit_name:
        return u.bad_request("Il nome dell'outfit è obbligatorio.")

    try:
        with Database() as db:
            db.execute("""
                SELECT outfit_id, name
                FROM Outfits
                WHERE user_id = %s
                  AND name LIKE %s
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id, f"%{outfit_name}%"))

            row = db.fetchone()

        if not row:
            return u.not_found(f"Nessun outfit trovato simile a '{outfit_name}'.")

        return u.success(row, message="Outfit trovato!")

    except Exception as e:
        return u.generic_error(f"Errore durante la ricerca dell'outfit: {e}")










#### ===========================================
#### CALENDAR CRUD OPERATIONS
#### ===========================================




# ============================================================
#  CALENDAR CRUD OPERATIONS
# ============================================================

# 1️⃣ CREATE — Aggiungi evento al calendario
def add_calendar_entry(user_id, outfit_id, date):
    u.reset_response()

    if not user_id or not outfit_id or not date:
        return u.bad_request("user_id, outfit_id e date sono obbligatori.")

    try:
        with Database() as db:
            db.execute("""
                INSERT INTO Calendar (user_id, outfit_id, date)
                VALUES (%s, %s, %s)
            """, (user_id, outfit_id, date))

            calendar_id = db.lastrowid

        return u.created(
            "Evento aggiunto al calendario con successo!",
            data={"calendar_id": calendar_id}
        )

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiunta dell'evento: {e}")



# 2️⃣ READ — Recupera tutte le pianificazioni dell’utente
def get_all_calendar_entries(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
                FROM Calendar c
                JOIN Outfits o ON c.outfit_id = o.outfit_id
                WHERE c.user_id = %s
                ORDER BY c.date ASC
            """, (user_id,))

            rows = db.fetchall()

        if not rows:
            return u.not_found("Nessuna pianificazione trovata per questo utente.")

        return u.success(rows, message="Eventi del calendario recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero delle pianificazioni: {e}")



# 3️⃣ READ — Recupera singolo evento
def get_calendar_entry(user_id, calendar_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
                FROM Calendar c
                JOIN Outfits o ON c.outfit_id = o.outfit_id
                WHERE c.user_id = %s AND c.calendar_id = %s
            """, (user_id, calendar_id))

            row = db.fetchone()

        if not row:
            return u.not_found("Evento non trovato nel calendario.")

        return u.success(row, message="Evento del calendario recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero dell'evento: {e}")



# 4️⃣ UPDATE — Aggiorna un evento del calendario
def update_calendar_entry(user_id, calendar_id, outfit_id=None, date=None):
    u.reset_response()

    try:
        updates = []
        values = []

        if outfit_id:
            updates.append("outfit_id = %s")
            values.append(outfit_id)

        if date:
            updates.append("date = %s")
            values.append(date)

        if not updates:
            return u.bad_request("Nessun campo da aggiornare.")

        values.extend([user_id, calendar_id])

        with Database() as db:
            db.execute(
                f"UPDATE Calendar SET {', '.join(updates)} WHERE user_id = %s AND calendar_id = %s",
                tuple(values)
            )

            if db.rowcount == 0:
                return u.not_found("Evento non trovato o nessuna modifica effettuata.")

        return u.success(message="Evento del calendario aggiornato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento dell'evento: {e}")



# 5️⃣ DELETE — Elimina evento
def delete_calendar_entry(user_id, calendar_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute(
                "DELETE FROM Calendar WHERE user_id = %s AND calendar_id = %s",
                (user_id, calendar_id)
            )

            if db.rowcount == 0:
                return u.not_found("Evento non trovato o già eliminato.")

        return u.success(message="Evento del calendario eliminato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione dell'evento: {e}")



# 6️⃣ READ — Eventi di una data specifica
def get_calendar_by_date(user_id, date):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
                FROM Calendar c
                JOIN Outfits o ON c.outfit_id = o.outfit_id
                WHERE c.user_id = %s AND c.date = %s
                ORDER BY c.date ASC
            """, (user_id, date))

            rows = db.fetchall()

        if not rows:
            return u.not_found(f"Nessuna pianificazione trovata per il giorno {date}.")

        return u.success(rows, message=f"Eventi del {date} recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero delle pianificazioni giornaliere: {e}")



# 7️⃣ READ — Eventi della settimana corrente
def get_calendar_current_week(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT c.calendar_id, c.date, o.name AS outfit_name, o.description
                FROM Calendar c
                JOIN Outfits o ON c.outfit_id = o.outfit_id
                WHERE c.user_id = %s
                  AND YEARWEEK(c.date, 1) = YEARWEEK(CURDATE(), 1)
                ORDER BY c.date ASC
            """, (user_id,))

            rows = db.fetchall()

        if not rows:
            return u.not_found("Nessuna pianificazione trovata per la settimana corrente.")

        return u.success(rows, message="Eventi della settimana corrente recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero delle pianificazioni settimanali: {e}")



# ============================================================
#  TRAVEL LIST CRUD & RELATIONS
# ============================================================

# 1️⃣ CREATE — Crea una nuova TravelList
def add_travel(user_id, name, start_date, end_date):
    u.reset_response()

    if not all([user_id, name, start_date, end_date]):
        return u.bad_request("Tutti i campi (user_id, name, start_date, end_date) sono obbligatori.")

    try:
        with Database() as db:
            db.execute("""
                INSERT INTO TravelList (user_id, name, start_date, end_date)
                VALUES (%s, %s, %s, %s)
            """, (user_id, name, start_date, end_date))

            travel_id = db.lastrowid

        return u.created(
            "Viaggio creato con successo!",
            data={"travel_id": travel_id}
        )

    except Exception as e:
        return u.generic_error(f"Errore durante la creazione del viaggio: {e}")



# 2️⃣ READ — Recupera tutte le TravelList dell’utente
def get_all_travels(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT *
                FROM TravelList
                WHERE user_id = %s
                ORDER BY start_date ASC
            """, (user_id,))

            results = db.fetchall()

        if not results:
            return u.not_found("Nessuna lista di viaggio trovata per questo utente.")

        return u.success(results, message="Liste di viaggio recuperate con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero delle TravelList: {e}")



# 3️⃣ READ — Recupera una TravelList + capi associati
def get_travel(user_id, travel_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT t.travel_id, t.name, t.start_date, t.end_date,
                       c.cloth_id, c.name AS cloth_name, c.category,
                       c.season, c.pattern, c.primary_color,
                       c.secondary_color, c.typeCloth
                FROM TravelList t
                LEFT JOIN TravelItems ti ON t.travel_id = ti.travel_id
                LEFT JOIN Clothes c ON ti.cloth_id = c.cloth_id
                WHERE t.user_id = %s AND t.travel_id = %s
            """, (user_id, travel_id))

            rows = db.fetchall()

        if not rows:
            return u.not_found("Nessun viaggio trovato per questo utente.")

        # Ricostruzione oggetto TravelList
        travel = {
            "travel_id": rows[0]["travel_id"],
            "name": rows[0]["name"],
            "start_date": str(rows[0]["start_date"]),
            "end_date": str(rows[0]["end_date"]),
            "clothes": []
        }

        for row in rows:
            if row["cloth_id"]:
                travel["clothes"].append({
                    "cloth_id": row["cloth_id"],
                    "cloth_name": row["cloth_name"],
                    "category": row["category"],
                    "season": row["season"],
                    "pattern": row["pattern"],
                    "primary_color": row["primary_color"],
                    "secondary_color": row["secondary_color"],
                    "typeCloth": row["typeCloth"]
                })

        return u.success(travel, message="Viaggio recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero del viaggio: {e}")



# 4️⃣ UPDATE — Aggiorna una TravelList
def update_travel(user_id, travel_id, name=None, start_date=None, end_date=None):
    u.reset_response()

    try:
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
            return u.bad_request("Nessun campo da aggiornare.")

        values.extend([user_id, travel_id])

        with Database() as db:
            db.execute(
                f"UPDATE TravelList SET {', '.join(updates)} WHERE user_id = %s AND travel_id = %s",
                tuple(values)
            )

            if db.rowcount == 0:
                return u.not_found("Viaggio non trovato o nessuna modifica effettuata.")

        return u.success(message="Viaggio aggiornato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento del viaggio: {e}")



# 5️⃣ DELETE — Elimina una TravelList
def delete_travel(user_id, travel_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute(
                "DELETE FROM TravelList WHERE user_id = %s AND travel_id = %s",
                (user_id, travel_id)
            )

            if db.rowcount == 0:
                return u.not_found("Viaggio non trovato o già eliminato.")

        return u.success(message="Viaggio eliminato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione del viaggio: {e}")



# 6️⃣ ADD — Aggiungi un capo a una TravelList
def add_cloth_to_travel(travel_id, cloth_id):
    u.reset_response()

    if not travel_id or not cloth_id:
        return u.bad_request("travel_id e cloth_id sono obbligatori.")

    try:
        with Database() as db:
            db.execute(
                "INSERT INTO TravelItems (travel_id, cloth_id) VALUES (%s, %s)",
                (travel_id, cloth_id)
            )

        return u.created("Capo aggiunto alla valigia!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiunta del capo alla valigia: {e}")



# 7️⃣ REMOVE — Rimuovi un capo dalla TravelList
def remove_cloth_from_travel(travel_id, cloth_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute(
                "DELETE FROM TravelItems WHERE travel_id = %s AND cloth_id = %s",
                (travel_id, cloth_id)
            )

            if db.rowcount == 0:
                return u.not_found("Capo non trovato nella valigia.")

        return u.success(message="Capo rimosso dalla valigia!")

    except Exception as e:
        return u.generic_error(f"Errore durante la rimozione del capo: {e}")





# ============================================================
#  COLLECTION CRUD & PLAYLIST-LIKE OPERATIONS
# ============================================================

# 1️⃣ CREATE — Crea una nuova Collection
def add_collection(user_id, name, description=None):
    u.reset_response()

    if not user_id or not name:
        return u.bad_request("user_id e name sono obbligatori.")

    try:
        with Database() as db:
            db.execute("""
                INSERT INTO Collections (user_id, name, description)
                VALUES (%s, %s, %s)
            """, (user_id, name, description))

            collection_id = db.lastrowid

        return u.created(
            "Collection creata con successo!",
            data={"collection_id": collection_id}
        )

    except Exception as e:
        return u.generic_error(f"Errore durante la creazione della collection: {e}")



# 2️⃣ READ — Recupera tutte le Collection di un utente
def get_all_collections(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT collection_id, name, description, created_at
                FROM Collections
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))

            results = db.fetchall()

        if not results:
            return u.not_found("Nessuna collection trovata per questo utente.")

        return u.success(results, message="Collections recuperate con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero delle collections: {e}")



# 3️⃣ READ — Recupera una singola Collection + i suoi outfit
def get_collection(user_id, collection_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT c.collection_id, c.name AS collection_name, c.description, c.created_at,
                       o.outfit_id, o.name AS outfit_name, o.description AS outfit_description
                FROM Collections c
                LEFT JOIN CollectionOutfits co ON c.collection_id = co.collection_id
                LEFT JOIN Outfits o ON co.outfit_id = o.outfit_id
                WHERE c.user_id = %s AND c.collection_id = %s
            """, (user_id, collection_id))

            rows = db.fetchall()

        if not rows:
            return u.not_found("Collection non trovata.")

        # Ricostruzione oggetto collection
        collection = {
            "collection_id": rows[0]["collection_id"],
            "name": rows[0]["collection_name"],
            "description": rows[0]["description"],
            "created_at": str(rows[0]["created_at"]),
            "outfits": []
        }

        for row in rows:
            if row["outfit_id"]:
                collection["outfits"].append({
                    "outfit_id": row["outfit_id"],
                    "outfit_name": row["outfit_name"],
                    "description": row["outfit_description"]
                })

        return u.success(collection, message="Collection recuperata con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero della collection: {e}")



# 4️⃣ READ — Recupera una Collection per nome (case-insensitive, parziale)
def get_collection_by_name(user_id, collection_name):
    u.reset_response()

    if not collection_name:
        return u.bad_request("collection_name è obbligatorio.")

    try:
        with Database() as db:
            db.execute("""
                SELECT c.collection_id, c.name AS collection_name, c.description, c.created_at,
                       o.outfit_id, o.name AS outfit_name, o.description AS outfit_description
                FROM Collections c
                LEFT JOIN CollectionOutfits co ON c.collection_id = co.collection_id
                LEFT JOIN Outfits o ON co.outfit_id = o.outfit_id
                WHERE c.user_id = %s AND c.name LIKE %s
            """, (user_id, f"%{collection_name}%"))

            rows = db.fetchall()

        if not rows:
            return u.not_found(f"Nessuna collection trovata simile a '{collection_name}'.")

        collection = {
            "collection_id": rows[0]["collection_id"],
            "name": rows[0]["collection_name"],
            "description": rows[0]["description"],
            "created_at": str(rows[0]["created_at"]),
            "outfits": []
        }

        for row in rows:
            if row["outfit_id"]:
                collection["outfits"].append({
                    "outfit_id": row["outfit_id"],
                    "outfit_name": row["outfit_name"],
                    "description": row["outfit_description"]
                })

        return u.success(collection, message="Collection recuperata con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero della collection per nome: {e}")



# 5️⃣ UPDATE — Aggiorna una Collection
def update_collection(user_id, collection_id, name=None, description=None):
    u.reset_response()

    try:
        updates = []
        values = []

        if name:
            updates.append("name = %s")
            values.append(name)

        if description:
            updates.append("description = %s")
            values.append(description)

        if not updates:
            return u.bad_request("Nessun campo da aggiornare.")

        values.extend([user_id, collection_id])

        with Database() as db:
            db.execute(
                f"UPDATE Collections SET {', '.join(updates)} WHERE user_id = %s AND collection_id = %s",
                tuple(values)
            )

            if db.rowcount == 0:
                return u.not_found("Collection non trovata o nessuna modifica effettuata.")

        return u.success(message="Collection aggiornata con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento della collection: {e}")



# 6️⃣ DELETE — Elimina una Collection + outfit collegati
def delete_collection(user_id, collection_id):
    u.reset_response()

    try:
        with Database() as db:
            # elimina relazioni
            db.execute(
                "DELETE FROM CollectionOutfits WHERE collection_id = %s",
                (collection_id,)
            )

            # elimina collection
            db.execute(
                "DELETE FROM Collections WHERE user_id = %s AND collection_id = %s",
                (user_id, collection_id)
            )

            if db.rowcount == 0:
                return u.not_found("Collection non trovata o già eliminata.")

        return u.success(message=f"Collection {collection_id} eliminata con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione della collection: {e}")



# 7️⃣ ADD — Aggiungi un outfit a una Collection (con controlli)
def add_outfit_to_collection(collection_id, outfit_id):
    u.reset_response()

    if not collection_id or not outfit_id:
        return u.bad_request("collection_id e outfit_id sono obbligatori.")

    try:
        with Database() as db:

            # Controlla esistenza collection
            db.execute("SELECT 1 FROM Collections WHERE collection_id = %s", (collection_id,))
            if not db.fetchone():
                return u.not_found(f"Collection {collection_id} non trovata.")

            # Controlla esistenza outfit
            db.execute("SELECT 1 FROM Outfits WHERE outfit_id = %s", (outfit_id,))
            if not db.fetchone():
                return u.not_found(f"Outfit {outfit_id} non trovato.")

            # Verifica duplicato
            db.execute("""
                SELECT 1 FROM CollectionOutfits
                WHERE collection_id = %s AND outfit_id = %s
            """, (collection_id, outfit_id))
            if db.fetchone():
                return {
                    "code": 409,
                    "message": f"L'outfit {outfit_id} è già presente nella collection {collection_id}."
                }

            # Inserisci relazione
            db.execute("""
                INSERT INTO CollectionOutfits (collection_id, outfit_id)
                VALUES (%s, %s)
            """, (collection_id, outfit_id))

        return u.created(f"Outfit {outfit_id} aggiunto correttamente alla collection {collection_id}.")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiunta dell'outfit: {e}")



# 8️⃣ REMOVE — Rimuovi un outfit da una Collection
def remove_outfit_from_collection(collection_id, outfit_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute(
                "DELETE FROM CollectionOutfits WHERE collection_id = %s AND outfit_id = %s",
                (collection_id, outfit_id)
            )

            if db.rowcount == 0:
                return u.not_found("Outfit non trovato nella collection.")

        return u.success(message="Outfit rimosso dalla collection!")

    except Exception as e:
        return u.generic_error(f"Errore durante la rimozione dell'outfit: {e}")


# ============================================================
#  USER CRUD + AUTHENTICATION QUERIES
# ============================================================


# 1️⃣ REGISTER — Crea un nuovo utente
def register_user(username, email, password_hash, role="Student"):
    u.reset_response()

    if not username or not email or not password_hash:
        return u.bad_request("username, email e password sono obbligatori.")

    try:
        with Database() as db:
            db.execute("""
                INSERT INTO Users (username, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
            """, (username, email, password_hash, role))

            user_id = db.lastrowid

        return u.created(
            "Utente registrato con successo!",
            data={"user_id": user_id, "username": username, "email": email}
        )

    except Exception as e:
        if "Duplicate entry" in str(e):
            return u.error(400, "User already exists.")
        return u.generic_error(f"Errore durante la registrazione: {e}")



# 2️⃣ LOGIN — Recupera utente per email (per verificare password)
def get_user(email):
    u.reset_response()

    if not email:
        return u.bad_request("Email obbligatoria.")

    try:
        with Database() as db:
            db.execute("""
                SELECT user_id, username, email, role, password_hash
                FROM Users
                WHERE email = %s LIMIT 1
            """, (email,))

            user = db.fetchone()

        if not user:
            return u.not_found("Utente non trovato.")

        return u.success(user, message="User retrieved.")

    except Exception as e:
        return u.generic_error(f"Errore durante il login: {e}")



# 3️⃣ READ — Tutti gli utenti
def get_all_users():
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT user_id, username, email, role, created_at
                FROM Users
                ORDER BY created_at DESC
            """)

            users = db.fetchall()

        if not users:
            return u.not_found("Nessun utente trovato.")

        return u.success(users, message="Utenti recuperati con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero utenti: {e}")



# 4️⃣ READ — Recupera utente per ID
def get_user_by_id(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT user_id, username, email, role, created_at
                FROM Users
                WHERE user_id = %s
            """, (user_id,))

            user = db.fetchone()

        if not user:
            return u.not_found("Utente non trovato.")

        return u.success(user, message="Utente recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante il recupero utente: {e}")



# 5️⃣ READ — Recupera utente per email (senza password)
def get_user_by_email(email):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("""
                SELECT user_id, username, email, role, created_at
                FROM Users
                WHERE email = %s
            """, (email,))

            user = db.fetchone()

        if not user:
            return u.not_found("Nessun utente con questa email.")

        return u.success(user, message="Utente recuperato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante la ricerca utente per email: {e}")



# 6️⃣ UPDATE — Aggiorna un utente
def update_user(user_id, username=None, email=None, role=None, password_hash=None):
    u.reset_response()

    try:
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
            return u.bad_request("Nessun campo da aggiornare.")

        values.append(user_id)

        with Database() as db:
            db.execute(
                f"UPDATE Users SET {', '.join(fields)} WHERE user_id = %s",
                tuple(values)
            )

            if db.rowcount == 0:
                return u.not_found("Utente non trovato o nessuna modifica.")

        return u.success(message="Utente aggiornato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'aggiornamento utente: {e}")



# 7️⃣ DELETE — Elimina utente
def delete_user(user_id):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("DELETE FROM Users WHERE user_id = %s", (user_id,))

            if db.rowcount == 0:
                return u.not_found("Utente non trovato o già eliminato.")

        return u.success(message="Utente eliminato con successo!")

    except Exception as e:
        return u.generic_error(f"Errore durante l'eliminazione utente: {e}")



# 8️⃣ CHECK — Controlla se email già esiste
def check_email_exists(email):
    u.reset_response()

    try:
        with Database() as db:
            db.execute("SELECT COUNT(*) AS count FROM Users WHERE email = %s", (email,))
            result = db.fetchone()

        exists = result["count"] > 0

        return u.success(
            {"exists": exists},
            message="Email già registrata." if exists else "Email disponibile."
        )

    except Exception as e:
        return u.generic_error(f"Errore durante il controllo email: {e}")
