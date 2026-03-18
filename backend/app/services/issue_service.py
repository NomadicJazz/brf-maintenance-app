# backend/app/services/issue_service.py
from app.models.issue import Issue
from app.extensions import db

def get_all_issues():
    return Issue.query.all()

def get_issue_by_id(issue_id):
    return Issue.query.get(issue_id)

def create_issue(data):
    issue = Issue(**data)
    db.session.add(issue)
    db.session.commit()
    return issue

def update_issue(issue_id, data):
    issue = Issue.query.get(issue_id)
    if not issue:
        return None
    for key, value in data.items():
        setattr(issue, key, value)
    db.session.commit()
    return issue

def delete_issue(issue_id):
    issue = Issue.query.get(issue_id)
    if not issue:
        return False
    db.session.delete(issue)
    db.session.commit()
    return True