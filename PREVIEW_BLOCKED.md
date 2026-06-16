# Preview blocked

The backend preview could not be verified or started because the repository contents are missing from the workspace.

## Blocking prerequisites
- Expected backend files were not present:
  - `API/main.py`
  - `API/database.py`
  - `API/auth.py`
  - `API/endpoints.py`
  - `API/check_db.py`
  - `API/requirements.txt`
- Direct GitHub repository inspection was also unavailable because GitHub credentials were not configured for this run.

## What was verified
- The workspace root is empty.
- No local files exist to inspect, run, or minimally adjust.

## Next step
Populate the workspace with the repository contents and rerun this task so the current backend can be inspected and a faithful local preview path can be produced.
