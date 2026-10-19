import React from 'react';

export type BirdState = 'idle' | 'hopping' | 'dancing' | 'listening' | 'recording' | 'celebrating' | 'sleeping';

interface TimbaktuBirdProps {
  state?: BirdState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showSpeechBubble?: boolean;
  speechText?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-28 h-28',
  lg: 'w-44 h-44',
  xl: 'w-64 h-64',
};

export const TimbaktuBird: React.FC<TimbaktuBirdProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  onClick,
  showSpeechBubble = false,
  speechText = 'Tu tu tu tu... Timbaktu!',
}) => {
  // Animation classes matching states
  const getStateAnimation = () => {
    switch (state) {
      case 'hopping':
        return 'animate-bird-hop';
      case 'dancing':
        return 'animate-bird-dance';
      case 'listening':
        return 'transition-transform duration-500 hover:rotate-6';
      case 'recording':
        return 'animate-pulse-subtle';
      case 'celebrating':
        return 'animate-bird-dance';
      case 'sleeping':
        return 'opacity-85';
      case 'idle':
      default:
        return 'transition-transform duration-300 hover:scale-105';
    }
  };

  const isSleeping = state === 'sleeping';
  const isRecording = state === 'recording';
  const isListening = state === 'listening';
  const isDancing = state === 'dancing' || state === 'celebrating';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
      role="img"
      aria-label={`Timbaktu the Cuckoo mascot in ${state} state`}
    >
      {/* Optional Speech Bubble */}
      {showSpeechBubble && (
        <div className="absolute -top-11 z-20 bg-parchment-50 border border-sage-300 text-bark-800 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full shadow-md whitespace-nowrap animate-bubble-float pointer-events-none select-none">
          {speechText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-parchment-50 border-b border-r border-sage-300 rotate-45" />
        </div>
      )}

      {/* Floating Notes / Sound waves for dancing or recording */}
      {isDancing && (
        <div className="absolute -top-2 right-1 text-gold-500 font-bold text-lg animate-ping pointer-events-none">
          ♪
        </div>
      )}
      {isRecording && (
        <div className="absolute -top-3 left-2 flex items-center gap-1 bg-terracotta-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          REC
        </div>
      )}
      {isSleeping && (
        <div className="absolute -top-4 right-2 text-bark-400 font-serif font-bold text-sm animate-pulse">
          Zzz...
        </div>
      )}

      {/* Mascot SVG Vector Illustration */}
      <svg
        viewBox="0 0 120 120"
        className={`${sizeMap[size]} ${getStateAnimation()} drop-shadow-md`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="timbaktu-cuckoo">
          {/* Subtle warm glow backdrop */}
          <circle cx="60" cy="62" r="48" fill="#F4ECE0" fillOpacity="0.6" />

          {/* Feet */}
          <path
            d="M50 96 L47 106 M50 106 L55 106 M68 96 L65 106 M68 106 L73 106"
            stroke="#49372B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Tail Feathers */}
          <path
            d="M26 68 C16 70 12 80 20 86 C28 88 34 82 36 74 Z"
            fill="#3D503A"
          />

          {/* Main Body */}
          <ellipse cx="60" cy="64" rx="34" ry="32" fill="#536B4E" />

          {/* Breast / Belly in Warm Parchment */}
          <path
            d="M60 42 C76 42 88 56 86 74 C84 88 72 94 60 94 C48 94 44 86 46 72 C48 58 52 42 60 42 Z"
            fill="#FAF6ED"
          />

          {/* Wing */}
          <path
            d={isDancing ? "M38 52 C30 40 46 36 54 48 C48 58 36 62 38 52 Z" : "M40 60 C32 54 42 46 52 56 C46 68 36 70 40 60 Z"}
            fill="#3D503A"
            className="transition-all duration-300"
          />

          {/* Head Crest / Feather Tuft */}
          <path
            d="M56 32 C52 20 62 22 65 30 Z"
            fill="#C87556"
          />
          <path
            d="M63 31 C63 18 72 21 73 30 Z"
            fill="#E9BC62"
          />

          {/* Beak */}
          {isDancing || isRecording ? (
            /* Open Singing Beak */
            <g>
              <path d="M84 56 L102 52 L86 62 Z" fill="#C87556" />
              <path d="M86 62 L98 68 L84 66 Z" fill="#B05F41" />
              <ellipse cx="88" cy="62" rx="3" ry="2" fill="#49372B" />
            </g>
          ) : (
            /* Closed Friendly Beak */
            <path d="M84 57 L102 62 L84 68 Z" fill="#C87556" />
          )}

          {/* Eye */}
          {isSleeping ? (
            <path
              d="M70 54 Q75 58 80 54"
              stroke="#49372B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <g>
              <ellipse cx="74" cy="53" rx="7" ry="7.5" fill="#49372B" />
              <circle cx="76.5" cy="50.5" r="2.8" fill="#FFFFFF" />
              <circle cx="72" cy="55.5" r="1.2" fill="#FFFFFF" />
              {/* Cute Cheek Blush */}
              <ellipse cx="72" cy="65" rx="5" ry="3.5" fill="#E5B19E" fillOpacity="0.8" />
            </g>
          )}

          {/* Listening State: Headphones Accessory */}
          {isListening && (
            <g className="animate-pulse">
              <path
                d="M54 44 C56 28 84 28 86 44"
                stroke="#C87556"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="50" y="44" width="7" height="12" rx="3.5" fill="#C87556" />
              <rect x="83" y="44" width="7" height="12" rx="3.5" fill="#C87556" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
