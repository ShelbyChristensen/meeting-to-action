from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from . import db
from .models import Meeting
from .req import require_json
from .validators import parse_iso_date, ensure_nonempty  

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
    data, err = require_json()                 
    if err:
        return err

    try:
        title = ensure_nonempty(data.get("title"), "title")
        date_val = parse_iso_date(ensure_nonempty(data.get("date"), "date"))
    except ValueError as ex:
        return jsonify({"error": "ValidationError", "message": str(ex)}), 400

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
        return jsonify({"error": "NotFound", "message": "not found"}), 404 
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
        return jsonify({"error": "NotFound", "message": "not found"}), 404  

    data, err = require_json()            
    if err:
        return err

    if "title" in data:
        try:
            m.title = ensure_nonempty(data.get("title"), "title")
        except ValueError as ex:
            return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    if "date" in data:
        try:
            m.date = parse_iso_date(ensure_nonempty(data.get("date"), "date"))
        except ValueError as ex:
            return jsonify({"error": "ValidationError", "message": str(ex)}), 400

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
        return jsonify({"error": "NotFound", "message": "not found"}), 404 
    db.session.delete(m)
    db.session.commit()
    return jsonify({"message": "deleted"}), 204
