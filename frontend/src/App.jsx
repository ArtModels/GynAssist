import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getClients } from './services/clients';
import PatientSelector from './components/PatientSelector';
import ClinicalSidebar from './components/ClinicalSidebar';
import ChatWindow from './components/ChatWindow';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';
import { useTheme } from './hooks/useTheme';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      getClients()
        .then(setClients)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSelect = (client) => {
    const idx = clients.findIndex(c => c.client_id === client.client_id);
    setSelectedIndex(idx);
    setSelectedClient(client);
    setActiveConversationId(null);
  };

  const handleBack = () => {
    setSelectedClient(null);
    setActiveConversationId(null);
  };

  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };

  if (authLoading) {
    return <div className="app-bg" />;
  }

  if (!user) {
    return (
      <>
        <div className="app-bg" />
        <Login />
      </>
    );
  }

  return (
    <>
      <div className="app-bg" />
      <ThemeToggle theme={theme} onToggle={toggle} />
      <div className="app-shell">
        {!selectedClient ? (
          <PatientSelector
            user={user}
            clients={clients}
            loading={loading}
            onSelect={handleSelect}
            onClientsChange={setClients}
          />
        ) : (
          <div className="app-workspace">
            <ClinicalSidebar
              client={selectedClient}
              clientIndex={selectedIndex}
              onBack={handleBack}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
            <ChatWindow
              client={selectedClient}
              initialConversationId={activeConversationId}
            />
          </div>
        )}
      </div>
    </>
  );
}
