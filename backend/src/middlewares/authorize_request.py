# middlewares/authentication.py
from functools import lru_cache
from flask import request, jsonify, g
from typing import Iterable, Optional
from services.authentication_service import validate_token



@lru_cache(maxsize=1)
def _exempt_paths_default() -> tuple[str, ...]:
    # adjust these to match your public endpoints within the users blueprint
    return (
        #"/user/login", "/user/register"
        )

def authenticate_request(
    exempt_paths: Optional[Iterable[str]] = None
):
    """
    Blueprint-only request guard. Use with: users_bp.before_request(authenticate_request())

    - Allows CORS preflight (OPTIONS)
    - Skips paths in `exempt_paths`
    - Expects header: Authorization: Bearer <token>
    - On success: sets g.current_user
    - On failure: returns 401 JSON

    NOTE: this returns a *callable* suitable for blueprint.before_request
    so you can optionally pass custom exempt_paths.
    """
    print("Running authentication middleware..")
    exempt = tuple(exempt_paths) if exempt_paths is not None else _exempt_paths_default()

    def _guard():
        # Let CORS preflight through
        if request.method == "OPTIONS":
            return None

        # Skip public endpoints
        if request.path.startswith(exempt) or request.path in exempt:
            return None

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return (
                jsonify({"error": "Unauthorized", "message": "Missing or invalid Authorization header."}),
                401,
                {"WWW-Authenticate": 'Bearer realm="user", error="invalid_request"'},
            )

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return (
                jsonify({"error": "Unauthorized", "message": "Empty bearer token."}),
                401,
                {"WWW-Authenticate": 'Bearer realm="user", error="invalid_token"'},
            )

        try:
            user_payload = validate_token(token)
        except Exception:
            # Keep it generic to avoid leaking details
            return (
                jsonify({"error": "Unauthorized", "message": "Invalid or expired token."}),
                401,
                {"WWW-Authenticate": 'Bearer realm="user", error="invalid_token"'},
            )

        # Make the authenticated user available to route handlers
        g.current_user = user_payload
        return None  # None means "continue request handling"

    return _guard
