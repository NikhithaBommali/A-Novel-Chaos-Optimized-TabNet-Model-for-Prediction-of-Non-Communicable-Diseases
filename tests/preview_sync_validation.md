# Preview Sync Validation

This repository contains a FastAPI backend in `API/` and a Next.js frontend in `UI/`. There is no existing automated repo-level preview smoke test harness in the synced branch, so this note provides a reproducible validation procedure focused on branch-sync correctness and preview readiness.

## Test cases planned

1. **Repository sync check**
   - Input state: local clone with Git remotes configured
   - Action: compare local branch/commit with the intended remote branch
   - Expected outcome: current branch tracks the intended remote branch and local `HEAD` matches `origin/<branch>` after fetch
2. **Frontend preview readiness**
   - Input state: Node.js/npm installed, dependencies installed in `UI/`
   - Action: run the Next.js dev server
   - Expected outcome: app serves successfully and `/auth/user/signup` is previewable in a browser
3. **Backend startup readiness**
   - Input state: Python environment created in `API/`, dependencies installed, required env available
   - Action: run the FastAPI app with Uvicorn
   - Expected outcome: server starts and `/docs` is previewable; root endpoint responds if startup completes
4. **Blocker identification**
   - Input state: same as above
   - Action: observe install/start output
   - Expected outcome: any dependency or environment blockers are recorded clearly before handing off

## 1. Verify the local repo matches the intended remote branch

Run from the repository root in a real Git clone:

```bash
git remote -v
git fetch origin
git branch --show-current
git rev-parse HEAD
git rev-parse origin/<intended-branch>
git status --short
```

Passing conditions:

- `origin` points to `NikhithaBommali/A-Novel-Chaos-Optimized-TabNet-Model-for-Prediction-of-Non-Communicable-Diseases`
- `git branch --show-current` is the branch you intended to sync
- `git rev-parse HEAD` equals `git rev-parse origin/<intended-branch>` after `git fetch origin`
- `git status --short` is empty, or any local-only changes are explicitly understood before preview testing

Optional stricter check:

```bash
git rev-list --left-right --count HEAD...origin/<intended-branch>
```

Expected result for an exact sync: `0	0`

## 2. Frontend preview validation (`UI/`)

### Install

```bash
cd UI
npm install
```

### Start preview

```bash
npm run dev
```

Expected healthy startup indicators:

- Next.js dev server starts without exiting
- a local URL such as `http://localhost:3000` is printed
- visiting `http://localhost:3000/` redirects to `/auth/user/signup` per `UI/next.config.mjs`
- the signup page renders a previewable UI with visible text such as `Create Account`

Useful manual checks:

- `http://localhost:3000/auth/user/signup`
- `http://localhost:3000/auth/user/login`
- `http://localhost:3000/auth/admin/login`

### Known frontend caveat

The signup and login flows call the backend through `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000` in `UI/lib/api.ts`. The page itself should still be previewable without the backend, but form submission will fail unless the API is running and reachable.

## 3. Backend preview validation (`API/`)

### Create environment and install

```bash
cd API
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Minimum environment variables to confirm startup

Create an `.env` or export values before running:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
```

### Start preview

Try the documented backend entrypoint first:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If running from repo root instead of `API/`, use:

```bash
uvicorn API.app.main:app --host 0.0.0.0 --port 8000
```

Expected healthy startup indicators:

- Uvicorn starts and keeps running
- `http://localhost:8000/docs` loads Swagger UI
- `http://localhost:8000/` returns the app root response if startup completes successfully

## 4. Preview-ready end-to-end smoke check

With both services running:

1. Open `http://localhost:3000/`
2. Confirm redirect to `/auth/user/signup`
3. Confirm the page is visually rendered and usable as a preview
4. Open `http://localhost:8000/docs`
5. Confirm backend docs are reachable
6. Optionally submit signup/login only if database and auth env are configured

## 5. Branch-sync-related blockers and unresolved environment issues

These are the main issues to watch for while validating the synced branch:

- **Git metadata unavailable in exported workspaces:** if your workspace was provided without `.git/`, branch-match verification must be done in a fresh clone of the remote repository, not in the exported artifact directory.
- **Backend dependency weight:** `API/requirements.txt` includes heavy ML and NLP dependencies such as `torch`, `transformers`, `sentence-transformers`, `spacy`, `faiss-cpu`, and `pytorch-tabnet`. Installation may be slow or fail on constrained environments.
- **Database requirement:** backend startup likely depends on a reachable PostgreSQL `DATABASE_URL`; without it, auth, prediction, and dashboard routes may not initialize correctly.
- **Frontend/backend coupling:** authentication forms depend on the backend API. A frontend-only preview is still possible for static render verification, but interactive auth requires the API.
- **Potential runtime/version risk:** `UI/package.json` uses `next@16.0.10` with React 19. If local tooling is older than the required Node.js version for that Next release, `npm run dev` may fail until Node is upgraded.

## Validation result template for handoff

When you run the steps above, record results in this format:

```text
Remote branch checked: <branch>
HEAD matches origin: yes|no
Frontend dev server starts: yes|no
Frontend preview URL: <url or blocker>
Backend server starts: yes|no
Backend docs URL reachable: yes|no
Unresolved blockers:
- <blocker 1>
- <blocker 2>
```

This note is the repository-level verification artifact for the current synced branch when no established automated smoke-test stack is present under `tests/`.
