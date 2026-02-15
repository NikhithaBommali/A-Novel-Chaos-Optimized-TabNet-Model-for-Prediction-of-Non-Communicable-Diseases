from database import SessionLocal
from models import Dataset

db = SessionLocal()
datasets = db.query(Dataset).all()
print(f"Total Datasets: {len(datasets)}")
for d in datasets:
    print(f"ID: {d.id}, Filename: {d.filename}, Processed: {d.is_processed}, Metadata: {d.metadata_info}")
db.close()
