import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Get database URL from environment variable (e.g. Supabase, Neon, Render PostgreSQL)
    database_url = os.environ.get('DATABASE_URL')
    
    # Handle the postgres:// -> postgresql:// rewrite that many cloud providers (like Render/Heroku) require
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
        
    # Fallback to local SQLite if no external database URL is configured
    SQLALCHEMY_DATABASE_URI = database_url or 'sqlite:///portfolio.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
