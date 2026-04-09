from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Definimos las llaves exactas que pusiste en tu .env
    openai_api_key: str
    tavily_api_key: str
    firebase_project_id: str
    google_application_credentials: str = './firebase-service-account.json'

    # Le indicamos que lea el archivo .env
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }

@lru_cache
def get_settings() -> Settings:
    """Carga la configuración una sola vez y la guarda en caché"""
    return Settings()
