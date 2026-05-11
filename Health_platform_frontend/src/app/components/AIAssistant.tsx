import { useEffect, useState, useRef } from "react";
import { Brain, Send, Plus, MessageSquare, Trash2, History, X, Search as SearchIcon } from "lucide-react";
import { useParams } from "react-router";
import api from "../api";

export function AIAssistant() {
  const { patientId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    try {
      const params: any = {};
      if (patientId) params.patient_id = patientId;
      if (sessionSearch) params.search = sessionSearch;

      const response = await api.get("chat-sessions/", { params });
      setSessions(response.data);
      
      if (!currentSessionId && response.data.length > 0) {
        setCurrentSessionId(response.data[0].id);
      }
    } catch (error) {
      console.error("Erreur chargement sessions:", error);
    }
  };

  const fetchMessages = async (sessionId: number | null) => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (sessionId) params.session_id = sessionId;
      if (patientId) params.patient_id = patientId;

      const response = await api.get("ai-assistant/", { params });
      setMessages(response.data.history || []);
      if (response.data.session_id) {
        setCurrentSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error("Erreur historique messages:", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [patientId, sessionSearch]);

  useEffect(() => {
    if (currentSessionId || isInitialLoading) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewChat = async () => {
    try {
      setIsLoading(true);
      const data = patientId ? { patient_id: patientId } : {};
      const response = await api.post("chat-sessions/", data);
      setSessions(prev => [response.data, ...prev]);
      setCurrentSessionId(response.data.id);
      setShowHistory(false);
    } catch (error) {
      console.error("Erreur création chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette conversation ?")) return;
    try {
      await api.delete(`chat-sessions/${id}/delete/`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Erreur suppression session:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const payload: any = { message: currentInput };
      if (currentSessionId) payload.session_id = currentSessionId;
      if (patientId) payload.patient_id = patientId;

      const response = await api.post("ai-assistant/", payload);
      
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: response.data.reply,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);

      if (response.data.session_title) {
        setSessions(prev => prev.map(s => 
          s.id === response.data.session_id ? { ...s, title: response.data.session_title } : s
        ));
      }
    } catch (error) {
      console.error("Erreur IA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border flex flex-col bg-card/50 rounded-lg overflow-hidden`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <History className="w-5 h-5 text-primary" />
            Historique
          </h3>
          <button onClick={() => setShowHistory(false)} className="lg:hidden">
             <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Rechercher un chat..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-accent/20 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
            />
          </div>
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Array.isArray(sessions) && sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => setCurrentSessionId(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                currentSessionId === session.id 
                ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                : 'border-transparent hover:bg-accent text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate font-medium">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!Array.isArray(sessions) || sessions.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune conversation.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!showHistory && (
              <button 
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
                title="Afficher l'historique"
              >
                <History className="w-5 h-5 text-primary" />
              </button>
            )}
            <h2 className="flex items-center gap-3 font-bold text-xl">
              <Brain className="w-8 h-8 text-primary" />
              Assistant IA Médical
            </h2>
          </div>
          {currentSessionId && (
             <span className="text-xs px-3 py-1 bg-accent rounded-full text-muted-foreground font-medium">
               ID Session: #{currentSessionId}
             </span>
          )}
        </div>

        <div className="flex-1 bg-card border border-border rounded-2xl p-6 mb-6 overflow-y-auto shadow-sm">
          <div className="space-y-6">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    message.role === 'assistant' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.role === 'assistant' ? <Brain className="w-5 h-5" /> : <span className="text-xs font-bold">MOI</span>}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.role === 'assistant' 
                      ? 'bg-accent/50 border border-border' 
                      : 'bg-primary text-primary-foreground shadow-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-2">{message.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                 </div>
                 <h3 className="font-bold text-lg mb-2">Comment puis-je vous aider ?</h3>
                 <p className="text-sm text-muted-foreground max-w-sm">
                   Posez-moi vos questions sur les symptômes, les dossiers médicaux ou la plateforme AfriHealth.
                 </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex gap-4 items-end bg-card/50 p-2 rounded-2xl border border-border">
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Posez votre question ici..."
              className="w-full px-5 py-4 bg-input-background border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none min-h-[56px] pr-12"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-14 px-8 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{isLoading ? "Wilson analyse..." : "Envoyer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
