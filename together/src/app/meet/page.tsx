'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MoreVertical,
  MessageSquare,
  Users,
  Monitor,
  Languages,
  Smile,
} from 'lucide-react';
import JavaneseSpeechToText from '@/components/JavaneseSpeechToText';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function VideoMeeting() {
  const [isCallActive, setIsCallActive] = useState(true);
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [activeReactions, setActiveReactions] = useState<Array<{id: string, emoji: string, x: number, y: number}>>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Get room ID from URL params or use default
  const roomId = "HELLO";
  const {
    localStream,
    remotePeers,
    isConnected,
    localVideoRef,
    startLocalVideo,
    stopLocalVideo,
    toggleAudio,
    toggleVideo
  } = useWebRTC(roomId);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];

  const sendReaction = (emoji: string) => {
    const id = Date.now().toString();
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;
    
    setActiveReactions(prev => [...prev, { id, emoji, x, y }]);
    
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
    
    setShowReactions(false);
  };

  useEffect(() => {
    startLocalVideo();
    return () => stopLocalVideo();
  }, []);

  const handleToggleMic = () => {
    const enabled = toggleAudio();
    setIsMicOn(enabled);
  };

  const handleToggleCamera = () => {
    const enabled = toggleVideo();
    setIsCameraOn(enabled);
  };

  const endCall = () => {
    setIsCallActive(false);
    stopLocalVideo();
  };

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <PhoneOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold mb-2">Call Ended</h2>
          <p className="text-gray-400">Thanks for joining the meeting</p>

          <Button
            onClick={() => setIsCallActive(true)}
            className="cursor-pointer mr-8 mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Rejoin Meeting
          </Button>

          <Link href={`/join`}>
            <Button variant="destructive" className="cursor-pointer">
              Leave the call
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm">11:11 AM | Unity & Diversity Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-800 text-white">
            <Users className="w-3 h-3 mr-1" />{remotePeers.size + 1}
          </Badge>
          {!isConnected && (
            <Badge variant="destructive">Connecting...</Badge>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-4 gap-4 relative">
        {/* Remote Participants */}
        {Array.from(remotePeers.values()).map((peer) => (
          <div key={peer.id} className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500 flex-1 max-w-md aspect-video">
            {peer.stream ? (
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={(video) => {
                  if (video && peer.stream) {
                    video.srcObject = peer.stream;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-blue-500">
                    {peer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-4 left-4 text-white font-medium">
              {peer.name}
            </div>
          </div>
        ))}

        {/* Show placeholder if no remote peers */}
        {remotePeers.size === 0 && (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-500 flex-1 max-w-md aspect-video">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
              <div className="text-center text-white">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Waiting for others to join...</p>
                <p className="text-xs opacity-50 mt-2">Room: {roomId}</p>
                {!isConnected && (
                  <p className="text-xs text-yellow-400 mt-1">Connecting to server...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Local Participant (You) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-green-500 flex-1 max-w-md aspect-video">
          {isCameraOn && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-green-500">
                  YU
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          {/* Floating Reactions on Your Video */}
          {activeReactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute text-4xl pointer-events-none z-10 animate-bounce"
              style={{
                left: `${reaction.x}%`,
                top: `${reaction.y}%`,
                transform: 'translateY(-20px)',
                opacity: 0.9
              }}
            >
              {reaction.emoji}
            </div>
          ))}
          <div className="absolute bottom-4 left-4 text-white font-medium">
            You
          </div>
          <div className="absolute top-4 right-4">
            <div className="bg-gray-900/80 rounded-full p-1">
              {isMicOn ? (
                <Mic className="w-4 h-4 text-green-500" />
              ) : (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Panel */}
      {showTranscription && (
        <div className="mx-4 mb-4">
          <JavaneseSpeechToText
            onTranscriptionComplete={(text) => setTranscription(text)}
            apiUrl="http://192.168.0.137:5000/transcribe"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center p-6 gap-4">
        {/* Microphone Toggle */}
        <Button
          onClick={handleToggleMic}
          size="lg"
          className={`rounded-full w-14 h-14 ${
            isMicOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isMicOn ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </Button>

        {/* Camera Toggle */}
        <Button
          onClick={handleToggleCamera}
          size="lg"
          className={`rounded-full w-14 h-14 ${
            isCameraOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isCameraOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        {/* Screen Share */}
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Monitor className="w-6 h-6" />
        </Button>

        {/* Chat */}
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        {/* Reactions */}
        <div className="relative">
          <Button
            onClick={() => setShowReactions(!showReactions)}
            size="lg"
            className={`rounded-full w-14 h-14 ${
              showReactions
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
          >
            <Smile className="w-6 h-6" />
          </Button>
          {showReactions && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-600 z-50 min-w-max">
              <div className="grid grid-cols-4 gap-4">
                {reactions.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => sendReaction(emoji)}
                    className="w-12 h-12 text-xl hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center border border-transparent hover:border-gray-500"
                  >
                    <span className="select-none">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Javanese Speech-to-Text */}
        <Button
          onClick={() => setShowTranscription(!showTranscription)}
          size="lg"
          className={`rounded-full w-14 h-14 ${
            showTranscription
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          <Languages className="w-6 h-6" />
        </Button>

        {/* More Options */}
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <MoreVertical className="w-6 h-6" />
        </Button>

        {/* End Call */}
        <Button
          onClick={endCall}
          size="lg"
          className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white ml-4"
        >
          <Phone className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}