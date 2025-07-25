'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Languages, Copy, Volume2 } from 'lucide-react';

interface JavaneseSpeechToTextProps {
  onTranscriptionComplete?: (text: string) => void;
  apiUrl?: string;
}

export default function JavaneseSpeechToText({
  onTranscriptionComplete,
  apiUrl = 'http://192.168.0.137:5000/transcribe',
}: JavaneseSpeechToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleAudioData;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const translateToEnglish = async (text: string) => {
    try {
      setIsTranslating(true);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from: 'javanese',
          to: 'english'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTranslation(data.translation);
      } else {
        setError('Translation failed');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation service unavailable');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAudioData = async () => {
    try {
      setIsProcessing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Send to API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_base64: base64Audio,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setTranscription(data.transcription);
          if (onTranscriptionComplete) {
            onTranscriptionComplete(data.transcription);
          }
          // Auto-translate after transcription
          await translateToEnglish(data.transcription);
        } else {
          setError(data.error || 'Failed to transcribe audio');
        }
        setIsProcessing(false);
      };
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Error processing audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Languages className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Javanese Speech Recognition</h2>
          <p className="text-sm text-gray-400">Speak in Javanese, get instant English translation</p>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isTranslating}
          className={`rounded-full w-16 h-16 p-0 transition-all duration-300 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        <div className="text-center">
          <p className="text-white font-medium">
            {isRecording
              ? 'Recording...'
              : isProcessing
              ? 'Processing audio...'
              : isTranslating
              ? 'Translating...'
              : 'Tap to record'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isRecording ? 'Tap again to stop' : 'Hold and speak in Javanese'}
          </p>
        </div>
      </div>

      {/* Loading Indicator */}
      {(isProcessing || isTranslating) && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-300">
            {isProcessing ? 'Transcribing speech...' : 'Translating to English...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-300 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {transcription && (
        <div className="space-y-4">
          {/* Javanese Transcription */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Javanese
              </h3>
              <Button
                onClick={() => copyToClipboard(transcription)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-white leading-relaxed">{transcription}</p>
          </div>

          {/* English Translation */}
          {translation && (
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-300 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  English Translation
                </h3>
                <Button
                  onClick={() => copyToClipboard(translation)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-green-100 leading-relaxed">{translation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
