from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), unique=True, nullable=False)
    apartment = db.Column(db.String(50), nullable=True)

    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), nullable=False, default="tenant")

    status = db.Column(db.String(50), nullable=False, default="active")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, username, email, password, role="tenant"):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role

    def set_password(self, password):
        """Hashes the password before storing it."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Verifies a password against the stored hash."""
        try:
            return check_password_hash(self.password, password)
        except (ValueError, TypeError):
            # Corrupt/legacy hashes should fail closed, not crash login.
            return False

    def is_admin(self):
        return self.role == "admin"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "apartment": self.apartment,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

    def __repr__(self):
        return f"<User {self.username}>"