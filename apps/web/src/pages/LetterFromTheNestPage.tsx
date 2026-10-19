import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, MessageSquare, ArrowDown, Feather } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';
import { FeedbackSection } from '../components/feedback/FeedbackSection';
import { LETTER_FROM_THE_NEST } from '../content/letterContent';

export const LetterFromTheNestPage: React.FC = () => {
  const content = LETTER_FROM_THE_NEST;

  // Set SEO metadata
  useEffect(() => {
    document.title = content.hero.metaTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', content.hero.metaDescription);

    // Scroll to top on page mount
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [content]);

  const scrollToFeedback = () => {
    const el = document.getElementById('feedback-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100 text-bark-900 selection:bg-gold-200 selection:text-bark-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 text-left">
        {/* ─────────────── HERO SECTION ─────────────── */}
        <section className="text-center mb-12 sm:mb-16 relative">
          {/* Subtle glowing ambient backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gold-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Introducing Mascot */}
          <div className="relative inline-block mb-4">
            <TimbaktuBird
              state="dancing"
              size="lg"
              showSpeechBubble
              speechText="From Kavya's desk! 💌"
              className="drop-shadow-lg"
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-forest-700 mb-2 flex items-center justify-center gap-1.5">
            <Feather className="w-3.5 h-3.5" />
            Creator&apos;s Note
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-bark-900 tracking-tight mb-4">
            {content.hero.title}
          </h1>

          <p className="font-serif text-xl sm:text-2xl text-forest-800 italic max-w-xl mx-auto mb-4">
            {content.hero.subtitle}
          </p>

          <p className="text-sm sm:text-base text-bark-600 max-w-md mx-auto leading-relaxed mb-6">
            &ldquo;{content.hero.supportingLine}&rdquo;
          </p>

          <button
            type="button"
            onClick={scrollToFeedback}
            className="inline-flex items-center gap-2 text-xs font-semibold text-bark-600 hover:text-forest-700 bg-parchment-200/80 hover:bg-parchment-300 px-4 py-2 rounded-full transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-forest-600" />
            <span>Jump to Community Feedback</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* ─────────────── THE LETTER ─────────────── */}
        <article className="relative bg-parchment-50 border border-sage-300 rounded-3xl p-6 sm:p-12 md:p-16 shadow-lg mb-16">
          {/* Elegant top letter header bar */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-sage-200 text-xs text-bark-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-600 inline-block" />
              <span className="font-semibold uppercase tracking-wider text-forest-800">Timbaktu Nest Note #1</span>
            </div>
            <span className="italic font-serif">Open letter to our storytellers</span>
          </div>

          {/* Letter Body */}
          <div className="space-y-10 font-serif text-lg sm:text-xl text-bark-800 leading-relaxed">
            {/* Opening Greeting */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-bark-900">
                {content.greeting.heading}
              </h2>
              {content.greeting.paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 1 ? 'font-bold text-forest-900' : ''}>
                  {p}
                </p>
              ))}
            </div>

            {/* Mascot interlude 1 */}
            <div className="my-6 p-4 rounded-2xl bg-sage-50 border border-sage-200/80 flex items-center gap-4 not-prose">
              <TimbaktuBird state="idle" size="sm" className="shrink-0" />
              <p className="text-xs sm:text-sm text-bark-600 font-sans italic">
                Timbaktu was born in a quiet room with a microphone, a blank editor, and a question.
              </p>
            </div>

            {/* Sections */}
            {content.sections.map((section, sIdx) => {
              // Mascot contextual state
              const mascotState: 'listening' | 'hopping' | 'dancing' | 'celebrating' =
                sIdx === 0 ? 'listening' : sIdx === 1 ? 'hopping' : sIdx === 2 ? 'dancing' : 'celebrating';

              return (
                <section key={section.id} className="space-y-4 pt-4 border-t border-sage-100">
                  {section.heading && (
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
                        {section.heading}
                      </h3>
                      <div className="hidden sm:block opacity-85">
                        <TimbaktuBird state={mascotState} size="sm" />
                      </div>
                    </div>
                  )}

                  {section.callout && (
                    <blockquote className="my-6 p-5 sm:p-6 bg-parchment-200/60 border-l-4 border-forest-600 rounded-r-2xl text-xl sm:text-2xl font-bold italic text-forest-950">
                      &ldquo;{section.callout}&rdquo;
                    </blockquote>
                  )}

                  {section.paragraphs.map((para, pIdx) => {
                    const isStrong =
                      para.startsWith('What if') ||
                      para.startsWith('A place where') ||
                      para.startsWith('I don\'t believe') ||
                      para.startsWith('One story, one voice');

                    return (
                      <p
                        key={pIdx}
                        className={isStrong ? 'font-bold text-bark-950 text-xl sm:text-2xl my-3' : ''}
                      >
                        {para}
                      </p>
                    );
                  })}
                </section>
              );
            })}

            {/* ─────────────── PERSONAL SIGNATURE ─────────────── */}
            <div className="pt-10 border-t-2 border-dashed border-sage-300 mt-12 not-prose">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                <div>
                  <p className="font-serif italic text-lg text-bark-700 mb-3">
                    {content.signature.closing}
                  </p>

                  {/* Creator Name - EXACT: Kavya Goyal */}
                  <h2 className="font-serif text-3xl sm:text-4xl font-black text-forest-900 tracking-tight mb-1">
                    {content.signature.authorName}
                  </h2>

                  <p className="text-sm font-semibold text-bark-600 flex items-center gap-1.5 mb-2 font-sans">
                    <span>{content.signature.authorRole}</span>
                    <span role="img" aria-label="cuckoo bird">🐦</span>
                  </p>

                  <p className="text-xs font-serif italic text-forest-700 font-medium">
                    {content.signature.tagline}
                  </p>
                </div>

                {/* Mascot sitting beside signature */}
                <div className="shrink-0 pb-1">
                  <TimbaktuBird
                    state="idle"
                    size="md"
                    showSpeechBubble
                    speechText="With love from the nest! 🌿"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ─────────────── COMMUNITY FEEDBACK SECTION ─────────────── */}
        <FeedbackSection className="mb-14" />

        {/* Closing Warmth */}
        <div className="text-center py-6 text-xs text-bark-500 flex flex-col items-center gap-2">
          <p className="font-serif italic text-sm text-bark-600">
            Thank you for being here, reading, and lending your voice to Timbaktu.
          </p>
          <div className="flex items-center gap-1.5 text-forest-700 font-semibold">
            <span>Built by Kavya Goyal</span>
            <span>•</span>
            <span>For storytellers everywhere</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
