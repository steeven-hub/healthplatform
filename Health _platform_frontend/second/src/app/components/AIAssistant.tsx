import { useState } from "react";
import { Brain, Send, Sparkles, FileText, AlertCircle, CheckCircle } from "lucide-react";

export function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour Dr. Kouadio ! Je suis votre assistant IA médical. Comment puis-je vous aider aujourd'hui ?",
      time: "09:00"
    },
  ]);
  const [input, setInput] = useState("");

  const suggestions = [
    {
      icon: FileText,
      title: "Résumer le dossier",
      description: "Patient Koffi Adjoua (P-2401)",
      query: "Résume-moi le dossier médical complet de Koffi Adjoua"
    },
    {
      icon: AlertCircle,
      title: "Vérifier interactions",
      description: "Médicaments actuels",
      query: "Vérifie les interactions entre Amlodipine 10mg et Metformine 850mg"
    },
    {
      icon: Sparkles,
      title: "Suggérer diagnostic",
      description: "Basé sur les symptômes",
      query: "Patient avec hypertension et diabète, quels examens recommandez-vous ?"
    },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInput("");

    setTimeout(() => {
      const aiResponse = {
        role: "assistant" as const,
        content: generateResponse(input),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestion = (query: string) => {
    setInput(query);
  };

  const generateResponse = (query: string): string => {
    if (query.toLowerCase().includes("résume") || query.toLowerCase().includes("dossier")) {
      return "📋 **Résumé du dossier de Koffi Adjoua (P-2401)**\n\n**Informations patient:**\n- Âge: 45 ans, Masculin\n- Groupe sanguin: O+\n\n**Conditions chroniques:**\n- Hypertension artérielle (HTA)\n- Diabète Type 2\n\n**Allergies:** ⚠️ Pénicilline, Arachides\n\n**Traitement actuel:**\n- Amlodipine 10mg - 1x/jour\n- Ramipril 5mg - 1x/jour\n- Metformine 850mg - 2x/jour\n\n**Dernière consultation (01/05/2026):**\n- TA: 135/85 mmHg (amélioration)\n- HbA1c: 6.2% (contrôlée)\n- Poids: 82kg\n\n**Recommandations:** Suivi régulier tous les 3 mois, surveillance de la fonction rénale.";
    } else if (query.toLowerCase().includes("interaction")) {
      return "✅ **Vérification des interactions médicamenteuses**\n\n**Amlodipine 10mg + Metformine 850mg:**\n\n✅ Aucune interaction majeure détectée\n\n**Points d'attention:**\n- Surveillance de la pression artérielle recommandée\n- La Metformine peut nécessiter un ajustement en cas de variation de la fonction rénale\n- Conseiller au patient de maintenir une hydratation adéquate\n\n**Effets secondaires à surveiller:**\n- Amlodipine: Œdème des chevilles, céphalées\n- Metformine: Troubles digestifs, acidose lactique (rare)\n\n✅ Cette combinaison est sûre et couramment utilisée.";
    } else if (query.toLowerCase().includes("examen") || query.toLowerCase().includes("diagnostic")) {
      return "🔬 **Examens recommandés pour patient HTA + Diabète Type 2**\n\n**Examens de routine (tous les 3-6 mois):**\n- Glycémie à jeun\n- HbA1c\n- Créatinine et débit de filtration glomérulaire (DFG)\n- Bilan lipidique complet\n- Microalbuminurie\n\n**Examens annuels:**\n- Fond d'œil (rétinopathie diabétique)\n- ECG de repos\n- Examen podologique\n\n**Surveillance cardiovasculaire:**\n- Échographie cardiaque si symptômes\n- Test d'effort si facteurs de risque\n\n**Prochaines étapes:** Planifier un bilan complet dans les 2 semaines.";
    }
    return "Je suis là pour vous aider avec l'analyse de dossiers, la vérification d'interactions médicamenteuses, et les suggestions diagnostiques. Posez-moi une question spécifique sur un patient.";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Assistant IA Médical
        </h2>
        <p className="text-muted-foreground">Propulsé par Gemini AI</p>
      </div>

      {messages.length === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleSuggestion(suggestion.query)}
                className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 bg-card border border-border rounded-lg p-6 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.role === 'assistant' ? (
                  <Brain className="w-5 h-5" />
                ) : (
                  <span>Dr</span>
                )}
              </div>
              <div className={`flex-1 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`inline-block p-4 rounded-lg max-w-2xl ${
                  message.role === 'assistant'
                    ? 'bg-accent'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Posez une question médicale..."
          className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Envoyer
        </button>
      </div>

      <div className="mt-4 p-4 bg-secondary/10 border border-secondary/20 rounded-lg flex items-start gap-2">
        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-secondary">
          L'assistant IA analyse les dossiers médicaux et fournit des suggestions. Toujours vérifier les recommandations.
        </p>
      </div>
    </div>
  );
}
