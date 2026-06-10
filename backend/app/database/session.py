from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
import os
import logging

logger = logging.getLogger(__name__)

_user     = os.environ["MYSQL_USER"]
_password = quote_plus(os.environ["MYSQL_PASSWORD"])
_host     = os.environ.get("MYSQL_HOST", "mysql")
_port     = os.environ.get("MYSQL_PORT", "3306")
_db       = os.environ["MYSQL_DATABASE"]

DATABASE_URL = f"mysql+pymysql://{_user}:{_password}@{_host}:{_port}/{_db}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()