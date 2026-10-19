import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { TimbaktuBird } from '../mascot/TimbaktuBird';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bark-900 text-parchment-200 border-t border-bark-800 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-bark-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <TimbaktuBird size="sm" state="dancing" className="w-10 h-10" />
              <span className="font-serif text-2xl font-bold tracking-tight text-parchment-50">
                TIMBAKTU
              </span>
            </div>
            <p className="font-serif italic text-gold-300 text-base">
              &ldquo;Stories sound better here.&rdquo;
            </p>
            <p className="text-sm text-bark-400 max-w-sm">
              The talking-blogging platform where written prose and human voice unite. Write your article, record its narration, and share your genuine voice with the world.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5 text-sm">
            <h4 className="font-bold text-parchment-50 uppercase tracking-wider text-xs">Explore</h4>
            <Link to="/letter-from-the-nest" className="text-gold-300 font-medium hover:text-parchment-100 transition-colors flex items-center gap-1.5">
              <span>💌 A Letter from the Nest</span>
            </Link>
            <Link to="/home" className="text-bark-400 hover:text-parchment-100 transition-colors">Featured Stories</Link>
            <Link to="/create" className="text-bark-400 hover:text-parchment-100 transition-colors">Start Writing</Link>
            <Link to="/dashboard" className="text-bark-400 hover:text-parchment-100 transition-colors">Your Dashboard</Link>
            <Link to="/intro" className="text-bark-400 hover:text-parchment-100 transition-colors flex items-center gap-1.5">
              <span>🐦 Replay Mascot Intro</span>
            </Link>
          </div>

          {/* Philosophy / Mascot */}
          <div className="flex flex-col gap-2.5 text-sm">
            <h4 className="font-bold text-parchment-50 uppercase tracking-wider text-xs">The Mascot</h4>
            <p className="text-xs text-bark-400 leading-relaxed">
              Timbaktu the Cuckoo sings the original signature motif &ldquo;Tu tu tu tu... Timbaktu!&rdquo; and watches over every story told here.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-sage-300 bg-forest-900/60 border border-forest-800 px-3 py-1 rounded-full">
                <span>🌱 Woodland Editorial Edition</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-bark-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Timbaktu Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-terracotta-400 fill-terracotta-400" /> for storytellers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
