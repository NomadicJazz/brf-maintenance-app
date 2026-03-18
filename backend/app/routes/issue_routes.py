from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.issue import Issue
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

issues_bp = Blueprint("issues", __name__)

MAX_PER_PAGE = 50  # consistent max limit for all pagination


# -------------------------------
# Create Issue
# -------------------------------
@issues_bp.route("/", methods=["POST"])
@jwt_required()
def create_issue():
    data = request.get_json()

    if not data or "title" not in data:
        return jsonify({"msg": "Title is required"}), 400

    user_id = int(get_jwt_identity())

    issue = Issue(
        title=data["title"],
        description=data.get("description"),
        location=data.get("location"),
        priority=data.get("priority", "low"),
        photo_url=data.get("photo_url"),
        user_id=user_id
    )

    db.session.add(issue)
    db.session.commit()

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
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != "admin":
        return jsonify({"msg": "Admin access required"}), 403

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
    user_id = int(get_jwt_identity())

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
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if issue.user_id != user_id and user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    return jsonify(issue.to_dict())


# -------------------------------
# Update Issue
# -------------------------------
@issues_bp.route("/<int:issue_id>", methods=["PUT"])
@jwt_required()
def update_issue(issue_id):
    data = request.get_json()
    issue = Issue.query.get_or_404(issue_id)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if issue.user_id != user_id and user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    for field in ["title", "description", "location", "priority"]:
        if field in data:
            setattr(issue, field, data[field])

    if user.role == "admin":
        if "status" in data:
            issue.status = data["status"]
        if "assignee" in data:
            issue.assignee = data["assignee"]

    db.session.commit()
    return jsonify(issue.to_dict())


# -------------------------------
# Delete Issue
# -------------------------------
@issues_bp.route("/<int:issue_id>", methods=["DELETE"])
@jwt_required()
def delete_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if issue.user_id != user_id and user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    db.session.delete(issue)
    db.session.commit()
    return jsonify({"msg": "Issue deleted"})