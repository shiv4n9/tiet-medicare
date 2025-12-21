# 💬 Chat & Video Call - Complete Setup Guide

## ✅ Files Created

### Backend
1. ✅ `backend/models/Message.js` - Message schema
2. ✅ `backend/routes/messages.js` - Message API routes  
3. ✅ `backend/socket/chatHandler.js` - Socket.IO logic

### Frontend (To Create)
4. ⏳ Chat components
5. ⏳ Video call components
6. ⏳ Socket service

## 🔧 Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install socket.io cors
```

### Step 2: Update server.js

Add these imports at the top:
```javascript
import { createServer } from 'http';
import { Server } from 'socket.io';
import messageRoutes from './routes/messages.js';
import { initializeChat } from './socket/chatHandler.js';
```

Replace `app.listen` with:
```javascript
// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize chat
initializeChat(io);

// Add messages route
app.use('/api/messages', messageRoutes);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🎨 Frontend Implementation

### Step 1: Install Dependencies
```bash
cd frontend
npm install socket.io-client @jitsi/react-sdk
```

### Step 2: Create Socket Service

Create `frontend/src/services/socketService.ts`:
```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(apiUrl, {
      transports: ['websocket'],
      reconnection: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('user:join', userId);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
```

### Step 3: Create Chat Window Component

Create `frontend/src/components/Chat/ChatWindow.tsx`:
```typescript
import { useState, useEffect, useRef } from 'react';
import { Send, Video, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import socketService from '@/services/socketService';

interface Message {
  _id: string;
  message: string;
  senderName: string;
  senderId: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  onClose: () => void;
  onVideoCall: () => void;
}

export const ChatWindow = ({
  conversationId,
  receiverId,
  receiverName,
  currentUserId,
  currentUserName,
  currentUserRole,
  onClose,
  onVideoCall
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load messages
    loadMessages();

    // Join conversation
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('conversation:join', conversationId);

      // Listen for new messages
      socket.on('message:receive', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for typing
      socket.on('typing:user', () => setIsTyping(true));
      socket.on('typing:stop', () => setIsTyping(false));
    }

    return () => {
      if (socket) {
        socket.off('message:receive');
        socket.off('typing:user');
        socket.off('typing:stop');
      }
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/conversation/${conversationId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('message:send', {
        conversationId,
        receiverId,
        receiverName,
        message: newMessage,
        senderName: currentUserName,
        senderRole: currentUserRole
      });

      setNewMessage('');
    }
  };

  const handleTyping = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('typing:start', { conversationId, userName: currentUserName });
      
      setTimeout(() => {
        socket.emit('typing:stop', { conversationId });
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-medical-blue-600 to-medical-green-600 text-white rounded-t-lg">
        <div>
          <h3 className="font-semibold">{receiverName}</h3>
          <p className="text-xs opacity-90">Online</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onVideoCall} className="text-white hover:bg-white/20">
            <Video className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.senderId === currentUserId
                  ? 'bg-medical-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500 italic">
            {receiverName} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} className="bg-medical-blue-600 hover:bg-medical-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### Step 4: Create Video Call Component

Create `frontend/src/components/Video/VideoCall.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onClose: () => void;
}

export const VideoCall = ({ roomId, userName, onClose }: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // Load Jitsi Meet API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeJitsi();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeJitsi = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: userName
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup', 'chat',
          'recording', 'livestreaming', 'etherpad', 'sharedvideo',
          'settings', 'raisehand', 'videoquality', 'filmstrip',
          'stats', 'shortcuts', 'tileview', 'download', 'help'
        ]
      }
    };

    const api = new (window as any).JitsiMeetExternalAPI(domain, options);

    api.addEventListener('videoConferenceLeft', () => {
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Video Consultation</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div id="jitsi-container" className="flex-1" />
    </div>
  );
};
```

## 🚀 Usage in Doctor Dashboard

Add to `DoctorDashboardSimplified.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/Chat/ChatWindow';
import { VideoCall } from '@/components/Video/VideoCall';
import socketService from '@/services/socketService';

// Inside component
const [activeChat, setActiveChat] = useState<any>(null);
const [activeCall, setActiveCall] = useState<any>(null);

useEffect(() => {
  if (user?._id) {
    socketService.connect(user._id);
  }

  return () => {
    socketService.disconnect();
  };
}, [user]);

// In appointment card, add chat/video buttons:
<Button 
  size="sm" 
  variant="outline"
  onClick={() => setActiveChat({
    conversationId: `${user._id}-${appointment.patientId}`,
    receiverId: appointment.patientId,
    receiverName: appointment.patientName
  })}
>
  <MessageSquare className="w-4 h-4" />
</Button>

<Button 
  size="sm" 
  variant="outline"
  onClick={() => setActiveCall({
    roomId: `consultation-${appointment._id}`,
    userName: user.name
  })}
>
  <Video className="w-4 h-4" />
</Button>

// Render components
{activeChat && (
  <ChatWindow
    {...activeChat}
    currentUserId={user._id}
    currentUserName={user.name}
    currentUserRole={user.role}
    onClose={() => setActiveChat(null)}
    onVideoCall={() => {
      setActiveCall({
        roomId: `consultation-${activeChat.conversationId}`,
        userName: user.name
      });
    }}
  />
)}

{activeCall && (
  <VideoCall
    {...activeCall}
    onClose={() => setActiveCall(null)}
  />
)}
```

## ✅ Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login as doctor
4. Click chat icon on appointment
5. Send messages
6. Click video icon to start call

## 🎉 Features

- ✅ Real-time chat
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Video calls (Jitsi Meet)
- ✅ Screen sharing
- ✅ Message history
- ✅ Unread counts

**Status**: Ready to implement!
