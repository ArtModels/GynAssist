from datetime import datetime
from .client import get_async_db
from google.cloud.firestore import ArrayUnion

async def create_conversation(client_id: str):
    """Crea un documento nuevo en la colección 'conversations' y devuelve su ID"""
    db = get_async_db()
    _, doc_ref = await db.collection("conversations").add({
        "client_id": client_id,
        "messages": [],
        "updated_at": datetime.utcnow()
    })
    return doc_ref.id

async def get_conversation(conversation_id: str):
    """Lee el documento completo con todos sus mensajes"""
    db = get_async_db()
    doc = await db.collection("conversations").document(conversation_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

async def add_message(conv_id: str, role: str, content: str):
    """Agrega un mensaje (human o ai) al array de mensajes del documento"""
    db = get_async_db()
    await db.collection("conversations").document(conv_id).update({
        "messages": ArrayUnion([{
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }]),
        "updated_at": datetime.utcnow()
    })

async def get_conversations_for_client(client_id: str):
    """Lista las conversaciones de un usuario ordenadas por fecha de actualización.
    
    NOTA: No usamos order_by() en Firestore porque requiere un índice compuesto.
    Ordenamos en Python para evitar esa dependencia.
    Si el índice ya fue creado en la consola, se puede restaurar el order_by.
    """
    db = get_async_db()
    # Solo filtramos por client_id (no necesita índice compuesto)
    query = db.collection("conversations").where("client_id", "==", client_id)
    docs = await query.get()
    results = [{"id": d.id, **d.to_dict()} for d in docs]

    # Ordenar en Python por updated_at descendente
    def sort_key(conv):
        val = conv.get("updated_at")
        if val is None:
            return 0
        if hasattr(val, "timestamp"):   # Firestore Timestamp object
            return val.timestamp()
        if hasattr(val, "isoformat"):   # Python datetime
            return val.timestamp()
        return 0

    results.sort(key=sort_key, reverse=True)
    return results

async def delete_conversation(conversation_id: str):
    """Elimina el documento de Firestore"""
    db = get_async_db()
    await db.collection("conversations").document(conversation_id).delete()
