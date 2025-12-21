import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const VideoCall = ({ roomId, userName, onClose }: VideoCallProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [jitsiApi, setJitsiApi] = useState<any>(null);

  useEffect(() => {
    // Check if script already loaded
    if (window.JitsiMeetExternalAPI) {
      initializeJitsi();
      return;
    }

    // Load Jitsi Meet API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeJitsi();
    };

    script.onerror = () => {
      console.error('Failed to load Jitsi Meet');
      setIsLoading(false);
    };

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
      // Don't remove script as it might be used by other components
    };
  }, []);

  const initializeJitsi = () => {
    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `TIETMedicare_${roomId}`,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        userInfo: {
          displayName: userName
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'tileview'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceJoined', () => {
        setIsLoading(false);
        console.log('Video conference joined');
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('Video conference left');
        onClose();
      });

      api.addEventListener('readyToClose', () => {
        onClose();
      });

      setJitsiApi(api);
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-white font-semibold text-lg">Video Consultation</h2>
            <p className="text-white/70 text-sm">with {userName}</p>
          </div>
          <Button
            onClick={handleEndCall}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Connecting to video call...</p>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div id="jitsi-container" className="flex-1 w-full h-full" />
    </motion.div>
  );
};

export default VideoCall;
