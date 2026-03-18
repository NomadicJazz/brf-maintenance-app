# 🏢 BRF Maintenance App

![Python](https://img.shields.io/badge/python-3.14-blue)
![Flask](https://img.shields.io/badge/flask-3.2-lightgrey)
![SQLite](https://img.shields.io/badge/sqlite-3.41-orange)

A full-stack application for managing BRF (housing association) maintenance issues.  
Backend is built with **Flask** and **SQLAlchemy**, frontend is separate, with JWT-based authentication and role-based access control.


---

## ⚡ Features

- **User Roles:** Tenant & Admin  
- **JWT Authentication:** Secure login and protected routes  
- **Issue Management:** Create, read, update, and list maintenance issues  
- **Database:** SQLite for development (can switch to PostgreSQL/MySQL)  
- **Admin Capabilities:** Filter issues by status, update any issue  

---

## 🚀 Getting Started

### 1. Clone the repository
```
git clone https://github.com/NomadicJazz/brf-maintenance-app.git
cd brf-maintenance-app/backend

python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows


pip install -r requirements.txt

flask db upgrade

export FLASK_APP=app
export FLASK_ENV=development
flask run
```

## 🔗 API Endpoints

### Auth

- `POST /api/auth/register` – Register a new user  
- `POST /api/auth/login` – Login and get JWT  

### Issues

- `POST /api/issues/` – Create a new issue (JWT required)  
- `GET /api/issues/` – List all issues (admin filter optional)  
- `GET /api/issues/my` – List current user's issues  
- `PUT /api/issues/<id>` – Update an issue (owner or admin)

👤 User Model

id – Primary key

name – User name

apartment – Apartment number

email – User email

password_hash – Hashed password

role – tenant or admin

brf_id – BRF association ID

