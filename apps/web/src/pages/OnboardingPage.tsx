import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingTour } from '../components/onboarding/OnboardingTour';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-parchment-200 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background forest pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2d503d_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Tour Component Modal */}
      <OnboardingTour
        isFirstTime={true}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};
