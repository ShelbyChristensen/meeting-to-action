from flask import jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from flask_jwt_extended.exceptions import JWTExtendedException

def register_error_handlers(app):
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        resp = {
            "error": e.name,
            "message": e.description,
            "status": e.code,
        }
        return jsonify(resp), e.code

    
    @app.errorhandler(ValidationError)
    def handle_validation_error(e: ValidationError):
        return jsonify({
            "error": "ValidationError",
            "message": "Invalid input.",
            "fields": e.messages  
        }), 400

    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(e: IntegrityError):
        
        from . import db
        db.session.rollback()
        return jsonify({
            "error": "IntegrityError",
            "message": "Database constraint failed."
        }), 400

    
    @app.errorhandler(JWTExtendedException)
    def handle_jwt_error(e: JWTExtendedException):
        return jsonify({
            "error": "AuthError",
            "message": str(e)
        }), 401

    
    @app.errorhandler(Exception)
    def handle_generic_error(e: Exception):
        app.logger.exception("Unhandled exception", exc_info=e)
        return jsonify({
            "error": "ServerError",
            "message": "An unexpected error occurred."
        }), 500
