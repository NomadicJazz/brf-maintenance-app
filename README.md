# BRF Maintenance App

Full-stack maintenance issue tracker with:

- Flask + SQLAlchemy backend
- React + TypeScript frontend (Vite)
- JWT auth with tenant/admin roles

## Current scope

- User registration/login with JWT tokens
- Issue create/list/detail/update/delete
- Role-aware behavior:
  - tenant: own issues
  - admin: all issues + status management
- Local admin bootstrap script for testing
- Backend route tests (pytest)

## Tech stack

- Backend: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Migrate
- Frontend: React, TypeScript, Vite, Axios, React Query
- DB (dev): SQLite

## Quick start

### 1) Backend

From repo root:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-JWT-Extended Flask-Cors pytest

flask --app backend/run.py db upgrade
python3 backend/run.py
```

Backend runs on:

- `http://localhost:5000`

### 2) Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

- `http://127.0.0.1:3000`

## Environment

Backend defaults are in `backend/config.py`:

- `SECRET_KEY` (default `dev-secret`)
- `JWT_SECRET_KEY` (default `jwt-secret`)
- `DATABASE_URL` (default `sqlite:///brf.db`)

Frontend env:

- `frontend/.env`
- `VITE_API_BASE_URL=http://127.0.0.1:5000`

## API overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Both return:

- `access_token`
- `user` payload (`id`, `username`, `email`, `role`, `apartment`, `status`)

### Issues

- `POST /api/issues/` create issue (auth required)
- `GET /api/issues/my` list current user's issues
- `GET /api/issues/` list all issues (admin only)
- `GET /api/issues/<id>` get issue (owner/admin)
- `PUT /api/issues/<id>` update issue (owner/admin; status admin-only)
- `DELETE /api/issues/<id>` delete issue (owner/admin)

## Admin test account

Create or update a local admin user:

```bash
python3 backend/scripts/create_admin.py \
  --username admin_test \
  --email admin_test@example.com \
  --password password123
```

## Running tests

From repo root:

```bash
source backend/.venv/bin/activate
python -m pytest backend/tests -q
```

