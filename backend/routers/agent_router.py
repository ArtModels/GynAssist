import json
from fastapi import APIRouter, Query
from sse_starlette.sse import EventSourceResponse
from firebase.clients import get_client
from firebase.chat_history import create_conversation, add_message, get_conversation
from agent.agent import create_agent, build_chat_history
from firebase_admin import auth as firebase_auth
from auth import get_current_user

router = APIRouter(prefix="/agent", tags=["agent"])

@router.get("/stream")
async def stream(
    client_id: str = Query(...), 
    message: str = Query(...), 
    conversation_id: str = Query(None),
    token: str = Query(...)
):
    """Endpoint SSE para el chat interactivo con el agente clínico"""
    try:
        # Validar token para SSE (viene por query param)
        user = firebase_auth.verify_id_token(token)
    except Exception:
        return {"error": "No autorizado"}

    client = await get_client(client_id)
    if not client:
        return {"error": "Perfil de paciente no encontrado"}

    # Crear conversación si no existe
    if not conversation_id:
        conversation_id = await create_conversation(client_id)
    
    # Añadir mensaje del humano a Firestore
    await add_message(conversation_id, "human", message)
    
    async def event_generator():
        full_response = ""
        # Recuperar historial previo para el contexto del agente
        conv_data = await get_conversation(conversation_id)
        # Excluimos el último mensaje que acabamos de añadir para que el agente lo procese como 'input'
        history = build_chat_history(conv_data.get("messages", [])[:-1])
        
        agent_executor = create_agent(client)
        
        async for event in agent_executor.astream_events(
            {"input": message, "chat_history": history},
            version="v2"
        ):
            # Filtrar tokens del modelo
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    full_response += chunk.content
                    yield {
                        "event": "token",
                        "data": json.dumps({"content": chunk.content})
                    }
            # Indicar inicio de ejecución de herramienta (Tavily)
            elif event["event"] == "on_tool_start":
                yield {
                    "event": "tool_call",
                    "data": json.dumps({"tool": event["name"]})
                }
        
        # Guardar respuesta final de la IA en Firestore
        await add_message(conversation_id, "ai", full_response)
        
        # Notificar fin de flujo
        yield {
            "event": "done",
            "data": json.dumps({"conversation_id": conversation_id})
        }

    return EventSourceResponse(event_generator())
