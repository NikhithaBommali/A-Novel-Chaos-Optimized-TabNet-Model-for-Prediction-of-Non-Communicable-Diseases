"""Entry re-export so `uvicorn app.main:app` matches the root `main` module."""

from main import app

__all__ = ["app"]
