from .client import get_async_db
from datetime import datetime
import re

def _slugify(name: str) -> str:
    """Convierte un nombre a un client_id seguro, ej: 'María López' → 'maria-lopez'"""
    s = name.lower().strip()
    s = re.sub(r'[áàä]', 'a', s)
    s = re.sub(r'[éèë]', 'e', s)
    s = re.sub(r'[íìï]', 'i', s)
    s = re.sub(r'[óòö]', 'o', s)
    s = re.sub(r'[úùü]', 'u', s)
    s = re.sub(r'[ñ]', 'n', s)
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s).strip('-')
    return s

async def get_client(client_id: str):
    """Obtiene un perfil de paciente por su ID desde la colección 'clients'"""
    db = get_async_db()
    query = db.collection("clients").where("client_id", "==", client_id).limit(1)
    docs = await query.get()
    if docs:
        return docs[0].to_dict()
    return None

async def get_clients():
    """Obtiene la lista de todas las pacientes registradas"""
    db = get_async_db()
    docs = await db.collection("clients").get()
    return [doc.to_dict() for doc in docs]

async def create_client(data: dict) -> dict:
    """Crea un nuevo perfil de paciente en Firestore"""
    db = get_async_db()
    base_id = _slugify(data["name"])
    # Ensure unique client_id by appending a timestamp suffix if needed
    suffix = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    client_id = f"{base_id}-{suffix}"

    doc = {
        "client_id": client_id,
        "name": data["name"],
        "edad": int(data["edad"]),
        "ocupacion": data.get("ocupacion", ""),
        "fum": data.get("fum", ""),
        "motivo_consulta": data.get("motivo_consulta", ""),
        "notas_relevantes": data.get("notas_relevantes", ""),
        "antecedentes_go": {
            "gestas": int(data.get("gestas", 0)),
            "partos": int(data.get("partos", 0)),
            "cesareas": int(data.get("cesareas", 0)),
            "abortos": int(data.get("abortos", 0)),
            "hijos_vivos": int(data.get("hijos_vivos", 0)),
        },
        "created_at": datetime.utcnow().isoformat(),
    }
    await db.collection("clients").document(client_id).set(doc)
    return doc

async def delete_client(client_id: str) -> bool:
    """Elimina un perfil de paciente de Firestore. Devuelve True si existía."""
    db = get_async_db()
    # Find by client_id field
    query = db.collection("clients").where("client_id", "==", client_id).limit(1)
    docs = await query.get()
    if not docs:
        return False
    await docs[0].reference.delete()
    return True
