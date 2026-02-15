from database import SessionLocal
from models import Dataset, PatientRecord
from dataset_service import process_uploaded_dataset
import pandas as pd

def reprocess():
    db = SessionLocal()
    datasets = db.query(Dataset).filter(Dataset.is_processed == False).all()
    
    print(f"Found {len(datasets)} unprocessed datasets.")
    
    for dataset in datasets:
        print(f"Processing {dataset.filename}...")
        
        # 1. Fetch records
        records = db.query(PatientRecord).filter(PatientRecord.dataset_id == dataset.id).all()
        if not records:
            print(f"No records found for {dataset.filename}. Skipping.")
            continue
            
        data = [r.data for r in records if r.data]
        if not data:
            print("Records have no JSON data. Skipping.")
            continue
            
        df = pd.DataFrame(data)
        
        # 2. Process
        process_uploaded_dataset(dataset.id, dataset.filename, df, db)
        print(f"Successfully processed {dataset.filename}.")
        
    db.close()

if __name__ == "__main__":
    reprocess()
