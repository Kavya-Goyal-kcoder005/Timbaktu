import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mic,
  PenSquare,
  BookOpen,
  Share2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { TimbaktuBird, BirdState } from '../mascot/TimbaktuBird';
import { Button } from '../shared/Button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  mascotState: BirdState;
  mascotSpeech: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-to-features',
    title: 'Your Talking Blog',
    description:
      'Timbaktu is the only blogging platform where you write AND narrate your stories in your own voice. Readers choose whether to read or listen.',
    mascotState: 'dancing',
    mascotSpeech: 'Tu tu tu tu... Timbaktu!',
    icon: <Sparkles className="w-6 h-6 text-gold-500" />,
  },
  {
    id: 'write',
    title: 'Write Your Story',
    description:
      'Use the rich text editor to craft stories with headings, quotes, bold, italic, and lists. Click "Write & Narrate" in the top bar to begin.',
    mascotState: 'hopping',
    mascotSpeech: 'Pen meets page!',
    icon: <PenSquare className="w-6 h-6 text-forest-700" />,
  },
  {
    id: 'narrate',
    title: 'Add Your Voice',
    description:
      'Record your narration directly in your browser — no app download needed. Press the mic, speak, and attach your audio before publishing.',
    mascotState: 'recording',
    mascotSpeech: 'I hear you!',
    icon: <Mic className="w-6 h-6 text-terracotta-400" />,
  },
  {
    id: 'feed',
    title: 'Discover Stories',
    description:
      'The home feed shows stories from the Timbaktu community. Search by topic, browse by tag, and discover authors whose voice you love.',
    mascotState: 'listening',
    mascotSpeech: 'So many stories!',
    icon: <BookOpen className="w-6 h-6 text-bark-700" />,
  },
  {
    id: 'share',
    title: 'Share & Export',
    description:
      'Each published story gets a unique shareable link. Export as PDF, copy the URL, or use the built-in share buttons on any story page.',
    mascotState: 'celebrating',
    mascotSpeech: 'Spread the word!',
    icon: <Share2 className="w-6 h-6 text-sage-700" />,
  },
  {
    id: 'settings',
    title: 'Make It Yours',
    description:
      'Personalise your profile picture, bio, choose a light or dark theme, control sound effects, and manage your account from Settings.',
    mascotState: 'idle',
    mascotSpeech: "It's your nest!",
    icon: <Settings className="w-6 h-6 text-bark-500" />,
  },
];

const ONBOARDING_KEY = 'timbaktu_onboarding_completed';
const ONBOARDING_SHOWN_KEY = 'timbaktu_onboarding_shown';

export function setOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function shouldShowOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_SHOWN_KEY) !== 'true';
}

export function markOnboardingShown() {
  localStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
}

interface OnboardingTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
  isFirstTime?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  onComplete,
  onSkip,
  isFirstTime = true,
}) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'welcome' | 'tour'>('welcome');
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const step = TOUR_STEPS[currentStep];

  const handleFinish = useCallback(
    (skipped = false) => {
      if (dontShowAgain || !skipped) {
        setOnboardingComplete();
      }
      markOnboardingShown();
      setIsVisible(false);
      setTimeout(() => {
        if (!skipped && onComplete) {
          onComplete();
        } else if (skipped && onSkip) {
          onSkip();
        } else {
          navigate('/home');
        }
      }, 400);
    },
    [dontShowAgain, navigate, onComplete, onSkip]
  );

  const handleStartTour = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPhase('tour');
      setCurrentStep(0);
      setIsTransitioning(false);
    }, 280);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setIsTransitioning(false);
      }, 230);
    } else {
      handleFinish(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setIsTransitioning(false);
      }, 230);
    }
  };

  const handleSkip = () => handleFinish(true);

  const progressPercent = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
      aria-label="Timbaktu Onboarding Tour"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bark-950/70 backdrop-blur-sm"
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={`relative z-10 w-full max-w-lg bg-parchment-50 rounded-3xl shadow-2xl border border-sage-200 overflow-hidden transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header rainbow bar */}
        <div className="h-1.5 bg-gradient-to-r from-forest-600 via-gold-400 to-terracotta-400" />

        {/* Close / Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full text-bark-400 hover:text-bark-700 hover:bg-parchment-200 transition-colors z-20"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ─────────────── WELCOME PHASE ─────────────── */}
        {phase === 'welcome' && (
          <div
            className={`flex flex-col items-center text-center px-8 pt-14 pb-10 transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Glowing bird */}
            <div className="relative mb-3 pt-2">
              <div className="absolute inset-0 rounded-full bg-gold-200/60 blur-3xl scale-150 pointer-events-none" />
              <TimbaktuBird
                state="dancing"
                size="lg"
                showSpeechBubble
                speechText="Welcome, storyteller! 🎉"
              />
            </div>

            <h2 className="font-serif text-3xl font-extrabold text-bark-900 mt-3 mb-2">
              Welcome to Timbaktu! 🐦
            </h2>
            <p className="text-bark-600 text-sm leading-relaxed max-w-sm mx-auto mb-8">
              <em>Your stories deserve to be heard.</em> Would you like a quick tour of
              what you can do here?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
              <Button
                type="button"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleStartTour}
                className="flex-1 shadow-md"
                id="onboarding-take-tour-btn"
              >
                Take the Tour
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleSkip}
                className="flex-1 text-bark-500"
                id="onboarding-skip-btn"
              >
                Skip for Now
              </Button>
            </div>

            {isFirstTime && (
              <label className="mt-6 flex items-center gap-2 text-xs text-bark-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-sage-300 text-forest-700 focus:ring-forest-600"
                />
                <span>Don&apos;t show this again</span>
              </label>
            )}
          </div>
        )}

        {/* ─────────────── TOUR PHASE ─────────────── */}
        {phase === 'tour' && (
          <div
            className={`flex flex-col transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Step Progress Bar */}
            <div className="w-full bg-sage-100 h-1">
              <div
                className="bg-forest-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 p-6 sm:p-8">
              {/* Left: Mascot & dots */}
              <div className="flex flex-col items-center justify-start shrink-0 sm:w-36 mb-4 sm:mb-0 pt-6">
                <TimbaktuBird
                  state={step.mascotState}
                  size="md"
                  showSpeechBubble
                  speechText={step.mascotSpeech}
                />

                {/* Navigation dots */}
                <div className="flex items-center gap-1.5 mt-5">
                  {TOUR_STEPS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                        i === currentStep
                          ? 'w-5 h-2.5 bg-forest-700'
                          : i < currentStep
                          ? 'w-2.5 h-2.5 bg-forest-400'
                          : 'w-2.5 h-2.5 bg-sage-300'
                      }`}
                      onClick={() => {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentStep(i);
                          setIsTransitioning(false);
                        }, 230);
                      }}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Step content */}
              <div className="flex-1 flex flex-col justify-between text-left min-h-[200px]">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-parchment-200 border border-sage-200 shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-forest-700">
                        Step {currentStep + 1} of {TOUR_STEPS.length}
                      </p>
                      <h3 className="font-serif text-xl font-bold text-bark-900 leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-bark-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-between gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="min-w-[84px]"
                  >
                    Back
                  </Button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-bark-400 hover:text-bark-700 underline underline-offset-4 transition-colors"
                  >
                    Skip Tour
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    rightIcon={
                      currentStep === TOUR_STEPS.length - 1 ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )
                    }
                    onClick={handleNext}
                    className="min-w-[104px] shadow-sm"
                    id={`onboarding-step-${currentStep}-next`}
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? "Let's Go!" : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer tagline */}
        <div className="border-t border-sage-100 py-2 px-6 text-center">
          <p className="text-[10px] text-bark-400 italic">
            &ldquo;Stories sound better here.&rdquo; &mdash; Timbaktu
          </p>
        </div>
      </div>
    </div>
  );
};
