'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function JoinPage() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [collaborationCode, setCollaborationCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
          console.error('Camera not supported in this environment');
          return;
        }
        
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error('Failed to access camera:', err);
        
        // Try with basic constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          streamRef.current = fallbackStream;
          setIsCameraOn(true);
        } catch (fallbackErr) {
          console.error('Fallback camera access failed:', fallbackErr);
          alert('Camera access denied or not available. Please check your browser permissions.');
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const handleJoinMeeting = () => {
    if (!collaborationCode.trim()) {
      alert('Please enter a collaboration code');
      return;
    }
    if (!selectedLanguage) {
      alert('Please select a language');
      return;
    }
    console.log('Joining meeting with:', {
      camera: isCameraOn,
      microphone: isMicOn,
      code: collaborationCode,
      language: selectedLanguage,
    });
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Video preview and controls */}
        <div className="space-y-6">
          <Card className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 ${
                  isCameraOn ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                playsInline
              />
              {!isCameraOn && (
                <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black">
                  <div className="text-center">
                    <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-white text-lg">Camera is off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <Button
                variant={isMicOn ? 'default' : 'destructive'}
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={toggleMic}
              >
                {isMicOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant={isCameraOn ? 'default' : 'secondary'}
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={toggleCamera}
              >
                {isCameraOn ? (
                  <Camera className="w-5 h-5" />
                ) : (
                  <CameraOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 border-white/20 hover:bg-white/20"
              >
                <Settings className="w-5 h-5 text-white" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right side - Join options */}
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meeting ready
            </h1>
            <p className="text-gray-600">
              Don&apos;t forget to be respectful to others!
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="collaboration-code"
                className="text-sm font-medium text-gray-700"
              >
                Collaboration Code
              </label>
              <Input
                id="collaboration-code"
                type="text"
                placeholder="Enter collaboration code"
                value={collaborationCode}
                onChange={(e) => setCollaborationCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="language-select"
                className="text-sm font-medium text-gray-700"
              >
                Select Language
              </label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="javanese">Javanese</SelectItem>
                  <SelectItem value="sundanese">Sundanese</SelectItem>
                  <SelectItem value="balinese">Balinese</SelectItem>
                  <SelectItem value="minangkabau">Minangkabau</SelectItem>
                  <SelectItem value="betawi">Betawi</SelectItem>
                  <SelectItem value="madurese">Madurese</SelectItem>
                  <SelectItem value="banjarese">Banjarese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Link href={`/meet?room=${encodeURIComponent(collaborationCode)}&lang=${selectedLanguage}`}>
                <Button
                  onClick={handleJoinMeeting}
                  className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={!collaborationCode.trim() || !selectedLanguage}
                >
                  Join now
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                size="lg"
              >
                Present
              </Button>
            </div>
          </Card>

          <div className="text-center text-sm text-gray-500">
            <p>By joining, you agree to our terms of service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
