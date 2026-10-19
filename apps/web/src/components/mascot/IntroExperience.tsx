import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import { TimbaktuBird, BirdState } from './TimbaktuBird';
import { Button } from '../shared/Button';
import { jinglePlayer } from '../../utils/jingleAudio';

interface IntroExperienceProps {
  onComplete?: () => void;
}

export const IntroExperience: React.FC<IntroExperienceProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [birdState, setBirdState] = useState<BirdState>('hopping');
  const [step, setStep] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(jinglePlayer.getSoundEnabled());
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [speech, setSpeech] = useState<string>('Hop hop! Hello storyteller!');

  useEffect(() => {
    // Step 1: Hopping in (0 to 1.5s)
    const t1 = setTimeout(() => {
      setBirdState('dancing');
      setStep(2);
      setSpeech('Tu tu tu tu... Welcome to Timbaktu!');
    }, 1500);

    // Step 2: Celebrating brand reveal (3.0s)
    const t2 = setTimeout(() => {
      setBirdState('celebrating');
      setStep(3);
      setSpeech('Every story has a voice.');
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    jinglePlayer.setSoundEnabled(next);
    if (next) {
      jinglePlayer.playSignatureJingle();
      setBirdState('dancing');
    }
  };

  const handlePlayJingle = useCallback(() => {
    setBirdState('dancing');
    setSpeech('Tu tu tu tu... Timbaktu!');
    jinglePlayer.playSignatureJingle();
  }, []);

  const handleEnterApp = () => {
    if (dontShowAgain) {
      localStorage.setItem('timbaktu_skip_intro', 'true');
    }
    if (onComplete) {
      onComplete();
    } else {
      navigate('/home');
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-parchment-100 via-sage-100 to-parchment-200 overflow-hidden select-none">
      {/* Subtle organic background foliage shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-sage-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />

      {/* Top Bar: Sound toggle and Skip Intro button */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-parchment-50/90 border border-sage-300 text-bark-700 hover:bg-parchment-200 transition-colors shadow-sm"
          aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-forest-700" />
              <span>Sound On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-bark-400" />
              <span>Sound Off</span>
            </>
          )}
        </button>

        <button
          onClick={handleEnterApp}
          className="text-xs font-medium text-bark-600 hover:text-bark-900 underline underline-offset-4 transition-colors"
        >
          Skip Intro &rarr;
        </button>
      </header>

      {/* Central Choreography & Mascot Stage */}
      <section className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-lg px-4">
        {/* Timbaktu the Bird Mascot */}
        <div className="cursor-pointer mb-2" onClick={handlePlayJingle} title="Click Timbaktu to sing!">
          <TimbaktuBird
            state={birdState}
            size="xl"
            showSpeechBubble={true}
            speechText={speech}
          />
        </div>

        {/* Brand Name Reveal */}
        <div className={`transition-all duration-700 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight font-extrabold text-bark-900 mt-4 mb-2">
            TIMBAKTU
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl text-forest-700 font-medium">
            &ldquo;Stories sound better here.&rdquo;
          </p>
          <p className="text-sm text-bark-600 mt-2 max-w-sm mx-auto">
            Write your story. Narrate it in your own voice. Share it with the world.
          </p>
        </div>

        {/* Sound Prompt Button */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-gold-500" />}
            onClick={handlePlayJingle}
          >
            Hear Timbaktu&apos;s Jingle
          </Button>

        </div>
      </section>

      {/* Bottom Bar: Enter Timbaktu CTA & Preferences */}
      <footer className="w-full max-w-md flex flex-col items-center gap-4 z-10 pb-4">
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleEnterApp}
          className="w-full shadow-lg"
          id="enter-timbaktu-btn"
        >
          Enter Timbaktu
        </Button>

        <label className="flex items-center gap-2 text-xs text-bark-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-sage-300 text-forest-700 focus:ring-forest-600"
          />
          <span>Don&apos;t show this intro next time</span>
        </label>
      </footer>
    </main>
  );
};
