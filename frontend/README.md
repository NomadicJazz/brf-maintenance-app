# BRF Maintenance Frontend

React + TypeScript frontend for auth and issue management.

## Prerequisites

- Node.js 18+ (20+ recommended)
- Backend API running locally

## Environment

Create your local env file:

```bash
cp .env.example .env
```

Default API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## Run locally

From repo root:

```bash
cd frontend
npm install
npm run dev
```

The app runs at:

- `http://127.0.0.1:3000`

## Backend quick start (for frontend testing)

From repo root:

```bash
flask --app backend/run.py db upgrade
python3 backend/run.py
```

## Admin test account

Create/update local admin user:

```bash
python3 backend/scripts/create_admin.py \
  --username admin_test \
  --email admin_test@example.com \
  --password password123
```

Then login in the frontend with:

- Username: `admin_test`
- Password: `password123`

## Useful scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
