# Preview Boot Notes

This repository is previewed via the backend metadata service in `backend/main.py`.

- Entry command: `python backend/main.py`
- Expected port: `3000`
- The preview is fail-soft: if model artifacts or datasets are absent, the app still boots and returns repository metadata.
- Frontend dependency installation should happen in the frontend workspace root, not inside `/app/UI`, to avoid permission issues on `node_modules`.
