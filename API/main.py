from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.chat import router as chat_router
from app.database import Base, engine
from app.endpoints import router as predict_router
from app.summary import build_project_summary

# API CONTRACT
# GET  /api/health
#   response: {"ok": true}
# GET  /api/project-summary
#   response: {"repositoryType": str, "summary": str, "artifacts": list[str], "runNotes": list[str]}
# POST /predict/tabular
#   request: {"features": dict, "disease_type": str}
#   response: list[{"disease": str, "risk_score": float, "risk_level": str, "explanation": str}]
# GET  /predict/datasets/unique-diseases
#   response: list[str]
# POST /predict/upload_csv
#   request: multipart file + disease_type form field
#   response: {"message": str}
# GET  /predict/dashboard/admin-uploads
#   response: {"filenames": list[str]}
# GET  /predict/dashboard/admin-stats
#   response: object with aggregated admin stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Disease Prediction API", description="Chaos-Optimized TabNet Backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(chat_router)


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/api/project-summary")
def project_summary() -> dict[str, object]:
    return build_project_summary()
