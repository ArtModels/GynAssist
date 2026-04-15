# GynAssist - Caso de Uso

## 1. Definición del Dominio
**GynAssist** es un asistente conversacional inteligente especializado en el área de **Ginecología y Obstetricia**. Su propósito es servir como una herramienta de apoyo clínico para médicos ginecólogos, facilitando la interacción con los datos de las pacientes y proporcionando respuestas basadas en el historial clínico almacenado y protocolos médicos actualizados.

## 2. Perfil del Usuario (Paciente)
El sistema utiliza una colección en Firestore llamada `clients` para almacenar perfiles detallados de las pacientes. Esto permite que el asistente tenga un contexto completo antes de iniciar cualquier conversación.

### Campos identificados:
- `client_id`: Identificador único de la paciente.
- `name`: Nombre completo.
- `edad`: Edad actual (crítico para diagnóstico y protocolos).
- `ocupacion`: Contexto socio-laboral.
- `motivo_consulta`: Razón principal de la visita actual.
- `antecedentes_go`: Objeto que detalla la historia reproductiva:
    - `gestas`: Número de embarazos.
    - `partos`: Partos vaginales.
    - `cesareas`: Intervenciones quirúrgicas.
    - `abortos`.
    - `hijos_vivos`.
- `fum`: Fecha de Última Menstruación (vital para cálculo de semanas de gestación).
- `notas_relevantes`: Hallazgos previos, alergias o condiciones crónicas.

## 3. Herramienta de Búsqueda
GynAssist integra la API de **Tavily** para realizar búsquedas en tiempo real. 
**Casos de uso específicos para la herramienta:**
- Consultar protocolos clínicos actualizados (ej. Guías ACOG o SEGO).
- Verificar dosis farmacológicas compatibles con el embarazo o lactancia.
- Buscar noticias recientes del sector salud femenino.

## 4. System Prompt
El prompt del sistema está diseñado para forzar un comportamiento profesional y seguro:

```text
Eres GynAssist, un asistente experto en ginecología y obstetricia con un enfoque estrictamente clínico, profesional y técnico.

REGLAS DE ACTUACIÓN:
1. PERSONALIZACIÓN OBLIGATORIA: Debes usar los datos del perfil de la paciente para contextualizar tus respuestas médicas.
2. TONO CLÍNICO: Tu lenguaje debe ser preciso, objetivo y basado en evidencia médica. No divagues ni uses un lenguaje coloquial.
3. PROTOCOLO DE ALARMA: Ante cualquier mención de síntomas agudos (dolor intenso, sangrado abundante), indica de manera imperativa que la paciente debe acudir al servicio de urgencias más cercano.
4. HERRAMIENTAS: Utiliza la herramienta de búsqueda para protocolos externos o información farmacológica actualizada si no la tienes en tu memoria base.

DATOS CLÍNICOS DE LA PACIENTE:
Nombre: {name}
Edad: {edad}
Motivo de consulta: {motivo_consulta}
Antecedentes G-O: {antecedentes_go}
FUM: {fum}
Notas relevantes: {notas_relevantes}

Responde de manera concisa y orientada a la resolución clínica basada en estos datos.
```

## 5. Decisiones de Diseño y Memoria
- **Memoria Persistente**: Se almacena el historial completo de conversaciones en Firestore asociado al `client_id`. Esto asegura que el médico pueda retomar la consulta en cualquier momento sin perder el hilo clínico.
- **Temperatura 0**: El agente utiliza una temperatura de 0.0 para maximizar la precisión y determinismo en sus respuestas, evitando alucinaciones creativas que no tienen lugar en un entorno médico.
- **Protocolo de Alarma**: Se prioriza la seguridad del paciente ante síntomas de riesgo.
