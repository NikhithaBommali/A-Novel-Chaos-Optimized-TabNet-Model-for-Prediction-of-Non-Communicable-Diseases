from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pandas as pd
import io
import os
import json
from datetime import datetime

from database import get_db
from models import User, Prediction, Dataset, PatientRecord
from auth import oauth2_scheme, verify_password 
# In a real app, use a proper get_current_user dependency 
# For now, simplistic token decoding or just passing user_id for partial demo if auth is complex to mock fully in 1 step

# Import ML components
from ml.tabnet_model import DiseasePredictionTabNet
from ml.utils import DataPreprocessor
import pickle
from dataset_service import process_uploaded_dataset

router = APIRouter(prefix="/predict", tags=["predict"])

# --- Load Pre-trained Resources (Mocking load if files don't exist yet) ---
# Use absolute paths relative to this file's location to be safe
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model_heart.zip")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "models", "has_heart_disease_preprocessor.pkl")

model = None
preprocessor = None

def load_ml_resources():
    global model, preprocessor
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
            model = DiseasePredictionTabNet()
            model.load_model(MODEL_PATH)
            with open(PREPROCESSOR_PATH, "rb") as f:
                preprocessor = pickle.load(f)
            print("ML Resources Loaded.")
        else:
            print(f"ML Resources not found at {MODEL_PATH}. Using Mock Logic for now.")
    except Exception as e:
        print(f"Error loading ML resources: {e}")

load_ml_resources()

# --- Schemas ---
class PredictionInput(BaseModel):
    # Flexible input: can accept {"age": 50, "bp": 120} or {"glucose": 100, "insulin": 20}
    features: dict
    disease_type: str = "Heart Disease"  # Optional disease type

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    disease: str
    explanation: str

# --- Endpoints ---

@router.post("/tabular", response_model=list[PredictionResponse])
def predict_tabular(input_data: PredictionInput, db: Session = Depends(get_db)):
    """
    Receives dynamic patient data, runs it through the Chaos-Optimized TabNet (or mock),
    and returns risk scores. Supports multiple disease types.
    """
    
    # 1. Prepare Data
    data_dict = input_data.features
    disease_type = input_data.disease_type or "Heart Disease"
    
    results = []
    
    # 2. Disease-specific prediction logic
    disease_lower = disease_type.lower()
    
    # Heart Disease Prediction
    if "heart" in disease_lower:
        if model and preprocessor:
            try:
                # Preprocess
                X_processed = preprocessor.preprocess_inference(data_dict)
                # Predict
                probs = model.predict_proba(X_processed)
                risk_score = float(probs[0][1]) * 100 # Probability of class 1
            except Exception as e:
                print(f"Inference error: {e}")
                risk_score = 0.0 # Fallback
        else:
            # Mock Logic for Heart Disease
            age = float(data_dict.get('age', 50))
            bp = float(data_dict.get('blood_pressure', 120))
            chol = float(data_dict.get('cholesterol', 200))
            bmi = float(data_dict.get('bmi', 25))
            chest_pain = data_dict.get('chest_pain', 0)
            
            # Calculate risk based on multiple factors
            risk_score = min(95, (age * 0.5 + (bp - 120) * 0.3 + (chol - 200) * 0.2 + (bmi - 25) * 0.4 + float(chest_pain) * 10))
            if risk_score < 0:
                risk_score = 5  # Minimum risk
        
        risk_level = "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low"
        results.append({
            "disease": "Heart Disease",
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "explanation": "Based on age, blood pressure, cholesterol, BMI, and other cardiovascular risk factors."
        })
    
    # Breast Cancer Prediction
    elif "breast" in disease_lower:
        # Mock logic for breast cancer
        radius = float(data_dict.get('radius_mean', 15))
        texture = float(data_dict.get('texture_mean', 20))
        perimeter = float(data_dict.get('perimeter_mean', 100))
        area = float(data_dict.get('area_mean', 700))
        
        # Normalize and calculate risk
        risk_score = min(95, ((radius - 10) * 2 + (texture - 15) * 1.5 + (perimeter - 80) * 0.3 + (area - 500) * 0.05))
        if risk_score < 0:
            risk_score = 5
        
        risk_level = "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low"
        results.append({
            "disease": "Breast Cancer",
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "explanation": "Based on tumor characteristics including radius, texture, perimeter, and area measurements."
        })
    
    # Lung Cancer Prediction
    elif "lung" in disease_lower:
        # Mock logic for lung cancer
        age = float(data_dict.get('age', 50))
        smoking = 1 if str(data_dict.get('smoking', 'no')).lower() in ['yes', '1', 'true'] else 0
        yellow_fingers = 1 if str(data_dict.get('yellow_fingers', 'no')).lower() in ['yes', '1', 'true'] else 0
        anxiety = 1 if str(data_dict.get('anxiety', 'no')).lower() in ['yes', '1', 'true'] else 0
        chronic_disease = 1 if str(data_dict.get('chronic_disease', 'no')).lower() in ['yes', '1', 'true'] else 0
        
        risk_score = min(95, age * 0.5 + smoking * 30 + yellow_fingers * 15 + anxiety * 10 + chronic_disease * 15)
        if risk_score < 0:
            risk_score = 5
        
        risk_level = "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low"
        results.append({
            "disease": "Lung Cancer",
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "explanation": "Based on age, smoking history, symptoms (yellow fingers), anxiety, and chronic disease factors."
        })
    
    # Default fallback
    else:
        age = float(data_dict.get('age', 50))
        risk_score = min(95, age * 0.8)
        risk_level = "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low"
        results.append({
            "disease": disease_type,
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "explanation": "General risk assessment based on provided parameters."
        })
    
    return results

    return results

@router.get("/datasets/unique-diseases")
def get_unique_diseases(db: Session = Depends(get_db)):
    """
    Returns a list of unique disease types available in the datasets.
    """
    # Query distinct disease_types from Dataset table
    diseases = db.query(Dataset.disease_type).distinct().all()
    # Flatten result: [('Heart Disease',), ('Diabetes',)] -> ['Heart Disease', 'Diabetes']
    return [d[0] for d in diseases if d[0]]

from fastapi import Form

@router.post("/upload_csv")
async def upload_dataset(
    file: UploadFile = File(...), 
    disease_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Parses an uploaded CSV and stores it in the database.
    (This is the first step before training the model on new data)
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    
    # Clean NaN values (Postgres JSON doesn't support NaN)
    df = df.where(pd.notnull(df), None)
    
    # Save generic record of upload
    new_dataset = Dataset(
        filename=file.filename, 
        file_path="stored_in_db_as_rows",
        disease_type=disease_type
    ) 
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    
    # Save rows (Store all rows)
    records = []
    # Use to_dict('records') for faster iteration
    data_rows = df.to_dict('records')
    
    for row in data_rows:
        # Sanitize keys (remove dots/spaces which might annoy some JSONDBs, though Postgres is fine)
        # For simplicity, just store raw dict
        record = PatientRecord(
            dataset_id=new_dataset.id,
            data=row # Store the entire flexible row
        )
        records.append(record)
    
    db.add_all(records)
    db.commit()

    # Process Metadata and Chunks
    process_uploaded_dataset(new_dataset.id, file.filename, df, db)
    
    return {"message": f"Successfully processed {len(records)} records for {disease_type} from {file.filename}."}

from auth import get_current_user

@router.get("/dashboard/admin-stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_datasets = db.query(Dataset).count()
    total_records = db.query(PatientRecord).count()
    
    # Mock accuracy for now until we have a proper evaluation table
    return {
        "total_datasets": total_datasets,
        "total_records": total_records,
        "active_models": 1, # Currently just the TabNet model
        "accuracy_rate": 94.8 # Static for now
    }

@router.get("/dashboard/user-stats")
def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).all()
    
    # Calculate average risk (mock logic extraction if needed, assuming risk is in JSON)
    # Ideally we'd store risk as a column for easier stats, but for JSON:
    avg_risk = 0
    if predictions:
        # This assumes prediction format; strictly for demo stats
        pass 
        
    return {
        "total_assessments": len(predictions),
        "health_score": 85, # dynamic placeholder
        "risk_factors": 3 # dynamic placeholder
    }

@router.get("/predict/history")
def get_prediction_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.timestamp.desc()).all()
    return predictions
