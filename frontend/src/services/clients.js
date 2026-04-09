import api from './api';
import { auth } from '../firebase';

export const getClients = async () => {
  const { data } = await api.get('/clients/');
  return data;
};

export const getClient = async (clientId) => {
  const { data } = await api.get(`/clients/${clientId}`);
  return data;
};

export const createClient = async (formData) => {
  const { data } = await api.post('/clients/', formData);
  return data;
};

export const deleteClient = async (clientId) => {
  await api.delete(`/clients/${clientId}`);
};

export const getConversations = async (clientId) => {
  const { data } = await api.get(`/clients/${clientId}/conversations`);
  return data;
};

export const getConversationById = async (clientId, conversationId) => {
  const { data } = await api.get(`/clients/${clientId}/conversations/${conversationId}`);
  return data;
};

export const createAgentStream = async (clientId, message, conversationId = null) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';
  
  const params = new URLSearchParams({
    client_id: clientId,
    message: message,
    token: token,
    ...(conversationId && { conversation_id: conversationId }),
  });
  return new EventSource(`/api/agent/stream?${params.toString()}`);
};
