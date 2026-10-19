import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Trash2,
  Filter,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { FeedbackItem, FeedbackCategory, FeedbackStatus, FeedbackSummaryCounts, feedbackCategories } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';
import { useAuth } from '../context/AuthContext';

export const AdminFeedbackPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isCreatorOrAdmin =
    user &&
    (user.role === 'admin' ||
      user.username.toLowerCase() === 'kavya' ||
      user.username.toLowerCase() === 'admin' ||
      user.displayName.toLowerCase().includes('kavya'));

  const { data, isLoading } = useQuery<{
    items: FeedbackItem[];
    total: number;
    counts: FeedbackSummaryCounts;
  }>({
    queryKey: ['admin-feedback', statusFilter, categoryFilter],
    queryFn: async () => {
      let url = '/api/v1/feedback?limit=50';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;

      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to fetch community feedback');
      }
      return json.data;
    },
    enabled: !!isCreatorOrAdmin,
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FeedbackStatus }) => {
      const res = await fetch(`/api/v1/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/feedback/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return res.json();
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <TimbaktuBird state="hopping" size="md" showSpeechBubble speechText="Checking credentials..." />
      </div>
    );
  }

  if (!isCreatorOrAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment-100">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-bark-900 mb-2">
            Creator &amp; Admin Access Only
          </h1>
          <p className="text-sm text-bark-600 max-w-sm mb-6">
            Community feedback is kept private between storytellers and the creator (Kavya Goyal).
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/home')}>
            Return to Feed
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const items = data?.items || [];
  const counts = data?.counts || { NEW: 0, REVIEWED: 0, PLANNED: 0, RESOLVED: 0, total: 0 };

  const getStatusBadgeVariant = (st: FeedbackStatus): 'bark' | 'forest' | 'terracotta' | 'gold' | 'sage' => {
    switch (st) {
      case 'NEW':
        return 'terracotta';
      case 'REVIEWED':
        return 'gold';
      case 'PLANNED':
        return 'sage';
      case 'RESOLVED':
        return 'forest';
      default:
        return 'bark';
    }
  };

  const getCategoryLabel = (cat: FeedbackCategory): string => {
    const found = feedbackCategories.find((c) => c.id === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100 text-bark-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-sage-300">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Creator Management
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-bark-900">
              Community Feedback
            </h1>
            <p className="text-sm text-bark-600 mt-1">
              Thoughtful ideas, suggestions, and notes sent from &ldquo;A Letter from the Nest&rdquo;.
            </p>
          </div>

          <Link to="/letter-from-the-nest">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
              View Letter Page
            </Button>
          </Link>
        </div>

        {/* Counts KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <Card
            className={`p-4 text-center border cursor-pointer transition-all ${
              statusFilter === 'all' ? 'border-forest-700 ring-2 ring-forest-700/20' : 'hover:border-sage-400'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <p className="text-xs uppercase tracking-wider text-bark-500 font-bold">Total</p>
            <p className="font-serif text-2xl sm:text-3xl font-extrabold text-bark-900 mt-1">
              {counts.total}
            </p>
          </Card>

          <Card
            className={`p-4 text-center border cursor-pointer transition-all ${
              statusFilter === 'NEW' ? 'border-terracotta-500 ring-2 ring-terracotta-500/20' : 'hover:border-sage-400'
            }`}
            onClick={() => setStatusFilter('NEW')}
          >
            <p className="text-xs uppercase tracking-wider text-terracotta-600 font-bold">New</p>
            <p className="font-serif text-2xl sm:text-3xl font-extrabold text-terracotta-700 mt-1">
              {counts.NEW}
            </p>
          </Card>

          <Card
            className={`p-4 text-center border cursor-pointer transition-all ${
              statusFilter === 'REVIEWED' ? 'border-gold-500 ring-2 ring-gold-500/20' : 'hover:border-sage-400'
            }`}
            onClick={() => setStatusFilter('REVIEWED')}
          >
            <p className="text-xs uppercase tracking-wider text-gold-600 font-bold">Reviewed</p>
            <p className="font-serif text-2xl sm:text-3xl font-extrabold text-bark-900 mt-1">
              {counts.REVIEWED}
            </p>
          </Card>

          <Card
            className={`p-4 text-center border cursor-pointer transition-all ${
              statusFilter === 'PLANNED' ? 'border-sage-500 ring-2 ring-sage-500/20' : 'hover:border-sage-400'
            }`}
            onClick={() => setStatusFilter('PLANNED')}
          >
            <p className="text-xs uppercase tracking-wider text-sage-700 font-bold">Planned</p>
            <p className="font-serif text-2xl sm:text-3xl font-extrabold text-bark-900 mt-1">
              {counts.PLANNED}
            </p>
          </Card>

          <Card
            className={`p-4 text-center border cursor-pointer transition-all ${
              statusFilter === 'RESOLVED' ? 'border-forest-700 ring-2 ring-forest-700/20' : 'hover:border-sage-400'
            }`}
            onClick={() => setStatusFilter('RESOLVED')}
          >
            <p className="text-xs uppercase tracking-wider text-forest-700 font-bold">Resolved</p>
            <p className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-800 mt-1">
              {counts.RESOLVED}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-bark-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-parchment-50 border border-sage-300 rounded-lg px-3 py-1.5 text-xs text-bark-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
            >
              <option value="all">All Categories</option>
              {feedbackCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-parchment-50 border border-sage-300 rounded-lg px-3 py-1.5 text-xs text-bark-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
            >
              <option value="all">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="PLANNED">Planned</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <p className="text-xs text-bark-500">
            Showing {items.length} of {data?.total || 0} feedback items
          </p>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <TimbaktuBird state="hopping" size="md" showSpeechBubble speechText="Fetching community notes..." />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center border border-sage-200">
            <TimbaktuBird state="idle" size="md" className="mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-bark-900 mb-1">
              No feedback found
            </h3>
            <p className="text-xs text-bark-500">
              There are no submissions matching your current filter criteria.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-5 sm:p-6 border border-sage-300 hover:border-forest-600/40 transition-colors bg-parchment-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  {/* Left: User meta & Category */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status}
                      </Badge>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-parchment-200 text-bark-700">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-xs text-bark-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-bark-600 mt-1">
                      {item.user ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-forest-700" />
                          <span className="font-bold text-bark-900">
                            {item.user.displayName} (@{item.user.username})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-bark-400" />
                          <span className="font-medium text-bark-700">
                            {item.name || 'Anonymous Visitor'}
                          </span>
                        </div>
                      )}

                      {item.email && (
                        <span className="flex items-center gap-1 text-forest-700 font-sans ml-2">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${item.email}`} className="underline hover:text-forest-900">
                            {item.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: item.id,
                          status: e.target.value as FeedbackStatus,
                        })
                      }
                      className="bg-parchment-100 border border-sage-300 rounded-lg px-2.5 py-1 text-xs font-medium text-bark-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest-600"
                    >
                      <option value="NEW">Mark as NEW</option>
                      <option value="REVIEWED">Mark as REVIEWED</option>
                      <option value="PLANNED">Mark as PLANNED</option>
                      <option value="RESOLVED">Mark as RESOLVED</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this feedback item?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="p-1.5 text-bark-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="font-serif text-base text-bark-900 leading-relaxed bg-parchment-100/70 p-4 rounded-xl border border-sage-200 whitespace-pre-line mt-2">
                  {item.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
