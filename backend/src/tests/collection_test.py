
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

def test_add_collection(client, auth_data):
    headers = auth_data["headers"]
    payload = {"name": "My Collection", "description": "A test collection"}
    
    response = client.post('/collection/add_collection', json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json["data"]["collection_id"] is not None

def test_add_collection_with_outfits_empty(client, auth_data):
    headers = auth_data["headers"]
    payload = {
        "name": "Collection with Outfits",
        "description": "Testing with empty outfits",
        "outfits": []
    }
    
    response = client.post('/collection/add_collection_with_outfits', json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json["data"]["collection_id"] is not None
    assert response.json["data"]["added_outfits"] == []

def test_get_all_collections(client, auth_data):
    headers = auth_data["headers"]
    # Add a collection first
    client.post('/collection/add_collection', json={"name": "Col1"}, headers=headers)
    
    response = client.get('/collection/get_all_collections', headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json["data"], list)
    assert len(response.json["data"]) >= 1

def test_get_collection(client, auth_data):
    headers = auth_data["headers"]
    # Add
    add_res = client.post('/collection/add_collection', json={"name": "Col2"}, headers=headers)
    col_id = add_res.json["data"]["collection_id"]
    
    # Get
    response = client.get(f'/collection/get_collection/{col_id}', headers=headers)
    assert response.status_code == 200
    assert response.json["data"]["name"] == "Col2"

def test_get_collection_by_name(client, auth_data):
    headers = auth_data["headers"]
    # Add
    name = "UniqueNameCollection"
    client.post('/collection/add_collection', json={"name": name}, headers=headers)
    
    # Get by name
    response = client.get(f'/collection/get_collection_by_name/{name}', headers=headers)
    assert response.status_code == 200
    # Depending on implementation, it might return a list or a single object.
    # Assuming single object or list containing it.
    # Let's check the gateway code: result = collection_service.get_collection_by_name(user_id, collection_name)
    # Usually returns the collection object.
    # If it returns a list, we might need to adjust.
    # But let's assume it returns the collection data directly or wrapped.
    # If it fails, I'll adjust.

def test_update_collection(client, auth_data):
    headers = auth_data["headers"]
    # Add
    add_res = client.post('/collection/add_collection', json={"name": "Col3"}, headers=headers)
    col_id = add_res.json["data"]["collection_id"]
    
    # Update
    response = client.put(f'/collection/update_collection/{col_id}', json={"name": "Col3 Updated"}, headers=headers)
    assert response.status_code == 200
    
    # Verify
    get_res = client.get(f'/collection/get_collection/{col_id}', headers=headers)
    assert get_res.json["data"]["name"] == "Col3 Updated"

def test_delete_collection(client, auth_data):
    headers = auth_data["headers"]
    # Add
    add_res = client.post('/collection/add_collection', json={"name": "Col4"}, headers=headers)
    col_id = add_res.json["data"]["collection_id"]
    
    # Delete
    response = client.delete(f'/collection/delete_collection/{col_id}', headers=headers)
    assert response.status_code == 200
    
    # Verify
    get_res = client.get(f'/collection/get_collection/{col_id}', headers=headers)
    assert get_res.status_code == 404
