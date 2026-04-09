from fastapi import APIRouter, HTTPException, Depends
from firebase.clients import get_client, get_clients, create_client, delete_client
from firebase.chat_history import get_conversations_for_client, get_conversation
from auth import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("/")
async def list_clients(user: dict = Depends(get_current_user)):
    """Enumera todos los perfiles de pacientes en Firestore"""
    return await get_clients()

@router.post("/", status_code=201)
async def add_client(body: dict, user: dict = Depends(get_current_user)):
    """Crea un nuevo perfil de paciente"""
    if not body.get("name") or not body.get("edad"):
        raise HTTPException(status_code=422, detail="Nombre y edad son obligatorios")
    return await create_client(body)

@router.get("/{client_id}")
async def fetch_client(client_id: str, user: dict = Depends(get_current_user)):
    """Obtiene el perfil detallado de una paciente específica"""
    client = await get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Paciente no encontrada")
    return client

@router.delete("/{client_id}", status_code=204)
async def remove_client(client_id: str, user: dict = Depends(get_current_user)):
    """Elimina el perfil de una paciente y sus conversaciones"""
    deleted = await delete_client(client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Paciente no encontrada")

@router.get("/{client_id}/conversations")
async def list_conversations(client_id: str, user: dict = Depends(get_current_user)):
    """Lista el historial de conversaciones de una paciente, ordenadas por fecha"""
    return await get_conversations_for_client(client_id)

@router.get("/{client_id}/conversations/{conversation_id}")
async def fetch_conversation(client_id: str, conversation_id: str, user: dict = Depends(get_current_user)):
    """Obtiene una conversación específica con todos sus mensajes"""
    conv = await get_conversation(conversation_id)
    if not conv or conv.get("client_id") != client_id:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return {"id": conversation_id, **conv}
