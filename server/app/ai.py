from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from openai import OpenAI
from .config import Config

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")
client = OpenAI(api_key=Config.OPENAI_API_KEY)

@ai_bp.post("/suggest")
@jwt_required()
def suggest_items():
    data = request.get_json() or {}
    notes = data.get("notes")
    if not notes:
        return jsonify({"error": "notes required"}), 400

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an assistant that extracts clear, concise action items from meeting notes."},
                {"role": "user", "content": f"Meeting notes:\n{notes}\n\nList 3–5 actionable items as short bullet points."}
            ],
            max_tokens=200
        )
        suggestions = resp.choices[0].message.content.strip().split("\n")
        return jsonify({"items": suggestions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
