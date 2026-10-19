import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { feedbackCategories, FeedbackCategory } from '@timbaktu/shared';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { TimbaktuBird } from '../mascot/TimbaktuBird';
import { useAuth } from '../../context/AuthContext';

interface FeedbackSectionProps {
  className?: string;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ className = '' }) => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('feature_idea');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill logged in user's information if available
  useEffect(() => {
    if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (message.trim().length < 5) {
      setErrorMessage('Please share at least a few words (minimum 5 characters) so we can understand your thought.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          category,
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not send feedback. Please try again.');
      }

      setSuccessResponse(
        json.message ||
          'Thank you for being part of Timbaktu! 🌱 Your thoughts have been received. Every suggestion helps us think about how to make this community better.'
      );
      // Reset message field
      setMessage('');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Something went wrong while sending your feedback. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSuccessResponse(null);
    setErrorMessage(null);
  };

  return (
    <section
      id="feedback-section"
      className={`relative scroll-mt-20 ${className}`}
      aria-labelledby="feedback-heading"
    >
      <Card className="p-6 sm:p-10 border border-sage-300 bg-parchment-50 shadow-xl rounded-3xl relative overflow-hidden text-left">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-sage-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              Community Voice
            </div>
            <h2
              id="feedback-heading"
              className="font-serif text-3xl sm:text-4xl font-extrabold text-bark-900 mb-3"
            >
              Help Timbaktu Grow 🌱
            </h2>
            <p className="text-sm sm:text-base text-bark-600 leading-relaxed">
              Every thoughtful suggestion helps us see Timbaktu from a new perspective. What would you
              change, improve, or love to see next?
            </p>
          </div>

          {/* Success State */}
          {successResponse ? (
            <div className="text-center py-10 px-4 max-w-md mx-auto animate-scale-up" role="status">
              <div className="flex justify-center mb-4">
                <TimbaktuBird state="celebrating" size="lg" showSpeechBubble speechText="Thank you! 💖" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-forest-800 mb-2">
                Thank you for being part of Timbaktu! 🌱
              </h3>
              <p className="text-sm text-bark-700 leading-relaxed mb-6">
                {successResponse}
              </p>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSendAnother}
                className="shadow-sm"
              >
                Share Another Thought
              </Button>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
              {errorMessage && (
                <div
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Unable to send feedback</p>
                    <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name (Optional) */}
                <div>
                  <label htmlFor="feedback-name" className="block text-xs font-bold text-bark-800 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-bark-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya"
                    maxLength={100}
                    className="w-full bg-parchment-100 border border-sage-300 rounded-xl px-4 py-2.5 text-sm text-bark-900 placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label htmlFor="feedback-email" className="block text-xs font-bold text-bark-800 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-bark-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={150}
                    className="w-full bg-parchment-100 border border-sage-300 rounded-xl px-4 py-2.5 text-sm text-bark-900 placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all"
                  />
                  <p className="text-[11px] text-bark-500 mt-1">
                    Only provide an email if you would like the creator to be able to respond to you.
                  </p>
                </div>
              </div>

              {/* Feedback Category (Required) */}
              <div>
                <label htmlFor="feedback-category" className="block text-xs font-bold text-bark-800 uppercase tracking-wider mb-1.5">
                  Feedback Category <span className="text-terracotta-500">*</span>
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full bg-parchment-100 border border-sage-300 rounded-xl px-4 py-2.5 text-sm text-bark-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all cursor-pointer"
                  required
                >
                  {feedbackCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message (Required) */}
              <div>
                <label htmlFor="feedback-message" className="block text-xs font-bold text-bark-800 uppercase tracking-wider mb-1.5">
                  Your Message <span className="text-terracotta-500">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me what's on your mind..."
                  rows={5}
                  required
                  maxLength={2000}
                  className="w-full bg-parchment-100 border border-sage-300 rounded-xl px-4 py-3 text-sm text-bark-900 placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all resize-y"
                />
                <div className="flex justify-between items-center text-[11px] text-bark-400 mt-1">
                  <span>Minimum 5 characters. Be as candid as you wish.</span>
                  <span>{message.length}/2000</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-md"
                  id="submit-feedback-btn"
                >
                  {isSubmitting ? 'Sending...' : 'Share Your Thoughts'}
                </Button>

                <p className="text-xs text-bark-500 text-center sm:text-right flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>Read personally by Kavya Goyal</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </Card>
    </section>
  );
};
