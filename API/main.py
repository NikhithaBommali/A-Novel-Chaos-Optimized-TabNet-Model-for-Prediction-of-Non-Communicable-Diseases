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

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adjust if frontend runs on different port
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
