from database import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        try:
            # 1. Add metadata_info column to datasets
            print("Adding metadata_info to datasets...")
            conn.execute(text("ALTER TABLE datasets ADD COLUMN IF NOT EXISTS metadata_info JSON DEFAULT '{}'"))
            
            # 2. Add is_processed column to datasets
            print("Adding is_processed to datasets...")
            conn.execute(text("ALTER TABLE datasets ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE"))
            
            print("Schema updated successfully.")
            conn.commit()
        except Exception as e:
            print(f"Error updating schema: {e}")

if __name__ == "__main__":
    update_schema()
