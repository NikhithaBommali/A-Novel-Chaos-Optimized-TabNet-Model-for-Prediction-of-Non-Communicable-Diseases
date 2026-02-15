try:
    from main import app
    from models import DatasetChunk, ChatSession, ChatMessage
    from chat import router
    from dataset_service import process_uploaded_dataset
    print("Imports successful")
except Exception as e:
    print(f"Import failed: {e}")
