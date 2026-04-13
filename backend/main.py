from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import clients_router, agent_router

app = FastAPI(
    title="GynAssist API",
    description="Backend clínico para el asistente ginecológico con memoria persistente",
    version="1.0.0"
)

# Configuración de CORS
# Permitimos todos en desarrollo, pero en producción Dokploy inyectamos el origen específico
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitimos temporalmente "*" para evitar bloqueos en el despliegue inicial
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas con prefijo global /api
app.include_router(clients_router.router, prefix="/api")
app.include_router(agent_router.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "GynAssist API is running. Check /docs for documentation."}

@app.get("/api/health")
def health_check():
    """Verificación de estado de la API"""
    return {"status": "ok", "service": "GynAssist"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
