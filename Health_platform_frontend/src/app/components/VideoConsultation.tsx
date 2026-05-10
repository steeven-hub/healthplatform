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
  const { consultationId } = useParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("DEBUG: Token récupéré:", token); // Log pour vérifier le token
        console.log("DEBUG: Token envoyé:", token);
        const response = await api.get(`consultations/${consultationId}/get_video_room/`);
        setRoomId(response.data.video_room_id);
      } catch (error) {
        console.error("Erreur room ID:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
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
    
    const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
    return () => apiInstance.dispose();
  }, [roomId]);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return <div id="jitsi-container" className="w-full rounded-2xl overflow-hidden shadow-lg border border-border" />;
}
