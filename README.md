# GynAssist 🩺

**GynAssist** es un asistente conversacional avanzado diseñado para ginecólogos y obstetras. Utiliza Inteligencia Artificial generativa con memoria persistente en la nube (Firebase Firestore) y herramientas de búsqueda en tiempo real para ofrecer un soporte clínico preciso y personalizado.

## 🚀 Características Principales

- **Identidad del Usuario**: Perfiles de pacientes detallados (Antecedentes G-O, Edad, FUM).
- **Memoria Persistente**: Historial de conversaciones que sobrevive a cierres de sesión.
- **Búsqueda Clínica**: Integración con Tavily para protocolos médicos y guías farmacológicas actualizadas.
- **Streaming de Respuestas**: Interfaz fluida con Server-Sent Events (SSE).
- **Seguridad**: Protocolo de alarma imperativo para síntomas de urgencia.

---

## 🛠️ Requisitos Previos

- **Python 3.11+**
- **Node.js 18+** (npm)
- **Docker & Docker Compose** (opcional para despliegue r rápido)
- **Cuentas en**:
  - [OpenAI](https://platform.openai.com/) (API Key)
  - [Tavily](https://tavily.com/) (API Key)
  - [Firebase](https://console.firebase.google.com/) (Proyecto con Firestore habilitado)

---

## 🔧 Configuración Inicial

### 1. Firebase Firestore
1. Crea un proyecto en la consola de Firebase.
2. Habilita **Firestore Database**.
3. Ve a `Configuración del proyecto > Cuentas de servicio` y genera una nueva clave privada. 
4. Descarga el JSON y guárdalo como `backend/firebase-service-account.json`.
5. **Configura el índice en Firestore**: Esto es vital para que las consultas de historial funcionen. Ve a la pestaña de Índices y crea uno para la colección `conversations` con los campos: `client_id` (Ascendente) y `updated_at` (Descendente).

### 2. Backend (FastAPI)
```bash
cd GynAssist/backend
# Crea y activa el entorno virtual
python -m venv venv
source venv/bin/activate # Linux/Mac
venv\Scripts\activate    # Windows

# Instala dependencias
pip install -r requirements.txt

# Configura variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales (OpenAI, Tavily, Firebase Project ID)
```

### 3. Frontend (React + Vite)
```bash
cd GynAssist/frontend

# Instala dependencias
npm install

# Configura variables de entorno (.env)
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_API_BASE_URL=http://localhost:8000
```

---

## 💾 Carga de Datos Iniciales

Para tener perfiles de prueba listos para usar, ejecuta el script de siembra en el backend:

```bash
cd GynAssist/backend
python seed.py
```

---

## 🖥️ Ejecución Local

### Backend
```bash
cd GynAssist/backend
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd GynAssist/frontend
npm run dev
```

---

## 🐳 Ejecución con Docker (Recomendado)

El proyecto incluye una configuración completa de Docker Compose para orquestar ambos servicios:

```bash
cd GynAssist
docker-compose up --build
```

- **API del Backend**: [http://localhost:8081](http://localhost:8081)
- **Frontend**: [http://localhost:8082](http://localhost:8082)

---

## 📄 Documentación Adicional

- **Repositorio**: [https://github.com/ArtModels/GynAssist](https://github.com/ArtModels/GynAssist)
- Para más detalles sobre el diseño clínico y decisiones técnicas, consulta el archivo [Caso_De_Uso.md](./Caso_De_Uso.md).
