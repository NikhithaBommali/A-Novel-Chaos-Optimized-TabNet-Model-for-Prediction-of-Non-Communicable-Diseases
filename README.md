# Preview (BrightWorks)

This repository is primarily **research/model code** (TabNet + training/data processing) with supporting backend logic. The BrightWorks “browser preview” for this repo is surfaced as a **metadata/overview UI** backed by a small FastAPI service, rather than an inherent single-page web app.

## What the browser preview shows
- A lightweight project overview screen built with the repo’s frontend scaffold.
- It calls the preview backend to display:
  - the detected **repositoryType**
  - a short **summary**
  - discovered **artifacts** (representative files/paths)
  - concise **runNotes** (how to run the repo based on what’s detected)

If the repository does not have a single natural “web UI entrypoint”, the preview still renders meaningful information by detecting the most representative backend/frontend folders and files.

## Backend + frontend entrypoints used for preview
**Backend (API wrapper / metadata service)**
- Start command runs `backend/main.py`
- Host binding: `0.0.0.0`
- Port: `PORT` if set, otherwise `3000`
- Preview endpoints:
  - `GET /api/health`
  - `GET /api/project-summary`

**Frontend (browser preview UI)**
- Frontend app is the Vite-based scaffold under `frontend/`
- It reads API base URL from `import.meta.env.VITE_API_BASE_URL` (falls back to empty string)
- UI labels correspond to the project summary fields returned by `/api/project-summary`

## Assumptions when no native web UI existed
This preview does **not** assume the repo has a working “run a server and show pages” web UI.
Instead, it:
- Inspects repository contents to determine a **repositoryType** and relevant artifacts.
- Produces a summary and run notes even when there is no single canonical UI route.
- Does not add preview-only auth flows (the preview is metadata-only).

## Run notes (what the preview expects)
The preview backend provides `runNotes` based on discovered artifacts. In general, this repo contains:
- Python backend code (e.g., `backend/main.py`, `API/app/main.py`, `API/ml/*`, training/dataset utilities)
- Frontend scaffold (under `UI/` and/or `frontend/` preview app)

## Quick validation (local, if needed)
Use the preview backend to confirm the UI can load data:

```bash
# backend only
python -m py_compile backend/main.py
# then start the metadata server according to render/port convention:
PORT=3000 uvicorn main:app --host 0.0.0.0 --port 3000
```

Then open the preview UI, ensuring it can reach:
- `GET /api/health`
- `GET /api/project-summary`

> Note: exact production start commands depend on the BrightWorks environment/launch wrapper.
