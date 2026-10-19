import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Registration failed.');
      }

      setUser(json.data);
      navigate('/onboarding');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-4">
            <TimbaktuBird size="md" state="dancing" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-bark-900 mb-2">
            Join the Timbaktu Woods
          </h1>
          <p className="text-sm text-bark-600 mb-6">
            Create an account to tell stories with your written words and voice.
          </p>

          <Card className="p-6 sm:p-8 text-left shadow-md">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name or Pen Name"
                placeholder="e.g. Leo Woodland"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Username"
                placeholder="letters, numbers, hyphens"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password (min 8 characters)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-sage-200 text-center text-xs text-bark-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-forest-700 hover:underline">
                Sign in here
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
