import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PenSquare, Volume2, Clock, Edit3, Trash2, Globe, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react';
import { Post, formatAudioDuration } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';
import { useAuth } from '../context/AuthContext';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';

export const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteModalPost, setDeleteModalPost] = useState<Post | null>(null);

  const { data: postsData, isLoading } = useQuery<{ items: Post[]; total: number }>({
    queryKey: ['my-posts', filterTab],
    queryFn: async () => {
      let url = '/api/v1/posts?mine=true&limit=50';
      if (filterTab !== 'all') {
        url += `&status=${filterTab}`;
      }
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      return json.data || { items: [], total: 0 };
    },
    enabled: !!user,
  });

  const posts = postsData?.items || [];

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, willPublish }: { id: string; willPublish: boolean }) => {
      const endpoint = willPublish ? `/api/v1/posts/${id}/publish` : `/api/v1/posts/${id}/unpublish`;
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/posts/${id}`, { method: 'DELETE', credentials: 'include' });
      return res.json();
    },
    onSuccess: () => {
      setDeleteModalPost(null);
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <TimbaktuBird size="md" state="idle" />
          <h2 className="font-serif text-3xl font-bold text-bark-900 mt-4 mb-2">Sign in to View Your Dashboard</h2>
          <p className="text-sm text-bark-600 mb-6">Access your published stories, audio narrations, and drafts.</p>
          <Link to="/login">
            <Button variant="primary" size="md">Sign In</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage-200 gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-bark-900">
              Storyteller Dashboard
            </h1>
            <p className="text-sm text-bark-600 mt-1">
              Manage your narrated stories, drafts, and voiceovers.
            </p>
          </div>

          <Link to="/create">
            <Button variant="terracotta" size="md" leftIcon={<PenSquare className="w-4 h-4" />}>
              Create New Story
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'published', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-forest-700 text-parchment-50 shadow-sm'
                  : 'bg-parchment-50 text-bark-700 border border-sage-300 hover:bg-parchment-200'
              }`}
            >
              {tab === 'all' ? 'All Stories' : tab === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-bark-500">
            <TimbaktuBird size="md" state="hopping" />
            <p className="text-sm font-medium mt-2">Loading stories...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <TimbaktuBird size="lg" state="sleeping" />
            <h3 className="font-serif text-xl font-bold text-bark-900 mt-3 mb-1">
              No {filterTab !== 'all' ? filterTab : ''} stories found
            </h3>
            <p className="text-xs text-bark-500 mb-4">
              Write an editorial piece and record your voice narration.
            </p>
            <Link to="/create">
              <Button variant="primary" size="sm" leftIcon={<PenSquare className="w-4 h-4" />}>
                Start Writing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isPublished = post.status === 'published';

              return (
                <Card key={post.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isPublished ? 'forest' : 'draft'}>
                        {isPublished ? 'Published' : 'Draft'}
                      </Badge>

                      {post.audio ? (
                        <Badge variant="terracotta" icon={<Volume2 className="w-3 h-3" />}>
                          {formatAudioDuration(post.audio.durationSeconds)} Voiceover
                        </Badge>
                      ) : (
                        <Badge variant="sage">Text Only</Badge>
                      )}

                      <span className="text-[10px] text-bark-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {new Date(post.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link to={`/post/${post.slug}`}>
                      <h3 className="font-serif text-xl font-bold text-bark-900 hover:text-forest-700 transition-colors truncate">
                        {post.title}
                      </h3>
                    </Link>

                    {post.excerpt && (
                      <p className="text-xs text-bark-500 mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/post/${post.slug}`}>
                      <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>

                    <Link to={`/post/${post.id}/edit`}>
                      <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      onClick={() => togglePublishMutation.mutate({ id: post.id, willPublish: !isPublished })}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </Button>

                    <button
                      onClick={() => setDeleteModalPost(post)}
                      className="p-2 text-bark-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete story"
                      aria-label="Delete story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalPost}
        onClose={() => setDeleteModalPost(null)}
        title="Delete Story"
      >
        <div className="flex items-start gap-3 text-left">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-bark-900">
              Are you sure you want to delete &ldquo;{deleteModalPost?.title}&rdquo;?
            </p>
            <p className="text-xs text-bark-600 mt-1">
              This will permanently remove the story and any associated voice narration. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" size="sm" onClick={() => setDeleteModalPost(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteModalPost && deletePostMutation.mutate(deleteModalPost.id)}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};
