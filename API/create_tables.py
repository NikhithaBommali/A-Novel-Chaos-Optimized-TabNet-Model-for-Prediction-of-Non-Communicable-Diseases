from database import engine, Base
from models import User, Dataset, PatientRecord, Prediction

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
