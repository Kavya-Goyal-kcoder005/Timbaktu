import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { IntroExperience } from '../components/mascot/IntroExperience';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CreatePostPage } from '../pages/CreatePostPage';
import { EditPostPage } from '../pages/EditPostPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { LetterFromTheNestPage } from '../pages/LetterFromTheNestPage';
import { AdminFeedbackPage } from '../pages/AdminFeedbackPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<IntroExperience />} />
        <Route path="/intro" element={<IntroExperience />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/post/:id/edit" element={<EditPostPage />} />
        <Route path="/post/:slug" element={<PostDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/letter-from-the-nest" element={<LetterFromTheNestPage />} />
        <Route path="/admin/feedback" element={<AdminFeedbackPage />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}
