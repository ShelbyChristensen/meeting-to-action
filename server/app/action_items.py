from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .models import ActionItem, Meeting
from .req import require_json                              
from .validators import parse_iso_date, ensure_nonempty, ensure_status  

items_bp = Blueprint("action_items", __name__, url_prefix="/action-items")

def _paginate(q):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    per_page = max(1, min(per_page, 50))
    return q.paginate(page=page, per_page=per_page, error_out=False)

@items_bp.get("")
@jwt_required()
def list_my_items():
    uid = int(get_jwt_identity())
    status = request.args.get("status")
    due_before = request.args.get("due_before")
    query = ActionItem.query.filter_by(user_id=uid)

    if status in {"open", "done"}:
        query = query.filter(ActionItem.status == status)

    if due_before:
        try:
            dt = datetime.fromisoformat(due_before).date()
            query = query.filter(ActionItem.due_date != None, ActionItem.due_date <= dt)
        except Exception:
            return jsonify({"error": "due_before must be ISO date YYYY-MM-DD"}), 400

    query = query.order_by(ActionItem.due_date.asc().nulls_last(), ActionItem.id.desc())
    page_data = _paginate(query)
    items = [{
        "id": it.id,
        "meeting_id": it.meeting_id,
        "title": it.title,
        "due_date": it.due_date.isoformat() if it.due_date else None,
        "status": it.status,
        "assignee": it.assignee,
        "created_at": it.created_at.isoformat(),
    } for it in page_data.items]

    return jsonify({
        "items": items,
        "page": page_data.page,
        "pages": page_data.pages,
        "total": page_data.total
    }), 200

@items_bp.post("")
@jwt_required()
def create_item():
    uid = int(get_jwt_identity())
    data, err = require_json()                
    if err:
        return err

    try:
        title = ensure_nonempty(data.get("title"), "title")
        meeting_id = data.get("meeting_id")
        if not meeting_id:
            raise ValueError("meeting_id is required")
    except ValueError as ex:
        return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    # Ensure meeting belongs to current user
    meeting = Meeting.query.filter_by(id=meeting_id, user_id=uid).first()
    if not meeting:
        return jsonify({"error": "NotFound", "message": "meeting not found"}), 404  

    due_date = None
    if data.get("due_date"):
        try:
            due_date = parse_iso_date(data["due_date"])
        except ValueError as ex:
            return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    status_val = (data.get("status") or "open")
    try:
        status_val = ensure_status(status_val)
    except ValueError as ex:
        return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    item = ActionItem(
        meeting_id=meeting_id,
        user_id=uid,
        title=title,
        due_date=due_date,
        status=status_val,
        assignee=data.get("assignee"),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id}), 201

@items_bp.patch("/<int:item_id>")
@jwt_required()
def update_item(item_id):
    uid = int(get_jwt_identity())
    it = ActionItem.query.filter_by(id=item_id, user_id=uid).first()
    if not it:
        return jsonify({"error": "NotFound", "message": "not found"}), 404 

    data, err = require_json()      
    if err:
        return err

    if "title" in data:
        try:
            it.title = ensure_nonempty(data.get("title"), "title")
        except ValueError as ex:
            return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    if "due_date" in data:
        if data["due_date"] is None:
            it.due_date = None
        else:
            try:
                it.due_date = parse_iso_date(data["due_date"])
            except ValueError as ex:
                return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    if "status" in data:
        try:
            it.status = ensure_status(data["status"])
        except ValueError as ex:
            return jsonify({"error": "ValidationError", "message": str(ex)}), 400

    if "assignee" in data:
        it.assignee = data["assignee"]

    db.session.commit()
    return jsonify({"message": "updated"}), 200

@items_bp.delete("/<int:item_id>")
@jwt_required()
def delete_item(item_id):
    uid = int(get_jwt_identity())
    it = ActionItem.query.filter_by(id=item_id, user_id=uid).first()
    if not it:
        return jsonify({"error": "NotFound", "message": "not found"}), 404 
    db.session.delete(it)
    db.session.commit()
    return jsonify({"message": "deleted"}), 204
