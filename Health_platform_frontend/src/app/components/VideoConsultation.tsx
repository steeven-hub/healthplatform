import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import api from '../api';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function VideoConsultation() {
  const { consultationId } = useParams<{ consultationId: string }>(); // Type assertion for useParams
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        const token = localStorage.getItem('token');
        console.log("DEBUG: Token récupéré pour fetchRoom:", token);
        if (!token) {
          setError("Vous n'êtes pas authentifié. Veuillez vous connecter.");
          setIsLoading(false);
          return;
        }
        const response = await api.get(`consultations/${consultationId}/get_video_room/`);
        setRoomId(response.data.video_room_id);
      } catch (error: any) {
        console.error("Erreur lors de la récupération de la salle vidéo:", error);
        if (error.response && error.response.status === 401) {
          setError("Authentification échouée. Veuillez vous reconnecter.");
        } else if (error.response && error.response.status === 403) {
          setError("Accès refusé à cette salle vidéo.");
        } else {
          setError("Impossible de charger la salle vidéo. Veuillez réessayer.");
        }
        setIsLoading(false);
      } finally {
        if (!error) { // Only set loading to false if no error occurred during fetch
            setIsLoading(false);
        }
      }
    };
    if (consultationId) { // Only fetch if consultationId is available
        fetchRoom();
    } else {
        setError("ID de consultation manquant.");
        setIsLoading(false);
    }
  }, [consultationId]);

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
    
    try {
        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        return () => apiInstance.dispose();
    } catch (e) {
        console.error("Erreur initialisation Jitsi:", e);
        setError("Impossible d'initialiser la visioconférence.");
    }
  }, [roomId]);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  if (error) return <div className="flex justify-center p-20 text-red-500">{error}</div>;
  if (!roomId) return <div className="flex justify-center p-20">Aucune salle vidéo disponible pour cette consultation.</div>;


  return <div id="jitsi-container" className="w-full rounded-2xl overflow-hidden shadow-lg border border-border" />;
}
