
import sys
import os
import pytest
import random
import string

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_data(client):
    """Registers and logs in a user, returning the token and user_id."""
    rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    username = f"testuser_{rand_suffix}"
    email = f"testuser_{rand_suffix}@example.com"
    password = "password123"
    
    # Register
    client.post('/register', json={"username": username, "email": email, "password": password})
    
    # Login
    login_res = client.post('/login', json={"email": email, "password": password})
    token = login_res.json["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get User ID
    user_res = client.get('/user', headers=headers)
    user_id = user_res.json["data"]["user_id"]
    
    return {"headers": headers, "user_id": user_id}

def test_add_travel(client, auth_data):
    user_id = auth_data["user_id"]
    payload = {
        "user_id": user_id,
        "name": "Paris Trip",
        "start_date": "2025-12-01",
        "end_date": "2025-12-07"
    }
    
    response = client.post('/travel/add_travel', json=payload)
    assert response.status_code == 201 or response.status_code == 200
    assert response.json["data"]["travel_id"] is not None

def test_get_all_travels(client, auth_data):
    user_id = auth_data["user_id"]
    # Add one
    client.post('/travel/add_travel', json={
        "user_id": user_id,
        "name": "London Trip",
        "start_date": "2025-11-01",
        "end_date": "2025-11-05"
    })
    
    response = client.get(f'/travel/get_all_travels/{user_id}')
    assert response.status_code == 200
    assert isinstance(response.json["data"], list)
    assert len(response.json["data"]) >= 1

def test_get_travel(client, auth_data):
    user_id = auth_data["user_id"]
    # Add
    add_res = client.post('/travel/add_travel', json={
        "user_id": user_id,
        "name": "Rome Trip",
        "start_date": "2025-10-01",
        "end_date": "2025-10-05"
    })
    travel_id = add_res.json["data"]["travel_id"]
    
    response = client.get(f'/travel/get_travel/{user_id}/{travel_id}')
    assert response.status_code == 200
    assert response.json["data"]["name"] == "Rome Trip"

def test_update_travel(client, auth_data):
    user_id = auth_data["user_id"]
    # Add
    add_res = client.post('/travel/add_travel', json={
        "user_id": user_id,
        "name": "Berlin Trip",
        "start_date": "2025-09-01",
        "end_date": "2025-09-05"
    })
    travel_id = add_res.json["data"]["travel_id"]
    
    # Update
    response = client.put(f'/travel/update_travel/{user_id}/{travel_id}', json={
        "name": "Berlin Trip Updated"
    })
    assert response.status_code == 200
    
    # Verify
    get_res = client.get(f'/travel/get_travel/{user_id}/{travel_id}')
    assert get_res.json["data"]["name"] == "Berlin Trip Updated"

def test_delete_travel(client, auth_data):
    user_id = auth_data["user_id"]
    # Add
    add_res = client.post('/travel/add_travel', json={
        "user_id": user_id,
        "name": "Tokyo Trip",
        "start_date": "2025-08-01",
        "end_date": "2025-08-05"
    })
    travel_id = add_res.json["data"]["travel_id"]
    
    # Delete
    response = client.delete(f'/travel/delete_travel/{user_id}/{travel_id}')
    assert response.status_code == 200
    
    # Verify
    get_res = client.get(f'/travel/get_travel/{user_id}/{travel_id}')
    assert get_res.status_code == 404
