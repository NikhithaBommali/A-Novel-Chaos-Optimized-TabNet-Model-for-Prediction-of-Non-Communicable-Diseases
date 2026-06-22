# Preview container for BrightWorks repository metadata UI and API.
# EXPOSE 3000: backend API serves on port 3000 by default for preview.

FROM python:3.12-slim@sha256:5c3b2c0bfbf3b8b1e56f0b6b1bc5f3a3a1d5c7f7e8bfa4d7a5d8d7c8f1f6f7a1 AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --prefix=/install -r /app/backend/requirements.txt

FROM python:3.12-slim@sha256:5c3b2c0bfbf3b8b1e56f0b6b1bc5f3a3a1d5c7f7e8bfa4d7a5d8d7c8f1f6f7a1 AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

WORKDIR /app

RUN addgroup --system --gid 1000 appuser \
    && adduser --system --uid 1000 --ingroup appuser appuser

COPY --from=builder /install /usr/local
COPY backend /app/backend
COPY README.md /app/README.md

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["python", "-m", "backend.main"]
