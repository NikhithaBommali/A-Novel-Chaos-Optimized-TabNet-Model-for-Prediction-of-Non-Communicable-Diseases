"""BrightWorks preview backend for repository metadata.

API CONTRACT
# GET  /api/health
#   response: {"status": "ok"}
#
# GET  /api/project-summary
#   response: {"title": str, "repositoryType": str, "summary": str, "artifacts": [{"name": str, "path": str, "kind": str}], "runNotes": [str]}
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent
PROJECT_FILES = [
    "API/main.py",
    "API/app/main.py",
    "API/requirements.txt",
    "API/runtime.txt",
    "UI/app/page.tsx",
    "UI/package.json",
    "render.yaml",
    "docs/project-architecture-notes.md",
]


def _find_artifacts() -> list[dict[str, str]]:
    artifacts: list[dict[str, str]] = []
    for rel_path in PROJECT_FILES:
        path = BASE_DIR / rel_path if rel_path.startswith("backend/") else REPO_ROOT / rel_path
        if path.exists():
            kind = "directory" if path.is_dir() else "file"
            artifacts.append({"name": path.name, "path": rel_path, "kind": kind})
    return artifacts


def _repository_type() -> str:
    if (REPO_ROOT / "UI/package.json").exists() and (REPO_ROOT / "API/requirements.txt").exists():
        return "fullstack-research-project"
    if (REPO_ROOT / "API/requirements.txt").exists():
        return "python-api-research-project"
    if (REPO_ROOT / "UI/package.json").exists():
        return "web-ui-project"
    return "unknown"


def _summary_text(artifacts: list[dict[str, str]]) -> str:
    if not artifacts:
        return (
            "No obvious app, notebook, or model entrypoint was discovered. "
            "The preview wrapper still starts safely and reports repository metadata."
        )
    names = ", ".join(item["path"] for item in artifacts[:4])
    return (
        "Repository inspection found preview-relevant assets and configuration files. "
        f"Representative files: {names}. "
        "This preview intentionally avoids modifying the core research methodology."
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.repo_root = str(REPO_ROOT)
    app.state.artifacts = _find_artifacts()
    yield


app = FastAPI(title="BrightWorks Preview", lifespan=lifespan)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/project-summary")
async def project_summary() -> dict[str, object]:
    artifacts = _find_artifacts()
    return {
        "title": "A Novel Chaos-Optimized TabNet Model for Prediction of Non-Communicable Diseases",
        "repositoryType": _repository_type(),
        "summary": _summary_text(artifacts),
        "artifacts": artifacts,
        "runNotes": [
            "Preview wrapper starts independently of the research code's training/runtime assumptions.",
            "Primary research assets live under API/ and the UI app lives under UI/.",
            "If no single app entrypoint is available, the preview still reports the repository layout instead of crashing.",
        ],
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)




if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
