from app.extensions import db


class BRF(db.Model):
    __tablename__ = "brfs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<BRF {self.name}>"
