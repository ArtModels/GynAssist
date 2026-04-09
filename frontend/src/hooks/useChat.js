import { useState, useRef, useCallback } from 'react';
import { createAgentStream, getConversationById } from '../services/clients';

export const useChat = (client) => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isToolActive, setIsToolActive] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const eventSourceRef = useRef(null);

  // ── Load a past conversation into the chat view ──────────────
  const loadConversation = useCallback(async (convId) => {
    if (!client) return;
    if (eventSourceRef.current) eventSourceRef.current.close();
    setIsLoadingHistory(true);
    setMessages([]);
    try {
      const conv = await getConversationById(client.client_id, convId);
      const loaded = (conv.messages || []).map((m, i) => ({
        role: m.role,
        content: m.content,
        id: `hist-${convId}-${i}`,
      }));
      setMessages(loaded);
      setConversationId(convId);
    } catch (e) {
      console.error('Error loading conversation:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [client]);

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }]);
  }, []);

  // ── Send a new message (SSE streaming) ───────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!client || !text.trim() || isStreaming) return;

    addMessage('human', text);
    setIsStreaming(true);
    setIsToolActive(false);

    const aiMsgId = Date.now() + Math.random();
    setMessages(prev => [...prev, { role: 'ai', content: '', id: aiMsgId, streaming: true }]);

    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = await createAgentStream(client.client_id, text, conversationId);
    eventSourceRef.current = es;

    es.addEventListener('token', (e) => {
      const { content } = JSON.parse(e.data);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, content: m.content + content } : m
      ));
    });

    es.addEventListener('tool_call', () => setIsToolActive(true));

    es.addEventListener('done', (e) => {
      const { conversation_id } = JSON.parse(e.data);
      setConversationId(conversation_id);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, streaming: false } : m
      ));
      setIsStreaming(false);
      setIsToolActive(false);
      es.close();
    });

    es.onerror = () => {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: m.content || 'Error de conexión con el agente clínico.', streaming: false, error: true }
          : m
      ));
      setIsStreaming(false);
      setIsToolActive(false);
      es.close();
    };
  }, [client, isStreaming, conversationId, addMessage]);

  const clearChat = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setMessages([]);
    setConversationId(null);
    setIsStreaming(false);
    setIsToolActive(false);
  }, []);

  return {
    messages,
    isStreaming,
    isToolActive,
    isLoadingHistory,
    conversationId,
    sendMessage,
    loadConversation,
    clearChat,
  };
};
