import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import api from "../api";

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const email = location.state?.email || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("verify-code/", { email, code });
      alert("Compte activé avec succès !");
      navigate("/login");
    } catch (err: any) {
      setError("Code invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Vérification Email</h2>
        <p className="text-muted-foreground mb-6">
          Un code de 7 chiffres a été envoyé à <strong>{email}</strong>.
        </p>
        
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code de vérification"
            className="w-full px-4 py-3 bg-input border rounded-lg focus:ring-2 focus:ring-primary"
            maxLength={7}
            required
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Vérifier"}
          </button>
        </form>
      </div>
    </div>
  );
}
