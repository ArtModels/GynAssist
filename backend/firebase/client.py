import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import AsyncClient
from config import get_settings

_app = None
_async_db = None

def get_firebase_app():
    global _app
    if _app is None:
        settings = get_settings()
        cred = credentials.Certificate(settings.google_application_credentials)
        _app = firebase_admin.initialize_app(cred, {'projectId': settings.firebase_project_id})
    return _app

def get_sync_db(): # solo para seed.py
    get_firebase_app()
    return firestore.client()

def get_async_db() -> AsyncClient: # para endpoints async
    global _async_db
    if _async_db is None:
        settings = get_settings()
        cred = credentials.Certificate(settings.google_application_credentials)
        _async_db = AsyncClient(
            project=settings.firebase_project_id,
            credentials=cred.get_credential()
        )
    return _async_db
