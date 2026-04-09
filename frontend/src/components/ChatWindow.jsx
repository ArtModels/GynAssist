import { useEffect, useRef, useState } from 'react';
import { Send, Search, Trash2, Stethoscope, AlertTriangle, Loader } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import './ChatWindow.css';

const URGENT_KEYWORDS = ['dolor intenso', 'sangrado abundante', 'desmayo', 'urgencia', 'emergencia', 'urgente'];

function MessageBubble({ msg }) {
  const isHuman = msg.role === 'human';
  const isUrgent = !isHuman && URGENT_KEYWORDS.some(k => msg.content?.toLowerCase().includes(k));

  return (
    <div className={`msg-row ${isHuman ? 'msg-row--human' : 'msg-row--ai'}`}
      style={{ animation: 'fade-in-up 0.3s ease' }}>
      {!isHuman && (
        <div className={`msg-avatar ${isUrgent ? 'msg-avatar--urgent' : ''}`}>
          <Stethoscope size={14} strokeWidth={1.5} />
        </div>
      )}
      <div className={`msg-bubble ${isHuman ? 'msg-bubble--human' : 'msg-bubble--ai'} ${isUrgent ? 'msg-bubble--urgent' : ''} ${msg.error ? 'msg-bubble--error' : ''}`}>
        {isUrgent && (
          <div className="msg-urgent-badge">
            <AlertTriangle size={11} /> Indicación de atención urgente
          </div>
        )}
        <p className="msg-text">{msg.content}
          {msg.streaming && <span className="msg-cursor" />}
        </p>
      </div>
    </div>
  );
}

export default function ChatWindow({ client, initialConversationId }) {
  const { messages, isStreaming, isToolActive, isLoadingHistory, conversationId, sendMessage, loadConversation, clearChat } = useChat(client);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-load conversation when parent selects one from history
  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId);
    } else {
      clearChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <div className="chat-header-info">
          <Stethoscope size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)' }} />
          <span className="chat-header-title">
            {conversationId ? 'Consulta en curso' : 'Nueva Consulta'}
          </span>
          {isToolActive && (
            <div className="chat-tool-indicator">
              <Search size={11} />
              Buscando información médica...
            </div>
          )}
        </div>
        {messages.length > 0 && (
          <button className="chat-clear" onClick={clearChat} title="Limpiar conversación">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="chat-messages">
        {isLoadingHistory && (
          <div className="chat-loading-history">
            <Loader size={20} strokeWidth={1.5} className="spin" />
            <span>Cargando historial de consulta...</span>
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <Stethoscope size={28} strokeWidth={1} />
            </div>
            <p className="chat-empty-title">Consulta Iniciada</p>
            <p className="chat-empty-sub">
              Paciente: <strong>{client?.name}</strong>. Ingrese su consulta clínica para comenzar.
            </p>
            <div className="chat-suggestions">
              {[
                '¿Cuáles son los síntomas esperados según la FUM?',
                '¿Qué controles prenatales corresponden?',
                'Revisar antecedentes obstétricos',
              ].map(s => (
                <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {!isLoadingHistory && messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <div className={`chat-input-wrap ${isStreaming ? 'chat-input-wrap--streaming' : ''}`}>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese su consulta clínica..."
            rows={1}
            disabled={isStreaming || isLoadingHistory}
          />
          <button type="submit" className="chat-send" disabled={!input.trim() || isStreaming || isLoadingHistory}>
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
        <p className="chat-disclaimer">
          GynAssist proporciona asistencia clínica. Las respuestas no reemplazan el juicio médico.
        </p>
      </form>
    </div>
  );
}
