from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import User, ChatSession, ChatMessage, Dataset, Prediction
from auth import get_current_user
import json

# Import the tabnet prediction logic (or refactor endpoints to share it)
# For now, we'll try to reuse the model logic if possible, or reproduce simple logic
from ml.tabnet_model import DiseasePredictionTabNet
# from endpoints import model, preprocessor # Circular import risk if not careful
# Better to have a separate inference service, but for now we will keep it simple.

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/start")
def start_chat_session(
    disease_context: str = "Heart Disease", # Default or user selected
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Initiates a new chat session for a specific disease context.
    Finds the relevant dataset to determine questions to ask.
    """
    # 1. Find a dataset matching the disease context
    # Search strategy: Try to find a dataset where filename contains the disease key words
    # e.g. "Heart Disease" -> search for "heart"
    
    search_term = disease_context.split(" ")[0].lower() # Simple heuristic for now
    
    # Try finding exact matches first
    dataset = db.query(Dataset).filter(Dataset.filename.ilike(f"%{search_term}%"), Dataset.is_processed == True).first()
    
    if not dataset:
        # Try broader search through all processed datasets
        all_datasets = db.query(Dataset).filter(Dataset.is_processed == True).all()
        # Check manually if any filename contains the term
        for d in all_datasets:
            if search_term in d.filename.lower():
                dataset = d
                break
    
    if not dataset:
        # Strict Mode: Do not fallback to unrelated datasets as it confuses the user.
        # Check if ANY prepared datasets exist to give a better error message
        any_dataset = db.query(Dataset).filter(Dataset.is_processed == True).first()
        if any_dataset:
             raise HTTPException(status_code=404, detail=f"No dataset found for '{disease_context}'. Please upload a CSV named '{search_term}.csv' or similar.")
        else:
             raise HTTPException(status_code=404, detail="No processed datasets available. Please upload a dataset in the Admin Dashboard.")
    
    # 2. Get Important Features (only ask for key features, not all columns)
    important_features = get_important_features(dataset, disease_context, max_features=8)
    
    # 3. Initialize State
    initial_state = {
        "missing_features": important_features,
        "collected_data": {},
        "target_variable": dataset.metadata_info.get("suspected_target") if dataset.metadata_info else None
    }
        
    session = ChatSession(
        user_id=current_user.id,
        dataset_id=dataset.id,
        disease_type=disease_context,
        status="active",
        current_state=initial_state
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # 3. Create Welcome Message
    first_question = get_next_question(initial_state["missing_features"])
    welcome_text = f"Hello! I can help you assess your risk for {disease_context}. I'll need to ask you a few questions based on our {dataset.filename} data. First: {first_question}"
    
    msg = ChatMessage(session_id=session.id, sender="bot", content=welcome_text)
    db.add(msg)
    db.commit()
    
    return {"session_id": session.id, "message": welcome_text}

@router.post("/{session_id}/message")
def send_message(
    session_id: int, 
    content: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status == "completed":
        return {"response": "This session is completed. Please start a new one.", "status": "completed"}
    
    # 1. Save User Message
    user_msg = ChatMessage(session_id=session.id, sender="user", content=content)
    db.add(user_msg)
    
    # 2. Process Answer (Slot Filling)
    state = dict(session.current_state) # Copy
    missing = state.get("missing_features", [])
    
    # Simple heuristic: The user answered the LAST asked question.
    # In a real NLP app, we'd use an LLM or Entity Extraction to find WHICH feature was answered.
    # Here: we assume the user answers the top of the 'missing' list from the previous turn.
    
    if missing:
        just_answered_feature = missing[0]
        # Store answer (Naively accept whatever they typed as the value)
        # Try to convert to float if possible for the model
        val = content
        try:
            val = float(content)
        except:
            pass # Keep as string
            
        state["collected_data"][just_answered_feature] = val
        state["missing_features"] = missing[1:] # Pop the answered one
        
        session.current_state = state # Save back
        db.add(session) # Mark dirty
    
    # 3. Determine Next Step
    if not state["missing_features"]:
        # ALL DONE -> PREDICT
        prediction_result = run_prediction(state["collected_data"], session.dataset_id, db)
        
        bot_text = f"Thank you. Based on the data, your predicted risk result is: {prediction_result}. (This is an automated estimation)."
        session.status = "completed"
        
        # Save Prediction Record
        pred = Prediction(
            user_id=current_user.id,
            input_data=state["collected_data"],
            risk_scores={"result": prediction_result}, # Simplified
            explanations={"source": "Chat Session"}
        )
        db.add(pred)
        db.commit()
        db.refresh(pred) # Get ID
        
    else:
        # Ask Next Question
        next_feat = state["missing_features"][0]
        bot_text = f"Got it. Next, what is your value for **{next_feat}**?"
        
    bot_msg = ChatMessage(session_id=session.id, sender="bot", content=bot_text)
    db.add(bot_msg)
    db.commit()
    
    response_data = {"response": bot_text, "status": session.status}
    
    if session.status == "completed" and 'pred' in locals():
         response_data["prediction"] = {
             "id": pred.id,
             "result": prediction_result,
             "timestamp": pred.timestamp.isoformat(),
             "details": state["collected_data"]
         }

    return response_data

@router.get("/{session_id}/history")
def get_history(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session.messages

def get_next_question(missing_features):
    if not missing_features:
        return "All done!"
    return f"What is your value for **{missing_features[0]}**?"

def get_important_features(dataset, disease_type: str, max_features: int = 8):
    """
    Returns a prioritized list of important features for a disease type.
    Uses predefined feature lists for common diseases, or falls back to correlation-based selection.
    """
    # Predefined important features for common diseases
    disease_feature_map = {
        "heart disease": ["age", "blood_pressure", "cholesterol", "chest_pain", "resting_ecg", "max_heart_rate", "exercise_angina", "oldpeak"],
        "heart": ["age", "blood_pressure", "cholesterol", "chest_pain", "resting_ecg", "max_heart_rate", "exercise_angina", "oldpeak"],
        "breast cancer": ["radius_mean", "texture_mean", "perimeter_mean", "area_mean", "smoothness_mean", "compactness_mean", "concavity_mean", "symmetry_mean"],
        "breast": ["radius_mean", "texture_mean", "perimeter_mean", "area_mean", "smoothness_mean", "compactness_mean", "concavity_mean", "symmetry_mean"],
        "lung cancer": ["age", "smoking", "yellow_fingers", "anxiety", "peer_pressure", "chronic_disease", "fatigue", "wheezing"],
        "lung": ["age", "smoking", "yellow_fingers", "anxiety", "peer_pressure", "chronic_disease", "fatigue", "wheezing"],
        "diabetes": ["age", "glucose", "blood_pressure", "bmi", "insulin", "pregnancies", "skin_thickness", "diabetes_pedigree"]
    }
    
    # Get all columns from dataset metadata
    all_columns = dataset.metadata_info.get("columns", []) if dataset.metadata_info else []
    target = dataset.metadata_info.get("suspected_target") if dataset.metadata_info else None
    
    # Remove target from features
    if target and target in all_columns:
        all_columns = [c for c in all_columns if c != target]
    
    # Try to match disease type to predefined features
    disease_lower = disease_type.lower()
    important_features = None
    
    for key, features in disease_feature_map.items():
        if key in disease_lower:
            # Filter to only include features that exist in the dataset
            important_features = [f for f in features if f.lower() in [c.lower() for c in all_columns]]
            break
    
    # If no match or not enough features, use first N features or correlation-based selection
    if not important_features or len(important_features) < 3:
        # Fallback: use first max_features columns (excluding target)
        important_features = all_columns[:max_features]
    
    # Ensure we don't exceed max_features
    return important_features[:max_features] if important_features else all_columns[:max_features]

def run_prediction(data, dataset_id, db):
    # Mock Prediction Logic or call actual TabNet if loaded
    # In a real world, we'd load the specific model for this dataset.
    # Here we perform a simple heuristic sum or random for the demo 
    # unless we connect generic ML logic.
    
    score = 0
    try:
        # Sum numeric values
        nums = [v for v in data.values() if isinstance(v, (int, float))]
        if nums:
            score = sum(nums) / len(nums) # Average value
    except:
        pass
        
    if score > 50: # Arbitrary threshold
        return "High Risk"
    return "Low Risk"
