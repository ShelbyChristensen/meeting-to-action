from flask import request, jsonify

def require_json():
    if not request.is_json:
        return None, (jsonify({"error": "BadRequest", "message": "Content-Type must be application/json"}), 400)
    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"error": "BadRequest", "message": "Invalid or missing JSON body"}), 400)
    return data, None
