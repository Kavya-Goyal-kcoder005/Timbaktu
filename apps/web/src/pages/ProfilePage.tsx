import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Volume2, Clock, BookOpen, Settings } from 'lucide-react';
import { PublicUserProfile, Post, formatAudioDuration } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<PublicUserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users/${username}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error('User profile not found.');
      }
      return json.data;
    },
    enabled: !!username,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<{ items: Post[] }>({
    queryKey: ['user-posts', username],
    queryFn: async () => {
      const res = await fetch(`/api/v1/posts?author=${username}&limit=30`);
      const json = await res.json();
      return json.data || { items: [] };
    },
    enabled: !!username,
  });

  const posts = postsData?.items || [];
  const isOwner = user && user.username.toLowerCase() === username?.toLowerCase();

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <TimbaktuBird size="md" state="hopping" />
          <p className="text-sm font-medium text-bark-500 mt-2">Loading storyteller profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <TimbaktuBird size="lg" state="sleeping" />
          <h2 className="font-serif text-3xl font-bold text-bark-900 mt-4 mb-2">Profile Not Found</h2>
          <p className="text-sm text-bark-600 mb-6">This storyteller profile does not exist or has been removed.</p>
          <Link to="/home">
            <Button variant="primary" size="md">Explore Stories</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Profile Header Card */}
        <div className="bg-parchment-50 border border-sage-300 rounded-3xl p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-forest-600 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-forest-700 text-parchment-50 flex items-center justify-center font-bold text-3xl uppercase shadow-md">
                  {profile.displayName.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-bark-900">
                  {profile.displayName}
                </h1>
                <p className="text-sm text-bark-500">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-sm text-bark-700 mt-2 max-w-md leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>

            {isOwner && (
              <Link to="/settings">
                <Button variant="outline" size="sm" leftIcon={<Settings className="w-3.5 h-3.5" />}>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-sage-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-forest-100 text-forest-800">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-bark-900">{profile.postCount}</p>
                <p className="text-xs text-bark-500 font-medium">Stories Told</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-terracotta-100 text-terracotta-500">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-bark-900">
                  {formatAudioDuration(profile.totalAudioDuration)}
                </p>
                <p className="text-xs text-bark-500 font-medium">Voice Narration</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <TimbaktuBird size="sm" state="dancing" className="w-10 h-10" />
              <div>
                <p className="text-xs font-bold text-forest-700">Timbaktu Storyteller</p>
                <p className="text-[10px] text-bark-400">Words &amp; Voice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Feed */}
        <h2 className="font-serif text-2xl font-bold text-bark-900 mb-6">
          Published Stories ({posts.length})
        </h2>

        {postsLoading ? (
          <p className="text-sm text-bark-500">Loading stories...</p>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center text-bark-500">
            <p>No stories published yet by this storyteller.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} hoverEffect className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {post.audio ? (
                    <Badge variant="terracotta" icon={<Volume2 className="w-3 h-3" />}>
                      {formatAudioDuration(post.audio.durationSeconds)} Voiceover
                    </Badge>
                  ) : (
                    <Badge variant="sage">Text Only</Badge>
                  )}
                  <Badge variant="sage" icon={<Clock className="w-3 h-3" />}>
                    {post.readingTimeMinutes}m
                  </Badge>
                </div>

                <Link to={`/post/${post.slug}`}>
                  <h3 className="font-serif text-xl font-bold text-bark-900 hover:text-forest-700 transition-colors">
                    {post.title}
                  </h3>
                </Link>

                {post.excerpt && (
                  <p className="text-xs text-bark-600 mt-1 line-clamp-2">{post.excerpt}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
