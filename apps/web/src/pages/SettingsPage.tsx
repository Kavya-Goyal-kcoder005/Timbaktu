import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Check, Volume2, Sparkles, User, Shield } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { useAuth } from '../context/AuthContext';
import { jinglePlayer } from '../utils/jingleAudio';

export const SettingsPage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [soundEnabled, setSoundEnabled] = useState(jinglePlayer.getSoundEnabled());
  const [skipIntro, setSkipIntro] = useState(localStorage.getItem('timbaktu_skip_intro') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(false);

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          preferences: {
            soundEnabled,
            introEnabled: !skipIntro,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data);
      }

      // Also persist local preferences
      jinglePlayer.setSoundEnabled(soundEnabled);
      localStorage.setItem('timbaktu_skip_intro', String(skipIntro));

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 text-left">
        <h1 className="font-serif text-3xl font-extrabold text-bark-900 mb-2">
          Account &amp; Preferences
        </h1>
        <p className="text-sm text-bark-600 mb-8">
          Personalize your storyteller profile and audio experience.
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-forest-100 border border-forest-300 rounded-xl flex items-center gap-2 text-forest-800 text-sm">
            <Check className="w-5 h-5 text-forest-700" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sage-200">
              <User className="w-5 h-5 text-forest-700" />
              <h3 className="font-bold text-bark-900">Storyteller Identity</h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <Input
                label="Avatar Image URL (Optional)"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-bark-800 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share a few words about yourself and the stories you tell..."
                  className="w-full bg-parchment-50 border border-sage-300 rounded-lg p-3 text-sm text-bark-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </Card>

          {/* Sound & Mascot Preferences */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sage-200">
              <Volume2 className="w-5 h-5 text-terracotta-500" />
              <h3 className="font-bold text-bark-900">Audio &amp; Mascot Preferences</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-parchment-200/50 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-bold text-bark-900">Signature Jingle &amp; Audio</p>
                  <p className="text-xs text-bark-500">Play Timbaktu&apos;s cheerful Web Audio motif</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 text-forest-700 rounded border-sage-300 focus:ring-forest-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-parchment-200/50 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-bold text-bark-900">Skip Intro Experience</p>
                  <p className="text-xs text-bark-500">Go directly to the stories feed instead of the opening animation</p>
                </div>
                <input
                  type="checkbox"
                  checked={skipIntro}
                  onChange={(e) => setSkipIntro(e.target.checked)}
                  className="w-5 h-5 text-forest-700 rounded border-sage-300 focus:ring-forest-600"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-parchment-200/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-bark-900">Interactive Guided Tour</p>
                  <p className="text-xs text-bark-500">Revisit the first-time guided walkthrough with the cuckoo mascot</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                >
                  Take Tour
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<LogOut className="w-4 h-4 text-red-600" />}
              onClick={handleLogout}
              className="text-red-700 border-red-200 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};
