from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, jwt

def create_app(config_filename=None):
    app = Flask(__name__)
    if config_filename:
        app.config.from_pyfile(config_filename)
    else:
        app.config.from_object("config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS: allow React frontend
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    from app.routes.auth_routes import auth_bp
    from app.routes.issue_routes import issues_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(issues_bp, url_prefix="/api/issues")

    return app