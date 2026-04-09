from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import clients_router, agent_router

app = FastAPI(
    title="GynAssist API",
    description="Backend clínico para el asistente ginecológico con memoria persistente",
    version="1.0.0"
)

# Configuración de CORS
# En producción, cambia "*" por la URL de tu frontend (ej. https://gynassist.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas
app.include_router(clients_router.router)
app.include_router(agent_router.router)

@app.get("/health")
def health_check():
    """Verificación de estado de la API"""
    return {"status": "ok", "service": "GynAssist"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
