import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Visualizer } from './Visualizer';
import { MicrophoneIcon, StopIcon, PlayIcon, PauseIcon, DownloadIcon, TrashIcon } from './Icons';

export const Recorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // For playback
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [mediaStream]);

  // Timer Logic
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
        if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null); // Clear previous recording
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

  const downloadRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `recording-${new Date().toISOString().slice(0,19)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Timer Display */}
      <div className="font-mono text-4xl font-bold text-purple-900 mb-8 tracking-wider">
        {formatTime(recordingTime)}
      </div>

      {/* Visualizer Area */}
      <Visualizer stream={mediaStream} isRecording={isRecording} />

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioPlayerRef} 
          src={audioUrl} 
          onEnded={handleAudioEnded} 
        />
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-6 mt-2">
        {!audioUrl ? (
          // Recording Mode Controls
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 shadow-lg shadow-purple-300 transition-all hover:scale-105 hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200"
                aria-label="Start Recording"
              >
                <MicrophoneIcon className="h-8 w-8 text-white group-hover:animate-pulse" />
                <span className="absolute -bottom-8 text-xs font-medium text-purple-500 opacity-0 transition-opacity group-hover:opacity-100">
                  Start
                </span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-red-500 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
                aria-label="Stop Recording"
              >
                 <div className="h-8 w-8 rounded bg-red-500 animate-pulse" />
                 <span className="absolute -bottom-8 text-xs font-medium text-red-500 opacity-0 transition-opacity group-hover:opacity-100">
                  Stop
                </span>
              </button>
            )}
          </>
        ) : (
          // Playback Mode Controls
          <div className="flex w-full flex-col gap-6">
             <div className="flex items-center justify-center gap-6">
                <button
                  onClick={deleteRecording}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={togglePlayback}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 hover:scale-105"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-8 w-8" />
                  ) : (
                    <PlayIcon className="h-8 w-8 ml-1" />
                  )}
                </button>

                <button
                  onClick={downloadRecording}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-green-100 hover:text-green-600"
                  title="Download"
                >
                  <DownloadIcon className="h-5 w-5" />
                </button>
             </div>
             <div className="text-center text-sm font-medium text-purple-600">
                Recording Finished
             </div>
          </div>
        )}
      </div>
    </div>
  );
};