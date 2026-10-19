import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Volume2,
  Share2,
  Download,
  Flag,
  Edit3,
  Check,
  FileText,
  FileCode,
  Music,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { Post, formatAudioDuration } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { useAuth } from '../context/AuthContext';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [copiedLink, setCopiedLink] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/posts/${slug}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Post not found.');
      }
      return json.data;
    },
    enabled: !!slug,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'Timbaktu Story',
          text: post?.excerpt || 'Listen to this story on Timbaktu',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    try {
      await fetch(`/api/v1/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Report submission failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-bark-500">
          <TimbaktuBird size="md" state="listening" />
          <p className="mt-4 text-sm font-medium">Opening the woodland story...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <TimbaktuBird size="lg" state="sleeping" />
          <h2 className="font-serif text-3xl font-bold text-bark-900 mt-4 mb-2">Story Not Found</h2>
          <p className="text-sm text-bark-600 mb-6">
            The story you are seeking may have been moved, deleted, or is kept private by its author.
          </p>
          <Link to="/home">
            <Button variant="primary" size="md">Return to Stories Feed</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isAuthor = user && (user.id === post.authorId || user.username === post.author.username);

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 text-left">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-bark-600 hover:text-bark-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Stories</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="pb-8 border-b border-sage-200">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.audio && (
              <Badge variant="terracotta" icon={<Volume2 className="w-3.5 h-3.5" />}>
                {formatAudioDuration(post.audio.durationSeconds)} Narration
              </Badge>
            )}
            <Badge variant="sage" icon={<Clock className="w-3.5 h-3.5" />}>
              {post.readingTimeMinutes} min read
            </Badge>
            {post.tags?.map((t) => (
              <Badge key={t} variant="gold">
                #{t}
              </Badge>
            ))}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-bark-900 leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-serif italic text-lg sm:text-xl text-bark-600 mb-6 leading-relaxed">
              &ldquo;{post.excerpt}&rdquo;
            </p>
          )}

          {/* Author info & Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sage-200/80">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author.username}`}>
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-sage-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-forest-700 text-parchment-50 flex items-center justify-center font-bold text-sm uppercase">
                    {post.author.displayName.charAt(0)}
                  </div>
                )}
              </Link>
              <div>
                <Link to={`/profile/${post.author.username}`} className="font-bold text-bark-900 text-sm hover:underline">
                  {post.author.displayName}
                </Link>
                <div className="flex items-center gap-2 text-xs text-bark-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && (
                <Link to={`/post/${post.id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                    Edit
                  </Button>
                </Link>
              )}

              <Button
                variant="secondary"
                size="sm"
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-forest-700" /> : <Share2 className="w-3.5 h-3.5" />}
                onClick={handleShare}
              >
                {copiedLink ? 'Copied Link!' : 'Share'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => setExportModalOpen(true)}
              >
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Signature Audio Player */}
        {post.audio && (
          <AudioPlayer
            audio={post.audio}
            title={post.title}
            authorName={post.author.displayName}
          />
        )}

        {/* Rich Article Prose Body */}
        <article
          className="timbaktu-prose py-8 text-left"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Article Footer & Report Action */}
        <footer className="pt-8 border-t border-sage-200 flex items-center justify-between text-xs text-bark-500">
          <p>Published on Timbaktu &bull; Stories sound better here.</p>
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1 text-bark-400 hover:text-red-700 transition-colors"
          >
            <Flag className="w-3 h-3" />
            <span>Report Story</span>
          </button>
        </footer>
      </main>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export this Story"
      >
        <p className="text-xs text-bark-600 mb-4">
          Download a clean, beautifully formatted copy of this story in your preferred format:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`/api/v1/posts/${post.id}/export?format=pdf`}
            download
            className="flex items-center gap-3 p-3 bg-parchment-100 hover:bg-parchment-200 border border-sage-300 rounded-xl transition-colors text-bark-800"
          >
            <FileText className="w-5 h-5 text-terracotta-500" />
            <div>
              <p className="font-bold text-sm">Download PDF</p>
              <p className="text-[10px] text-bark-500">Print-ready document</p>
            </div>
          </a>

          <a
            href={`/api/v1/posts/${post.id}/export?format=md`}
            download
            className="flex items-center gap-3 p-3 bg-parchment-100 hover:bg-parchment-200 border border-sage-300 rounded-xl transition-colors text-bark-800"
          >
            <FileCode className="w-5 h-5 text-forest-700" />
            <div>
              <p className="font-bold text-sm">Markdown (.md)</p>
              <p className="text-[10px] text-bark-500">Clean plain text</p>
            </div>
          </a>

          <a
            href={`/api/v1/posts/${post.id}/export?format=html`}
            download
            className="flex items-center gap-3 p-3 bg-parchment-100 hover:bg-parchment-200 border border-sage-300 rounded-xl transition-colors text-bark-800"
          >
            <FileCode className="w-5 h-5 text-gold-500" />
            <div>
              <p className="font-bold text-sm">Standalone HTML</p>
              <p className="text-[10px] text-bark-500">Self-contained web page</p>
            </div>
          </a>

          {post.audio && (
            <a
              href={`/api/v1/posts/${post.id}/export?format=audio`}
              download
              className="flex items-center gap-3 p-3 bg-parchment-100 hover:bg-parchment-200 border border-sage-300 rounded-xl transition-colors text-bark-800"
            >
              <Music className="w-5 h-5 text-forest-700" />
              <div>
                <p className="font-bold text-sm">Audio File</p>
                <p className="text-[10px] text-bark-500">Original narration</p>
              </div>
            </a>
          )}
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Content"
      >
        {reportSubmitted ? (
          <div className="py-6 text-center text-forest-800">
            <Check className="w-10 h-10 text-forest-700 mx-auto mb-2" />
            <p className="font-bold">Thank you for reporting.</p>
            <p className="text-xs text-bark-500 mt-1">Our moderation team has received your submission.</p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-bark-800 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-parchment-100 border border-sage-300 rounded-lg p-2 text-sm text-bark-900"
              >
                <option value="spam">Spam or misleading content</option>
                <option value="offensive">Offensive or abusive</option>
                <option value="harassment">Harassment</option>
                <option value="copyright">Copyright violation</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-bark-800 mb-1">Details (Optional)</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Describe why this story should be reviewed..."
                className="w-full bg-parchment-100 border border-sage-300 rounded-lg p-2 text-sm text-bark-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
};
