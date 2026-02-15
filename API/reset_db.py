from database import engine, Base
from models import User, Dataset, PatientRecord, Prediction

print("Resetting database tables...")
# Drop all tables to apply the new schema (PatientRecord change to JSON)
Base.metadata.drop_all(bind=engine)
# Re-create all tables
Base.metadata.create_all(bind=engine)
print("Database schema updated successfully!")
