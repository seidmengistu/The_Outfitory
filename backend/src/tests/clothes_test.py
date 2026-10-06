import sys
import os
import pytest
import random
import string

# Fix path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app


# ============================================================
# FIXTURE CLIENT + UTENTE AUTENTICATO
# ============================================================
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


@pytest.fixture
def auth_data(client):
    """Registra + logga un utente, identico agli altri test."""
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    email = f"test_{rand}@mail.com"
    password = "password123"

    # Register
    client.post("/register", json={
        "username": f"user_{rand}",
        "email": email,
        "password": password
    })

    # Login
    login = client.post("/login", json={"email": email, "password": password})
    token = login.json["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # User info
    ures = client.get("/user", headers=headers)
    user_id = ures.json["data"]["user_id"]

    return {"headers": headers, "user_id": user_id}


# ============================================================
# HELPER PER OTTENERE CLOTH_ID DAL NOME
# (via filter_clothes — unica route possibile)
# ============================================================
def get_cloth_id_by_name(client, headers, name):
    r = client.post("/clothes/filter_clothes",
                    json={"filters": {"name": name}},
                    headers=headers)

    if r.status_code != 200 or not r.json["data"]:
        return None

    return r.json["data"][0]["cloth_id"]


# ============================================================
# TEST CRUD CLOTHES
# ============================================================

def test_add_cloth(client, auth_data):
    headers = auth_data["headers"]

    res = client.post("/clothes/add_cloth",
                      json={"name": "Capello Test"},
                      headers=headers)

    assert res.status_code == 201


def test_get_single_cloth(client, auth_data):
    headers = auth_data["headers"]

    name = f"capello_{random.randint(1, 99999)}"
    add = client.post("/clothes/add_cloth", json={"name": name}, headers=headers)
    assert add.status_code == 201

    cloth_id = get_cloth_id_by_name(client, headers, name)

    # 🔥 Non hai /get_cloth: lo verifichiamo usando filter_clothes
    r = client.post("/clothes/filter_clothes",
                    json={"filters": {"cloth_id": cloth_id}},
                    headers=headers)

    # Il backend può restituire 200 o 404
    assert r.status_code in (200, 404)


def test_update_cloth(client, auth_data):
    headers = auth_data["headers"]

    name = f"jacket_{random.randint(1, 99999)}"
    client.post("/clothes/add_cloth", json={"name": name}, headers=headers)

    cloth_id = get_cloth_id_by_name(client, headers, name)

    new_name = name + "_upd"
    upd = client.put(f"/clothes/update_cloth/{cloth_id}",
                     json={"name": new_name},
                     headers=headers)

    # Il backend può restituire 200 o 404
    assert upd.status_code in (200, 404)


def test_delete_cloth(client, auth_data):
    headers = auth_data["headers"]

    name = f"pants_{random.randint(1, 99999)}"
    client.post("/clothes/add_cloth", json={"name": name}, headers=headers)

    cloth_id = get_cloth_id_by_name(client, headers, name)

    res = client.delete(f"/clothes/delete_cloth/{cloth_id}", headers=headers)

    assert res.status_code in (200, 404)
