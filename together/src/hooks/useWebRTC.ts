import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RemotePeer {
  id: string;
  stream: MediaStream | null;
  name: string;
}

export const useWebRTC = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('room-users', (users: string[]) => {
      console.log('Room users:', users);
      users.forEach(userId => {
        if (userId !== newSocket.id) {
          createPeerConnection(userId, true, newSocket);
        }
      });
    });

    newSocket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      if (userId !== newSocket.id) {
        createPeerConnection(userId, false, newSocket);
      }
    });

    newSocket.on('user-left', (userId: string) => {
      const pc = peerConnections.current.get(userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(userId);
      }
      setRemotePeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(userId);
        return newPeers;
      });
    });

    newSocket.on('offer', async ({ offer, sender }) => {
      console.log('Received offer from:', sender);
      let pc = peerConnections.current.get(sender);
      if (!pc) {
        pc = createPeerConnection(sender, false, newSocket);
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit('answer', { answer, target: sender });
        console.log('Sent answer to:', sender);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    newSocket.on('answer', async ({ answer, sender }) => {
      console.log('Received answer from:', sender);
      const pc = peerConnections.current.get(sender);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    });

    newSocket.on('ice-candidate', async ({ candidate, sender }) => {
      const pc = peerConnections.current.get(sender);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    return () => {
      newSocket.disconnect();
      peerConnections.current.forEach(pc => pc.close());
    };
  }, [roomId]);

  const createPeerConnection = (userId: string, shouldCreateOffer: boolean, socketInstance: Socket) => {
    console.log(`Creating peer connection with ${userId}`);
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current.set(userId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit('ice-candidate', {
          candidate: event.candidate,
          target: userId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      const [remoteStream] = event.streams;
      setRemotePeers(prev => {
        const newPeers = new Map(prev);
        newPeers.set(userId, {
          id: userId,
          stream: remoteStream,
          name: `User ${userId.slice(0, 8)}`
        });
        return newPeers;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, pc.connectionState);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    if (shouldCreateOffer) {
      setTimeout(() => createOffer(pc, userId, socketInstance), 1000);
    }
    
    return pc;
  };

  const createOffer = async (pc: RTCPeerConnection, userId: string, socketInstance: Socket) => {
    try {
      console.log('Creating offer for:', userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketInstance.emit('offer', { offer, target: userId });
      console.log('Sent offer to:', userId);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const startLocalVideo = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        console.error('getUserMedia not supported');
        return null;
      }
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to existing peer connections
      peerConnections.current.forEach(pc => {
        stream.getTracks().forEach(track => {
          const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Try with lower constraints if initial request fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(fallbackStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
        }
        return fallbackStream;
      } catch (fallbackError) {
        console.error('Fallback getUserMedia also failed:', fallbackError);
        return null;
      }
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  return {
    localStream,
    remotePeers,
    isConnected,
    localVideoRef,
    startLocalVideo,
    stopLocalVideo,
    toggleAudio,
    toggleVideo
  };
};