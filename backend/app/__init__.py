from flask import Flask
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import HTTPException

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

    # CORS: allow local React dev server(s)
    # React is commonly served from 127.0.0.1 (not just localhost), so allow both.
    cors_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
    CORS(app, resources={r"/*": {"origins": cors_origins}})

    from app.routes.auth_routes import auth_bp
    from app.routes.issue_routes import issues_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(issues_bp, url_prefix="/api/issues")

    @jwt.unauthorized_loader
    def handle_missing_jwt(reason):
        return {"error": reason}, 401

    @jwt.invalid_token_loader
    def handle_invalid_jwt(reason):
        return {"error": reason}, 401

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return {"error": error.description}, error.code

    @app.errorhandler(SQLAlchemyError)
    def handle_db_exception(_error):
        db.session.rollback()
        return {"error": "Database operation failed"}, 500

    @app.errorhandler(Exception)
    def handle_unexpected_exception(_error):
        db.session.rollback()
        return {"error": "Unexpected server error"}, 500

    return app