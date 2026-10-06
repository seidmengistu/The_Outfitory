# Import sys module for modifying Python's runtime environment
import sys
# Import os module for interacting with the operating system
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app instance from the main app file
from app import app 
# Import pytest for writing and running tests
import pytest



@pytest.fixture
def client():
    """A test client for the app."""
    with app.test_client() as client:
        yield client

def test_register_and_login(client):
    """Test the Login and Register route."""
    # Register a new user
    register_payload = {"username": "newuser5", "password": "newpassword", "email": "newuser5@example.com"}
    register_response = client.post('/register', json=register_payload)
    # Check for both possible outcomes
    if register_response.status_code == 200:
        assert register_response.json == {"data": {}, "message": "User registered!", "ok": True}
    elif register_response.status_code == 400:
        assert register_response.json == {"data": {}, "message": "User already exists!", "ok": False}
    else:
        pytest.fail(f"Unexpected status code: {register_response.status_code}")

    # Login with the same credentials
    login_payload = {"email": "newuser5@example.com", "password": "newpassword"}
    login_response = client.post('/login', json=login_payload)
    assert login_response.status_code == 200
    assert login_response.json["message"] == "Login successful!"
    assert login_response.json["ok"] is True
    assert "access_token" in login_response.json["data"]
    assert login_response.json["data"]["token_type"] == "Bearer"



