import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from auth import router as auth_router
from endpoints import router as predict_router
from chat import router as chat_router

# Create tables on startup (or use create_tables.py separately)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Disease Prediction API", description="Chaos-Optimized TabNet Backend")

# Browsers reject Access-Control-Allow-Origin: * together with credentialed requests
# (e.g. Authorization: Bearer). List explicit origins instead.
_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
for _part in os.getenv("CORS_ORIGINS", "").split(","):
    _o = _part.strip()
    if _o and _o not in _cors_origins:
        _cors_origins.append(_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "Disease Prediction API is running"}
