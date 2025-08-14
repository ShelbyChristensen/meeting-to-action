from marshmallow import fields, validate
from flask_marshmallow import Marshmallow
from . import ma  # from app.__init__

class UserSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    created_at = fields.DateTime(dump_only=True)

class MeetingSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1))
    date = fields.Date(required=True)
    attendees = fields.Str(allow_none=True)
    notes = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

class ActionItemSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    meeting_id = fields.Int(required=True)
    user_id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1))
    due_date = fields.Date(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["open", "done"]), load_default="open")
    assignee = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
