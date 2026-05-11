import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router'; // Import useNavigate
import api from '../api';
import { Loader2, AlertTriangle } from 'lucide-react'; // Import AlertTriangle

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function VideoConsultation() {
  const { consultationId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error messages

  useEffect(() => {
    const fetchRoomAndValidateConsultation = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        // 1. Fetch available consultations to validate the ID
        const consultationsResponse = await api.get("consultations/");
        console.log("DEBUG: Full Consultations response structure:", JSON.stringify(consultationsResponse.data, null, 2));
        
        // Handle cases: direct array, or paginated object
        let consultations = [];
        if (Array.isArray(consultationsResponse.data)) {
            consultations = consultationsResponse.data;
        } else if (consultationsResponse.data && typeof consultationsResponse.data === 'object') {
            // Check common pagination keys
            consultations = consultationsResponse.data.results || consultationsResponse.data.data || [];
        }
            
        const isValidConsultation = consultations.some((c: any) => c.id === parseInt(consultationId || ''));

        if (!isValidConsultation) {
          throw new Error("Consultation ID invalide ou non trouvé.");
        }

        // 2. Fetch room ID if consultation is valid
        const response = await api.get(`consultations/${consultationId}/get_video_room/`);
        setRoomId(response.data.video_room_id);
      } catch (err: any) {
        console.error("Erreur room ID:", err);
        setError(err.message || "Impossible de charger la salle de visioconférence.");
        // Optionally redirect if the ID is truly invalid or not found
        // navigate('/app/dashboard'); // Example redirect
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomAndValidateConsultation();
  }, [consultationId, navigate]); // Add navigate to dependency array

  useEffect(() => {
    if (!roomId) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: `afrihealth-${roomId}`,
      width: '100%',
      height: 600,
      parentNode: document.getElementById('jitsi-container'),
      configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: false },
      interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false }
    };
    
    const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
    return () => apiInstance.dispose();
  }, [roomId]);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 text-destructive">
      <AlertTriangle className="w-12 h-12 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Erreur</h2>
      <p className="text-lg">{error}</p>
      <p className="text-muted-foreground mt-2">Veuillez vérifier que l'ID de consultation est correct ou essayer de revenir à la liste.</p>
      <button onClick={() => navigate('/app/dashboard')} className="mt-6 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all">
        Retour au Tableau de Bord
      </button>
    </div>
  );

  return <div id="jitsi-container" className="w-full rounded-2xl overflow-hidden shadow-lg border border-border" />;
}
