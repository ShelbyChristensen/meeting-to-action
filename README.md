# Meeting-to-Action Tracker
A full-stack productivity app that turns meeting notes into clear, owned, and trackable action items.

**Stack:** Flask · SQLAlchemy · Flask-JWT-Extended · React · Vite · Tailwind · Axios  
**DB:** SQLite in dev (PostgreSQL-ready)


## Features

- User auth (register, login, JWT) with ownership enforcement
- Meetings: list, search, pagination, create, edit, delete
- Action Items: per-meeting items + “My Items” view with filters (status, due_before), pagination, toggle open/done
- Inline forms for creating meetings and items (no prompts)
- Centralized error handling in API + client
- Ready for deployment (client/server split, env vars)


## Quick Start (Local)

### Prereqs
- Node 18+ (20+ recommended)
- Python 3.11+ (3.12 OK)
- (Optional) PostgreSQL if you switch from SQLite


### Backend (Flask)
```bash```
cd server
python3 -m venv venv
source venv/bin/activate 
pip install -r requitremtns.txt

`# env (SQLite dev default)
`cp .env.example .env  # if present; otherwise create .env:
`# SECRET_KEY=dev_secret
`# JWT_SECRET_KEY=jwt_secret
`# DATABASE_URL=sqlite:///dev.db

flask db upgrade
export FLASK_APP=wsgi.py   # Windows: set FLASK_APP=wsgi.py
flask run


## Frontend (REACT)
cd client
npm install
npm rundev

## API Overview
- Auth

POST /auth/register → { email, password } → { access_token }

POST /auth/login → { email, password } → { access_token }

GET /auth/me (JWT) → current user


- Meetings

GET /meetings?page=&per_page=&q= (JWT)

POST /meetings (JWT) → { title, date, attendees?, notes? }

GET /meetings/:id (JWT)

PATCH /meetings/:id (JWT)

DELETE /meetings/:id (JWT, cascades items)


- Action Items

GET /action-items?status=&due_before=&page=&per_page= (JWT)

POST /action-items (JWT) → { meeting_id, title, due_date?, status?, assignee? }

PATCH /action-items/:id (JWT)

DELETE /action-items/:id (JWT)

-Error JSON
{ "error": "ValidationError", "message": "date must be YYYY-MM-DD" }


## Frontend Pages
- /login, /register

- /meetings — list/search/paginate; create inline; edit/delete inline

- /meetings/:id — meeting detail; inline add item; toggle/edit/delete items

- /my-items — all your items with filters + pagination


## Testing (Manual / Postman)
- Use Authorization: Bearer <token> for protected routes.

- Suggested flow:

1. POST /auth/register then POST /auth/login

2. Create meeting → list → search → edit → delete

3. Create action item → list (filters) → toggle → edit → delete

(Optional) Export a Postman collection and commit to docs/postman_collection.json.


## Developer Notes
- Dev DB: SQLite (file at server/instance/dev.db)

- Migrations: flask db migrate -m "msg" → flask db upgrade

- Validation helpers: validators.py (ISO date, status, nonempty)

- Error handlers: errors.py unify error responses

- Client error helper: src/lib/errors.js


## Deployment
- Server (Render/Railway/Fly)

1. Install gunicorn and set web: gunicorn wsgi:app

2. Set env vars (SECRET_KEY, JWT_SECRET_KEY, DATABASE_URL)

3. Enable CORS or reverse proxy /api from client host

- Client (Vercel/Netlify)

1. Set VITE_API_URL to your deployed API base or proxy path (e.g., /api)

2. Build command: npm run build

3. Output dir: dist

## OpenAI 
-Integrated to auto suggest action items