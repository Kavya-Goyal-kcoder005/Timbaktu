import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, UploadCloud, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { MediaMetadata, formatAudioDuration } from '@timbaktu/shared';
import { Button } from '../shared/Button';
import { TimbaktuBird } from '../mascot/TimbaktuBird';

interface AudioRecorderProps {
  existingAudio?: MediaMetadata | null;
  onAudioUploaded: (audio: MediaMetadata) => void;
  onAudioRemoved: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  existingAudio,
  onAudioUploaded,
  onAudioRemoved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio?.url || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationSecondsRef = useRef<number>(0);

  // Sync with existing audio if provided
  useEffect(() => {
    if (existingAudio?.url) {
      setAudioUrl(existingAudio.url);
    }
  }, [existingAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setAudioBlob(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mime = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);

        // Stop all media tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        // Automatically upload narration to server
        setIsUploading(true);
        setErrorMessage(null);
        try {
          const finalDuration = durationSecondsRef.current || recordingDuration;
          const formData = new FormData();
          formData.append('file', blob, 'narration.webm');
          formData.append('durationSeconds', String(finalDuration));

          const res = await fetch('/api/v1/media/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error?.message || 'Failed to upload audio recording.');
          }

          onAudioUploaded(json.data);
          setAudioBlob(null); // Upload completed successfully
        } catch (uploadErr: unknown) {
          setErrorMessage((uploadErr as Error).message || 'Failed to upload narration.');
        } finally {
          setIsUploading(false);
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingDuration(0);
      durationSecondsRef.current = 0;

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1;
          durationSecondsRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions to record your narration.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No microphone device was found on your computer or device.');
      } else {
        setErrorMessage(error.message || 'Unable to start recording.');
      }
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.ontimeupdate = () => {
        if (previewAudioRef.current && previewAudioRef.current.duration) {
          setPreviewProgress(
            (previewAudioRef.current.currentTime / previewAudioRef.current.duration) * 100
          );
        }
      };
      previewAudioRef.current.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const discardRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlayingPreview(false);
    setRecordingDuration(0);
    setPreviewProgress(0);
    onAudioRemoved();
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'narration.webm');
      formData.append('durationSeconds', String(recordingDuration));

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to upload audio recording.');
      }

      onAudioUploaded(json.data);
      setAudioBlob(null); // Mark as uploaded
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-parchment-50 border border-sage-300 rounded-2xl p-5 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <TimbaktuBird
            size="sm"
            state={isRecording ? 'recording' : isPlayingPreview ? 'listening' : 'idle'}
            className="w-8 h-8"
          />
          <div>
            <h4 className="font-serif font-bold text-bark-900 text-base">Voice Narration</h4>
            <p className="text-xs text-bark-500">Add your voice to this story so readers can listen.</p>
          </div>
        </div>

        {isUploading ? (
          <span className="flex items-center gap-1.5 text-xs text-forest-700 bg-forest-100 border border-forest-200 px-2.5 py-1 rounded-full font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading Narration...</span>
          </span>
        ) : audioUrl && !isRecording ? (
          <span className="flex items-center gap-1 text-xs text-forest-700 bg-forest-100 border border-forest-200 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Narration Ready</span>
          </span>
        ) : null}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording Stage */}
      <div className="mt-4 flex flex-col items-center justify-center p-6 bg-parchment-100/60 border border-dashed border-sage-300 rounded-xl">
        {isRecording ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-terracotta-500 animate-ping" />
              <span className="font-mono text-2xl font-bold text-terracotta-500">
                {formatAudioDuration(recordingDuration)}
              </span>
            </div>
            <p className="text-xs text-bark-600">Recording your voice... Speak clearly into your mic.</p>

            <Button
              variant="danger"
              size="md"
              leftIcon={<Square className="w-4 h-4 fill-white" />}
              onClick={stopRecording}
              className="mt-2"
            >
              Stop Recording
            </Button>
          </div>
        ) : audioUrl ? (
          /* Preview & Actions Stage */
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-bark-600">
              <span>Preview Narration</span>
              <span>
                {existingAudio?.durationSeconds
                  ? formatAudioDuration(existingAudio.durationSeconds)
                  : formatAudioDuration(recordingDuration)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-sage-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-forest-600 h-full transition-all duration-100"
                style={{ width: `${previewProgress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  onClick={togglePreview}
                >
                  {isPlayingPreview ? 'Pause' : 'Play Preview'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={discardRecording}
                >
                  Re-record
                </Button>
              </div>

              {audioBlob ? (
                <Button
                  variant="terracotta"
                  size="sm"
                  isLoading={isUploading}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                  onClick={uploadRecording}
                >
                  Upload &amp; Attach
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
                  onClick={discardRecording}
                  className="text-red-700 hover:bg-red-50"
                >
                  Remove Audio
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Initial Idle Prompt */
          <div className="flex flex-col items-center gap-2 text-center">
            <Button
              variant="terracotta"
              size="md"
              leftIcon={<Mic className="w-4 h-4" />}
              onClick={startRecording}
              className="shadow-sm"
            >
              Start Recording Narration
            </Button>
            <p className="text-xs text-bark-500 max-w-xs mt-1">
              Click to record using your microphone. You can review, listen, and re-record before attaching.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
