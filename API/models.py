from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # "admin" or "user"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    uploads = relationship("Dataset", back_populates="owner")
    predictions = relationship("Prediction", back_populates="user")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Metadata for dynamic Chat (e.g., {"features": ["age", "bp"], "target": "risk"})
    metadata_info = Column(JSON, default={})
    disease_type = Column(String, index=True) # e.g., "Heart Disease"
    is_processed = Column(Boolean, default=False)

    owner = relationship("User", back_populates="uploads")
    records = relationship("PatientRecord", back_populates="dataset")
    chunks = relationship("DatasetChunk", back_populates="dataset")


class PatientRecord(Base):
    __tablename__ = "patient_records"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    
    # Clinical Features (Stored dynamically to support multiple disease types)
    data = Column(JSON)
    
    # Legacy/Rigid columns (Commented out / Nullable for now to prefer JSON)
    # age = Column(Integer)
    # gender = Column(String)
    # bmi = Column(Float)
    # blood_pressure = Column(Float) 
    # cholesterol = Column(Float)
    # glucose = Column(Float)
    # smoker = Column(String) 
    # physical_activity = Column(String)
    
    # Target Labels (can also be in data json, but keeping explicit if needed for specific logic)
    # has_heart_disease = Column(Boolean, nullable=True)
    # has_diabetes = Column(Boolean, nullable=True)
    # has_cancer = Column(Boolean, nullable=True)
    
    dataset = relationship("Dataset", back_populates="records")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Input data snapshot (JSON to be flexible)
    input_data = Column(JSON) 
    
    # Results
    risk_scores = Column(JSON) # e.g., {"heart": 85.5, "diabetes": 12.0}
    explanations = Column(JSON) # SHAP values or feature importances
    
    user = relationship("User", back_populates="predictions")

class DatasetChunk(Base):
    __tablename__ = "dataset_chunks"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    chunk_index = Column(Integer)
    content = Column(Text) # Store row data as text or JSON string for RAG/Retrieval
    
    dataset = relationship("Dataset", back_populates="chunks")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True) # Context dataset
    disease_type = Column(String, nullable=True) # e.g., "Heart Disease"
    status = Column(String, default="active") # active, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # State tracking for slot filling (e.g., {"age": 50, "asked": ["age"]})
    current_state = Column(JSON, default={}) 
    
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")
    dataset = relationship("Dataset") # Link to specific dataset used

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String) # "user" or "bot"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")

# Update User relationship
User.chat_sessions = relationship("ChatSession", back_populates="user")

