from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


database_URL = f"mysql+pymysql://root:1234@localhost:3306/lognlook"
engine = create_engine(database_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()