FROM node:22.12.0-alpine AS ui-deps
WORKDIR /workspace/UI
COPY UI/package.json UI/package-lock.json ./
RUN npm ci

FROM python:3.10.13-slim AS api-base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /workspace/API
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*
COPY API/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

FROM python:3.10.13-slim AS preview
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /workspace
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash curl procps \
    && rm -rf /var/lib/apt/lists/*
COPY --from=api-base /usr/local /usr/local
COPY --from=ui-deps /workspace/UI/node_modules /workspace/UI/node_modules
COPY API /workspace/API
COPY UI /workspace/UI
COPY Procfile /workspace/Procfile
RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /workspace
USER appuser
EXPOSE 3000 8000
CMD ["bash", "-lc", "set -e; echo '== API dependency/import check ==' && cd /workspace/API && python verify_imports.py; echo '== Starting API on :8000 ==' && (uvicorn main:app --host 0.0.0.0 --port 8000 &) && echo '== Starting UI on :3000 ==' && cd /workspace/UI && npm run dev -- --hostname 0.0.0.0"]
