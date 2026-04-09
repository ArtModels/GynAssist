from pydantic import BaseModel
from typing import Optional, List, Dict

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class AntecedentesGO(BaseModel):
    gestas: int
    partos: int
    cesareas: int
    abortos: int
    hijos_vivos: int

class Client(BaseModel):
    client_id: str
    name: str
    edad: int
    ocupacion: str
    motivo_consulta: str
    antecedentes_go: AntecedentesGO
    fum: str
    notas_relevantes: str

class ChatRequest(BaseModel):
    client_id: str
    message: str
    conversation_id: Optional[str] = None
