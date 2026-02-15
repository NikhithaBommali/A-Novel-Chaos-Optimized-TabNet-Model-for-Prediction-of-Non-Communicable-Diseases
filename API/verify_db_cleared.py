from database import SessionLocal
from models import User, Dataset, PatientRecord, Prediction, ChatSession, ChatMessage

def verify_empty():
    db = SessionLocal()
    try:
        users_count = db.query(User).count()
        datasets_count = db.query(Dataset).count()
        records_count = db.query(PatientRecord).count()
        predictions_count = db.query(Prediction).count()
        sessions_count = db.query(ChatSession).count()
        messages_count = db.query(ChatMessage).count()

        print(f"Users: {users_count}")
        print(f"Datasets: {datasets_count}")
        print(f"PatientRecords: {records_count}")
        print(f"Predictions: {predictions_count}")
        print(f"ChatSessions: {sessions_count}")
        print(f"ChatMessages: {messages_count}")

        if all(c == 0 for c in [users_count, datasets_count, records_count, predictions_count, sessions_count, messages_count]):
            print("SUCCESS: All tables are empty.")
        else:
            print("FAILURE: Some tables are not empty.")
    finally:
        db.close()

if __name__ == "__main__":
    verify_empty()
