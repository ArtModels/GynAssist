from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import os

# Dependencia para seguridad con Bearer Token
security = HTTPBearer()

# Aseguramos que Firebase esté inicializado
# El backend asume que ya se inicializó en los modelos de base de datos
# Pero por seguridad, si no hay apps, inicializamos aquí.
try:
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./firebase-service-account.json")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Error al inicializar Firebase Admin en auth.py: {e}")

async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifica el Firebase ID Token enviado en la cabecera Authorization.
    Retorna el diccionario del usuario si es válido, de lo contrario lanza 401.
    """
    token = res.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
