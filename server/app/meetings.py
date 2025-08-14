from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from . import db
from .models import Meeting


meetings_bp = Blueprint("meetings", __name__, url_prefix="/meetings")

def _paginate(q):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    per_page = max(1, min(per_page, 50))
    return q.paginate(page=page, per_page=per_page, error_out=False)

@meetings_bp.get("")
@jwt_required()
def list_meetings():
    uid = int(get_jwt_identity())
    q = (request.args.get("q") or "").strip()
    query = Meeting.query.filter_by(user_id=uid)

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Meeting.title.ilike(like), Meeting.attendees.ilike(like)))

    query = query.order_by(Meeting.date.desc(), Meeting.id.desc())
    page_data = _paginate(query)
    items = [{
        "id": m.id,
        "title": m.title,
        "date": m.date.isoformat(),
        "attendees": m.attendees,
        "notes": m.notes,
        "created_at": m.created_at.isoformat()
    } for m in page_data.items]

    return jsonify({
        "items": items,
        "page": page_data.page,
        "pages": page_data.pages,
        "total": page_data.total
    }), 200

@meetings_bp.post("")
@jwt_required()
def create_meeting():
    uid = int(get_jwt_identity())
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    date_str = (data.get("date") or "").strip()

    if not title or not date_str:
        return jsonify({"error": "title and date are required"}), 400

    try:
        date_val = datetime.fromisoformat(date_str).date()
    except Exception:
        return jsonify({"error": "date must be ISO format YYYY-MM-DD"}), 400

    meeting = Meeting(
        user_id=uid,
        title=title,
        date=date_val,
        attendees=data.get("attendees"),
        notes=data.get("notes"),
    )
    db.session.add(meeting)
    db.session.commit()
    return jsonify({"id": meeting.id}), 201

@meetings_bp.get("/<int:meeting_id>")
@jwt_required()
def get_meeting(meeting_id):
    uid = int(get_jwt_identity())
    m = Meeting.query.filter_by(id=meeting_id, user_id=uid).first()
    if not m:
        return jsonify({"error": "not found"}), 404
    return jsonify({
        "id": m.id,
        "title": m.title,
        "date": m.date.isoformat(),
        "attendees": m.attendees,
        "notes": m.notes,
        "created_at": m.created_at.isoformat()
    }), 200

@meetings_bp.patch("/<int:meeting_id>")
@jwt_required()
def update_meeting(meeting_id):
    uid = int(get_jwt_identity())
    m = Meeting.query.filter_by(id=meeting_id, user_id=uid).first()
    if not m:
        return jsonify({"error": "not found"}), 404
    data = request.get_json() or {}

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        m.title = title

    if "date" in data:
        try:
            m.date = datetime.fromisoformat(data["date"]).date()
        except Exception:
            return jsonify({"error": "date must be ISO format YYYY-MM-DD"}), 400

    if "attendees" in data:
        m.attendees = data.get("attendees")

    if "notes" in data:
        m.notes = data.get("notes")

    db.session.commit()
    return jsonify({"message": "updated"}), 200

@meetings_bp.delete("/<int:meeting_id>")
@jwt_required()
def delete_meeting(meeting_id):
    uid = int(get_jwt_identity())
    m = Meeting.query.filter_by(id=meeting_id, user_id=uid).first()
    if not m:
        return jsonify({"error": "not found"}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({"message": "deleted"}), 204
