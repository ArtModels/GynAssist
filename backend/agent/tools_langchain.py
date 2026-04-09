from langchain_core.tools import tool
from tools.tavily_search import search_content

@tool
async def search_real_time_info(query: str) -> str:
    """
    Busca información médica y clínica actualizada en internet.
    Usa esta herramienta cuando la consulta requiera datos sobre protocolos médicos nuevos,
    disponibilidad de fármacos o información clínica que no esté presente en tu memoria persistente.
    """
    results = await search_content(query)
    if not results:
        return "No se encontraron resultados clínicos para esa consulta en internet."
    
    formatted = [f"**{r['title']}**\n{r['content']}\nFuente: {r['url']}" for r in results]
    return "\n\n---\n\n".join(formatted)
