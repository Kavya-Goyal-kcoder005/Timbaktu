import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';
import { MediaMetadata } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { useAuth } from '../context/AuthContext';

export const CreatePostPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [audio, setAudio] = useState<MediaMetadata | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['stories']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading storyteller profile...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <h2 className="font-serif text-3xl font-bold text-bark-900 mb-2">Join Timbaktu to Tell Stories</h2>
          <p className="text-sm text-bark-600 mb-6">
            You must be signed in to compose articles and record your voice narration.
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="primary" size="md">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="md">Create Account</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanTag && !tags.includes(cleanTag) && tags.length < 6) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (targetStatus: 'draft' | 'published') => {
    setErrorMessage(null);
    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Please give your story a title of at least 3 characters.');
      return;
    }
    if (!contentHtml.trim() || contentHtml.replace(/<[^>]+>/g, '').trim().length < 10) {
      setErrorMessage('Please write some content for your story (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          contentHtml,
          audio: audio || null,
          tags,
          status: targetStatus,
          visibility: 'public',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to save story.');
      }

      if (targetStatus === 'published') {
        navigate(`/post/${json.data.slug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-sage-200 mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-bark-600 hover:text-bark-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => handleSubmit('draft')}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => handleSubmit('published')}
            >
              Publish Story
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Story Title & Excerpt */}
        <div className="space-y-4 mb-8">
          <Input
            label="Story Title"
            placeholder="Give your story a memorable, evocative title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-serif"
            required
          />

          <Input
            label="Short Excerpt (Optional)"
            placeholder="A brief sentence introducing the story on feeds and social shares..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        {/* Voice Narration Section */}
        <div className="mb-8">
          <AudioRecorder
            existingAudio={audio}
            onAudioUploaded={(meta) => setAudio(meta)}
            onAudioRemoved={() => setAudio(null)}
          />
        </div>

        {/* Written Article TipTap Rich Editor */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-bark-800 mb-1.5">
            Written Article Content
          </label>
          <RichTextEditor
            initialContent={contentHtml}
            onChange={(html) => setContentHtml(html)}
          />
        </div>

        {/* Tags Selector */}
        <div className="mb-10 bg-parchment-50 border border-sage-300 rounded-xl p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 mb-2">
            Story Tags (Up to 6)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 bg-sage-200 text-forest-800 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-600 font-bold ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {tags.length < 6 && (
            <input
              type="text"
              placeholder="Type a tag and press Enter or comma..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="text-xs bg-parchment-100 border border-sage-300 rounded-lg px-3 py-1.5 w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
