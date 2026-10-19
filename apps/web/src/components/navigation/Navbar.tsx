import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, Search, Volume2, VolumeX, User as UserIcon, LayoutDashboard, LogOut, Settings, Compass, Mail, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TimbaktuBird } from '../mascot/TimbaktuBird';
import { Button } from '../shared/Button';
import { jinglePlayer } from '../../utils/jingleAudio';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(jinglePlayer.getSoundEnabled());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    jinglePlayer.setSoundEnabled(next);
    if (next) {
      jinglePlayer.playSignatureJingle();
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-parchment-100/90 backdrop-blur-md border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Mascot */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <TimbaktuBird size="sm" state="idle" className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-bark-900 group-hover:text-forest-700 transition-colors">
                TIMBAKTU
              </span>
              <span className="text-[10px] tracking-wider uppercase text-forest-700 -mt-1 font-semibold hidden sm:inline">
                Talking Stories
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-bark-400" />
              <input
                type="text"
                placeholder="Search stories, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-parchment-50 border border-sage-300 rounded-full pl-9 pr-4 py-1.5 text-sm text-bark-800 placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-full text-bark-600 hover:text-bark-900 hover:bg-parchment-200 transition-colors"
              title={soundEnabled ? "Mute audio" : "Enable sound"}
              aria-label={soundEnabled ? "Mute audio" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-forest-700" />
              ) : (
                <VolumeX className="w-5 h-5 text-bark-400" />
              )}
            </button>

            {/* Write Story Button */}
            <Link to="/create">
              <Button
                variant="terracotta"
                size="sm"
                leftIcon={<PenSquare className="w-4 h-4" />}
                className="shadow-sm"
              >
                <span className="hidden sm:inline">Write &amp; Narrate</span>
                <span className="sm:hidden">Write</span>
              </Button>
            </Link>

            {/* User Auth / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-parchment-200 transition-colors"
                  aria-label="User account menu"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-sage-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-forest-700 text-parchment-50 flex items-center justify-center font-bold text-xs uppercase">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-parchment-50 border border-sage-300 rounded-xl shadow-lg py-2 z-50 text-left animate-scale-up"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-sage-200">
                      <p className="text-sm font-bold text-bark-900 truncate">{user.displayName}</p>
                      <p className="text-xs text-bark-500 truncate">@{user.username}</p>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-bark-700 hover:bg-parchment-200 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-forest-700" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-bark-700 hover:bg-parchment-200 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-forest-700" />
                      <span>Dashboard &amp; Drafts</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-bark-700 hover:bg-parchment-200 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-forest-700" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/letter-from-the-nest"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-forest-800 font-medium hover:bg-parchment-200 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-terracotta-400 fill-terracotta-400" />
                      <span>Letter from the Nest</span>
                    </Link>

                    <Link
                      to="/onboarding"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-bark-700 hover:bg-parchment-200 transition-colors"
                    >
                      <Compass className="w-4 h-4 text-forest-700" />
                      <span>Take Guided Tour</span>
                    </Link>

                    {(user.role === 'admin' ||
                      user.username.toLowerCase() === 'kavya' ||
                      user.username.toLowerCase() === 'admin' ||
                      user.displayName.toLowerCase().includes('kavya')) && (
                      <Link
                        to="/admin/feedback"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-forest-900 font-bold bg-forest-50 hover:bg-forest-100 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-forest-700" />
                        <span>Community Feedback</span>
                      </Link>
                    )}

                    <div className="border-t border-sage-200 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await logout();
                          navigate('/home');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
