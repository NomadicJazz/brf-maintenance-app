from datetime import datetime
from app.extensions import db


class Issue(db.Model):
    __tablename__ = "issues"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    location = db.Column(db.String(100))

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    priority = db.Column(db.String(20), default="low")

    photo_url = db.Column(db.String(255))

    assignee = db.Column(db.String(100))

    status = db.Column(db.String(50), nullable=False, default="new")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "user_id": self.user_id,
            "priority": self.priority,
            "photo_url": self.photo_url,
            "assignee": self.assignee,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Issue {self.id} - {self.title}>"
