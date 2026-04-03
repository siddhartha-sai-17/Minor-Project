from flask import Blueprint, jsonify, request

from backend.models import User, db
from backend.utils.auth_helpers import check_password, generate_token, hash_password, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Account with this email already exists"}), 409

    try:
        new_user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
        )
        db.session.add(new_user)
        db.session.commit()

        token = generate_token(new_user.id)
        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user.id)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    """Returns profile data for the authenticated user."""
    return jsonify({"user": current_user.to_dict()}), 200
