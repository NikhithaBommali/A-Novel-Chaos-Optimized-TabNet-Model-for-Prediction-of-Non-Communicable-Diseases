from typing import Generator

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
