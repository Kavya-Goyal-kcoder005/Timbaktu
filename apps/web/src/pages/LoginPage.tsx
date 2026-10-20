import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@timbaktu/shared';
import { LogIn, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ login: login.trim(), password }),
      });

      const text = await res.text();
      let json: { success?: boolean; data?: User; error?: { message?: string } } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // Server returned a non-JSON or empty body — treat as a generic auth failure
        throw new Error('Invalid username or password.');
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Invalid username or password.');
      }

      setUser(json.data ?? null);
      navigate('/dashboard');
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
            <TimbaktuBird size="md" state="idle" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-bark-900 mb-2">
            Welcome Back to Timbaktu
          </h1>
          <p className="text-sm text-bark-600 mb-6">
            Sign in to continue narrating and publishing stories.
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
                label="Username or Email"
                placeholder="yourname or you@example.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-4 h-4" />}
                className="w-full mt-2"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-sage-200 text-center text-xs text-bark-600">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-forest-700 hover:underline">
                Create one here
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
