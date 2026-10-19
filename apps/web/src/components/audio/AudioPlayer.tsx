import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Gauge } from 'lucide-react';
import { MediaMetadata, formatAudioDuration } from '@timbaktu/shared';
import { TimbaktuBird } from '../mascot/TimbaktuBird';

interface AudioPlayerProps {
  audio: MediaMetadata;
  title?: string;
  authorName?: string;
}

const playbackSpeeds = [0.75, 1, 1.25, 1.5, 2];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  title,
  authorName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // 1x by default

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const handleLoadedMetadata = () => {
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(el.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ended', handleEnded);

    return () => {
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.warn('Audio playback error:', err));
      setIsPlaying(true);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.muted = next;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % playbackSpeeds.length;
    const speed = playbackSpeeds[nextIdx];
    setSpeedIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="w-full bg-parchment-50 border border-sage-300 rounded-2xl p-4 sm:p-5 shadow-sm text-left my-6"
      role="region"
      aria-label="Story audio narration player"
    >
      <audio ref={audioRef} src={audio.url} preload="metadata" />

      {/* Top Details & Mascot Status */}
      <div className="flex items-center justify-between pb-3 border-b border-sage-200 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <TimbaktuBird
            size="sm"
            state={isPlaying ? 'listening' : 'idle'}
            className="w-10 h-10 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-forest-700 bg-forest-100 border border-forest-200 px-2 py-0.5 rounded-full inline-block mb-0.5">
              Author Narration
            </span>
            <p className="font-serif font-bold text-bark-900 text-sm sm:text-base truncate">
              {title || 'Listen to this story'}
            </p>
            {authorName && (
              <p className="text-xs text-bark-500 truncate">Voiced by {authorName}</p>
            )}
          </div>
        </div>

        {/* Speed button */}
        <button
          onClick={cycleSpeed}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sage-200 hover:bg-sage-300 text-bark-800 transition-colors shrink-0"
          title="Playback speed"
          aria-label={`Playback speed: ${playbackSpeeds[speedIndex]}x`}
        >
          <Gauge className="w-3.5 h-3.5 text-forest-700" />
          <span>{playbackSpeeds[speedIndex]}x</span>
        </button>
      </div>

      {/* Scrub Bar & Timestamps */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="w-full h-3 bg-sage-200 hover:bg-sage-300 rounded-full cursor-pointer relative overflow-hidden transition-colors"
          role="slider"
          aria-label="Audio progress slider"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
        >
          <div
            className="bg-forest-600 h-full rounded-full transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-bark-500">
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rewind 10s */}
          <button
            onClick={() => seekRelative(-10)}
            className="p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-parchment-200 transition-colors"
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Main Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-forest-700 hover:bg-forest-800 text-parchment-50 flex items-center justify-center shadow-md transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-parchment-50" />
            ) : (
              <Play className="w-5 h-5 fill-parchment-50 translate-x-0.5" />
            )}
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => seekRelative(10)}
            className="p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-parchment-200 transition-colors"
            title="Fast forward 10 seconds"
            aria-label="Fast forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-bark-600 hover:text-bark-900 transition-colors p-1"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-bark-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-forest-700" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 accent-forest-700 cursor-pointer h-1.5 bg-sage-200 rounded-lg"
            aria-label="Audio volume"
          />
        </div>
      </div>
    </div>
  );
};
