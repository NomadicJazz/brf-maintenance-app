from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth_bp", __name__)


def _error(message, status_code=400):
    return jsonify({"error": message}), status_code


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "apartment": user.apartment,
        "status": user.status,
    }

# -------------------------
# Register a new user
# -------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not username or not email or not isinstance(password, str) or len(password.strip()) < 6:
        return _error("Valid username, email, and password (min 6 chars) are required")

    if User.query.filter_by(username=username).first():
        return _error("Username already exists")
    if User.query.filter_by(email=email).first():
        return _error("Email already exists")

    user = User(
        username=username,
        email=email,
        password=password.strip(),
        role=data.get("role", "tenant"),
    )
    if data.get("apartment"):
        user.apartment = str(data["apartment"]).strip()

    try:
        db.session.add(user)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _error("Could not register user", 500)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": _user_payload(user)}), 201


# -------------------------
# Login
# -------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password")

    if not username or not isinstance(password, str) or not password:
        return _error("Username and password are required")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return _error("Invalid username or password", 401)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": _user_payload(user)}), 200
