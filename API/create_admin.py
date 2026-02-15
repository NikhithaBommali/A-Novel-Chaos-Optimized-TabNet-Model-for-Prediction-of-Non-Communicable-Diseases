import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash
import getpass

def create_admin():
    print("--- Create Admin User ---")
    
    email = input("Enter Admin Email (default: admin@example.com): ").strip()
    if not email:
        email = "admin@example.com"
        
    # Check if user exists
    db: Session = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        print(f"User {email} already exists.")
        if existing_user.role == "admin":
            print("And is already an admin.")
            db.close()
            return
        else:
            update = input("User exists but is not admin. Promote to admin? (y/n): ").lower()
            if update == 'y':
                existing_user.role = "admin"
                db.commit()
                print(f"User {email} promoted to admin.")
            db.close()
            return

    password = getpass.getpass("Enter Admin Password (default: admin123): ").strip()
    if not password:
        password = "admin123"
        print("Using default password: admin123")
        
    confirm_password = getpass.getpass("Confirm Password: ").strip()
    if password != "admin123" and password != confirm_password:
        print("Passwords do not match.")
        db.close()
        return

    full_name = input("Enter Full Name (default: System Admin): ").strip()
    if not full_name:
        full_name = "System Admin"

    new_admin = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role="admin"
    )
    
    db.add(new_admin)
    db.commit()
    print(f"Admin user {email} created successfully.")
    db.close()

if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    create_admin()
