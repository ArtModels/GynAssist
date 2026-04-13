from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Definimos las llaves exactas que pusiste en tu .env
    openai_api_key: str
    tavily_api_key: str
    firebase_project_id: str
    google_application_credentials: str = './firebase-service-account.json'
    firebase_service_account_json: str | None = None # Nueva variable para el JSON directo

    # Le indicamos que lea el archivo .env
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore" # Ignora variables extra en el entorno
    }

    def get_firebase_credentials(self):
        """Retorna las credenciales desde JSON o desde el archivo físico"""
        import json
        from firebase_admin import credentials
        
        if self.firebase_service_account_json:
            try:
                cred_dict = json.loads(self.firebase_service_account_json)
                return credentials.Certificate(cred_dict)
            except Exception as e:
                print(f"Error al parsear FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        
        # Fallback al archivo físico
        return credentials.Certificate(self.google_application_credentials)

@lru_cache
def get_settings() -> Settings:
    """Carga la configuración una sola vez y la guarda en caché"""
    return Settings()
