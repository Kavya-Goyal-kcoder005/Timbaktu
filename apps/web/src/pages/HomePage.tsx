import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Volume2, Clock, Sparkles, PenSquare, Tag, ArrowRight } from 'lucide-react';
import { Post, formatAudioDuration } from '@timbaktu/shared';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { TimbaktuBird } from '../components/mascot/TimbaktuBird';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';

const curatedTags = ['all', 'woodland', 'stories', 'nature', 'memoir', 'poetry', 'philosophy'];

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const { data, isLoading } = useQuery<{ items: Post[]; total: number }>({
    queryKey: ['posts', activeTag, searchQuery],
    queryFn: async () => {
      let url = '/api/v1/posts?page=1&limit=20';
      if (activeTag && activeTag !== 'all') {
        url += `&tag=${encodeURIComponent(activeTag)}`;
      }
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      return json.data || { items: [], total: 0 };
    },
  });

  const posts = data?.items || [];
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const recentPosts = posts.length > 1 ? posts.slice(1) : [];

  const handleTagClick = (tag: string) => {
    if (tag === 'all') {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Editorial Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-sage-200/70 via-parchment-50 to-gold-100/50 border border-sage-300 rounded-3xl p-6 sm:p-10 mb-10 shadow-sm text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-100 border border-forest-200 px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                The Talking-Blogging Platform
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-bark-900 leading-tight">
                Stories sound better here.
              </h1>
              <p className="text-base sm:text-lg text-bark-600 mt-3 font-sans leading-relaxed">
                Every story has a voice. Write your reflections, record your own narration, and share rich editorial essays that people can read, listen to, or both.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/create">
                  <Button variant="terracotta" size="md" leftIcon={<PenSquare className="w-4 h-4" />}>
                    Tell Your Story
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="md">
                    Watch Mascot Intro
                  </Button>
                </Link>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <TimbaktuBird size="lg" state="dancing" showSpeechBubble speechText="Tu tu tu tu... Read &amp; Listen!" />
            </div>
          </div>
        </section>

        {/* Topic Filters */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-sage-200 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-bark-400 shrink-0 ml-1" />
            <span className="text-xs font-semibold uppercase tracking-wider text-bark-500 mr-2 shrink-0">
              Topics:
            </span>
            {curatedTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full capitalize transition-all shrink-0 ${
                  activeTag === tag
                    ? 'bg-forest-700 text-parchment-50 shadow-sm'
                    : 'bg-parchment-50 text-bark-700 border border-sage-300 hover:bg-parchment-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="text-xs text-bark-500 shrink-0">
              Filtering by: <span className="font-semibold text-bark-800">&ldquo;{searchQuery}&rdquo;</span>
              <button
                onClick={() => {
                  searchParams.delete('q');
                  setSearchParams(searchParams);
                }}
                className="ml-2 text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Feed Content */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-bark-500">
            <TimbaktuBird size="md" state="hopping" />
            <p className="text-sm font-medium">Gathering stories from the woods...</p>
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <TimbaktuBird size="lg" state="sleeping" />
            <h3 className="font-serif text-2xl font-bold text-bark-900 mt-4 mb-2">
              No stories found in this glade yet.
            </h3>
            <p className="text-sm text-bark-500 mb-6">
              Be the first storyteller to narrate your words and bring Timbaktu to life!
            </p>
            <Link to="/create">
              <Button variant="primary" size="md" leftIcon={<PenSquare className="w-4 h-4" />}>
                Write the First Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="pt-8 space-y-10">
            {/* Featured Post (if not filtering) */}
            {featuredPost && (
              <section className="text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-3 block">
                  ★ Featured Narration
                </span>
                <Card hoverEffect borderVariant="accent" className="bg-parchment-50 p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {featuredPost.audio && (
                          <Badge variant="terracotta" icon={<Volume2 className="w-3.5 h-3.5" />}>
                            {formatAudioDuration(featuredPost.audio.durationSeconds)} Narration
                          </Badge>
                        )}
                        <Badge variant="sage" icon={<Clock className="w-3.5 h-3.5" />}>
                          {featuredPost.readingTimeMinutes} min read
                        </Badge>
                        {featuredPost.tags?.map((t: string) => (
                          <Badge key={t} variant="gold">
                            #{t}
                          </Badge>
                        ))}
                      </div>

                      <Link to={`/post/${featuredPost.slug}`}>
                        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-bark-900 hover:text-forest-700 transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-bark-600 text-sm sm:text-base mt-3 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt || 'Click to read and listen to this narrated story on Timbaktu.'}
                      </p>

                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-sage-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-forest-700 text-parchment-50 flex items-center justify-center font-bold text-xs uppercase">
                            {featuredPost.author?.displayName?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-bark-900">{featuredPost.author?.displayName}</p>
                            <p className="text-[10px] text-bark-500">
                              {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <Link to={`/post/${featuredPost.slug}`}>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:underline">
                            Read &amp; Listen <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Recent Stories Grid */}
            {recentPosts.length > 0 && (
              <section className="text-left">
                <h3 className="font-serif text-2xl font-bold text-bark-900 mb-6">
                  Recently Narrated Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <Card key={post.id} hoverEffect className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {post.audio ? (
                            <Badge variant="terracotta" icon={<Volume2 className="w-3 h-3" />}>
                              {formatAudioDuration(post.audio.durationSeconds)}
                            </Badge>
                          ) : (
                            <Badge variant="sage">Text Only</Badge>
                          )}
                          <Badge variant="sage" icon={<Clock className="w-3 h-3" />}>
                            {post.readingTimeMinutes}m
                          </Badge>
                        </div>

                        <Link to={`/post/${post.slug}`}>
                          <h4 className="font-serif text-xl font-bold text-bark-900 hover:text-forest-700 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-bark-600 mt-2 line-clamp-3 leading-relaxed">
                          {post.excerpt || 'Read and listen to the narration on Timbaktu.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-sage-200 flex items-center justify-between text-xs text-bark-500">
                        <span>By {post.author?.displayName}</span>
                        <Link to={`/post/${post.slug}`} className="font-medium text-forest-700 hover:underline">
                          Listen &rarr;
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
