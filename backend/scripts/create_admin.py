"""Create or update a local admin user for manual testing.

Usage:
  python3 backend/scripts/create_admin.py --username admin_test --email admin@example.com --password password123
"""

import argparse
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from app.extensions import db
from app.models.user import User


def parse_args():
    parser = argparse.ArgumentParser(description="Create/update admin test user")
    parser.add_argument("--username", required=True, help="Admin username")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--apartment", default="", help="Optional apartment label")
    return parser.parse_args()


def main():
    args = parse_args()
    app = create_app()

    with app.app_context():
        user = User.query.filter(
            (User.username == args.username) | (User.email == args.email)
        ).first()

        if user:
            user.username = args.username
            user.email = args.email.lower().strip()
            user.set_password(args.password)
            user.role = "admin"
            user.apartment = args.apartment.strip() or None
            action = "updated"
        else:
            user = User(
                username=args.username.strip(),
                email=args.email.lower().strip(),
                password=args.password,
                role="admin",
            )
            if args.apartment:
                user.apartment = args.apartment.strip()
            db.session.add(user)
            action = "created"

        db.session.commit()
        print(f"Admin user {action}: username={user.username}, email={user.email}")


if __name__ == "__main__":
    main()

