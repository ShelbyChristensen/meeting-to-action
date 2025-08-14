from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from .errors import register_error_handlers
import os

db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    CORS(app, supports_credentials=True)

    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)


    from app import routes, models
    from app.auth import auth_bp
    from app.meetings import meetings_bp
    from app.action_items import items_bp
    app.register_blueprint(routes.bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(meetings_bp)
    app.register_blueprint(items_bp)

    register_error_handlers(app)

    return app
