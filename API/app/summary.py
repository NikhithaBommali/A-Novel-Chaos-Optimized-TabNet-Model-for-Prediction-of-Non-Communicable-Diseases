from __future__ import annotations

from typing import Any


def build_project_summary() -> dict[str, Any]:
    return {
        "repositoryType": "python-backend-research",
        "summary": "FastAPI preview backend for repository metadata and health checks.",
        "artifacts": [
            "API/main.py",
            "API/app/summary.py",
            "API/endpoints.py",
            "API/models.py",
        ],
        "runNotes": [
            "Use GET /api/health to verify the preview backend is up.",
            "Use GET /api/project-summary for the UI project overview flow.",
        ],
    }
