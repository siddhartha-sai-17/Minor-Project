"""
Authentication helpers handling password hashing and JWT token generation/verification.
"""

from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import current_app, jsonify, request


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    encoded = password.encode("utf-8")
    return bcrypt.hashpw(encoded, salt).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: int) -> str:
    """Generate a JWT for a given user ID."""
    expiry_hours = current_app.config.get("JWT_EXPIRY_HOURS", 24)
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=expiry_hours),
        "iat": datetime.now(timezone.utc),
    }
    secret = current_app.config["SECRET_KEY"]
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """Decode and verify a JWT. Returns payload dict on success, None on failure."""
    try:
        secret = current_app.config["SECRET_KEY"]
        return jwt.decode(token, secret, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def token_required(f):
    """
    Decorator for protected routes.
    Expects header: "Authorization: Bearer <token>"
    Injects current_user dictionary into the route function kwargs.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization token"}), 401

        token = auth_header.split(" ")[1]
        payload = decode_token(token)

        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401

        from backend.models import User
        # We perform a lazy lookup inside the route context
        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User no longer exists"}), 401

        # Pass the user ORM object to the route
        return f(current_user=user, *args, **kwargs)

    return decorated
