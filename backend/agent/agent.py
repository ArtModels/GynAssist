from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_classic.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from .tools_langchain import search_real_time_info
from config import get_settings

SYSTEM_TEMPLATE = """Eres GynAssist, un asistente experto en ginecología y obstetricia con un enfoque estrictamente clínico, profesional y técnico.

REGLAS DE ACTUCIÓN:
1. PERSONALIZACIÓN OBLIGATORIA: Debes usar los datos del perfil de la paciente para contextualizar tus respuestas médicas.
2. TONO CLÍNICO: Tu lenguaje debe ser preciso, objetivo y basado en evidencia médica. No divagues ni uses un lenguaje coloquial.
3. PROTOCOLO DE ALARMA: Ante cualquier mención de síntomas agudos (dolor intenso, sangrado abundante), indica de manera imperativa que la paciente debe acudir al servicio de urgencias más cercano.
4. HERRAMIENTAS: Utiliza la herramienta de búsqueda para protocolos externos o información farmacológica actualizada si no la tienes en tu memoria base.

DATOS CLÍNICOS DE LA PACIENTE:
Nombre: {name}
Edad: {edad}
Motivo de consulta: {motivo_consulta}
Antecedentes G-O: {antecedentes_go}
FUM (Última Menstruación): {fum}
Notas relevantes: {notas_relevantes}

Responde de manera concisa y orientada a la resolución clínica basada en estos datos.
"""

def build_system_prompt(client: dict) -> str:
    # Formateamos los antecedentes para evitar llaves {} que LangChain confunda con variables
    ant = client.get('antecedentes_go', {})
    ant_str = (
        f"Gestas: {ant.get('gestas', 0)}, Partos: {ant.get('partos', 0)}, "
        f"Cesáreas: {ant.get('cesareas', 0)}, Abortos: {ant.get('abortos', 0)}, "
        f"Hijos Vivos: {ant.get('hijos_vivos', 0)}"
    )
    
    return SYSTEM_TEMPLATE.format(
        name=client.get('name', 'Usuario'),
        edad=client.get('edad', 'No especificada'),
        motivo_consulta=client.get('motivo_consulta', 'General'),
        antecedentes_go=ant_str,
        fum=client.get('fum', 'No proporcionada'),
        notas_relevantes=client.get('notas_relevantes', 'Ninguna')
    )

def build_chat_history(messages: list[dict]) -> list:
    history = []
    for msg in messages:
        if msg['role'] == 'human':
            history.append(HumanMessage(content=msg['content']))
        elif msg['role'] == 'ai':
            history.append(AIMessage(content=msg['content']))
    return history

def create_agent(client: dict):
    settings = get_settings()
    # Usamos temperatura 0 para garantizar respuestas clínicas deterministas y precisas.
    llm = ChatOpenAI(
        model="gpt-4o", 
        api_key=settings.openai_api_key,
        temperature=0.0,
        streaming=True
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", build_system_prompt(client)),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])
    
    agent = create_openai_tools_agent(llm, [search_real_time_info], prompt)
    return AgentExecutor(
        agent=agent, 
        tools=[search_real_time_info],
        verbose=False, 
        handle_parsing_errors=True,
        max_iterations=5
    )
