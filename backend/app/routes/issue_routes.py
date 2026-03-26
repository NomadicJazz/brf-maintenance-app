from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.issue import Issue
from app.models.user import User

issues_bp = Blueprint("issues", __name__)

MAX_PER_PAGE = 50  # consistent max limit for all pagination
ALLOWED_PRIORITIES = {"low", "medium", "high"}
ALLOWED_STATUSES = {"new", "in_progress", "resolved", "closed"}


def _error(message, status_code=400):
    return jsonify({"error": message}), status_code


def _safe_int_identity():
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


def _validate_issue_payload(data, is_update=False, is_admin=False):
    if not isinstance(data, dict):
        return "Invalid JSON payload"

    if not is_update:
        title = (data.get("title") or "").strip()
        if not title:
            return "Title is required"

    if "priority" in data and data["priority"] not in ALLOWED_PRIORITIES:
        return f"Priority must be one of: {', '.join(sorted(ALLOWED_PRIORITIES))}"

    if "status" in data:
        if not is_admin:
            return "Only admins can change status"
        if data["status"] not in ALLOWED_STATUSES:
            return f"Status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}"

    return None


# -------------------------------
# Create Issue
# -------------------------------
@issues_bp.route("/", methods=["POST"])
@jwt_required()
def create_issue():
    data = request.get_json(silent=True) or {}
    validation_error = _validate_issue_payload(data)
    if validation_error:
        return _error(validation_error)

    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)

    issue = Issue(
        title=data["title"].strip(),
        description=data.get("description"),
        location=data.get("location"),
        priority=data.get("priority", "low"),
        photo_url=data.get("photo_url"),
        user_id=user_id
    )

    try:
        db.session.add(issue)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _error("Could not create issue", 500)

    return jsonify(issue.to_dict()), 201


# -------------------------------
# Helper function to standardize paginated response
# -------------------------------
def paginate_query(query, page, per_page):
    paginated = query.paginate(page=page, per_page=per_page)
    return {
        "issues": [i.to_dict() for i in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page,
        "per_page": paginated.per_page,
        "has_next": paginated.has_next,
        "has_prev": paginated.has_prev
    }


# -------------------------------
# Get All Issues (Admin)
# -------------------------------
@issues_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_issues():
    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)
    user = User.query.get(user_id)

    if not user or user.role != "admin":
        return _error("Admin access required", 403)

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("limit", 20, type=int), MAX_PER_PAGE)

    status_filter = request.args.get("status")
    query = Issue.query.order_by(Issue.created_at.desc())
    if status_filter:
        query = query.filter_by(status=status_filter)

    return jsonify(paginate_query(query, page, per_page))


# -------------------------------
# Get Current User Issues (Paginated)
# -------------------------------
@issues_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_issues():
    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("limit", 20, type=int), MAX_PER_PAGE)

    query = Issue.query.filter_by(user_id=user_id).order_by(Issue.created_at.desc())
    return jsonify(paginate_query(query, page, per_page))


# -------------------------------
# Get Single Issue
# -------------------------------
@issues_bp.route("/<int:issue_id>", methods=["GET"])
@jwt_required()
def get_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)
    user = User.query.get(user_id)

    if not user or (issue.user_id != user_id and user.role != "admin"):
        return _error("Unauthorized", 403)

    return jsonify(issue.to_dict())


# -------------------------------
# Update Issue
# -------------------------------
@issues_bp.route("/<int:issue_id>", methods=["PUT"])
@jwt_required()
def update_issue(issue_id):
    data = request.get_json(silent=True) or {}
    issue = Issue.query.get_or_404(issue_id)
    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)
    user = User.query.get(user_id)

    if not user or (issue.user_id != user_id and user.role != "admin"):
        return _error("Unauthorized", 403)

    is_admin = user.role == "admin"
    validation_error = _validate_issue_payload(data, is_update=True, is_admin=is_admin)
    if validation_error:
        return _error(validation_error)

    for field in ["title", "description", "location", "priority"]:
        if field in data:
            value = data[field].strip() if field == "title" and isinstance(data[field], str) else data[field]
            setattr(issue, field, value)

    if is_admin:
        if "status" in data:
            issue.status = data["status"]
        if "assignee" in data:
            issue.assignee = data["assignee"]

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _error("Could not update issue", 500)
    return jsonify(issue.to_dict())


# -------------------------------
# Delete Issue
# -------------------------------
@issues_bp.route("/<int:issue_id>", methods=["DELETE"])
@jwt_required()
def delete_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    user_id = _safe_int_identity()
    if user_id is None:
        return _error("Invalid authentication token", 401)
    user = User.query.get(user_id)

    if not user or (issue.user_id != user_id and user.role != "admin"):
        return _error("Unauthorized", 403)

    try:
        db.session.delete(issue)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _error("Could not delete issue", 500)
    return jsonify({"message": "Issue deleted"})