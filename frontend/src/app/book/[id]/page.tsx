'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // RAG inline state
  const [ragQuery, setRagQuery] = useState('');
  const [ragHistory, setRagHistory] = useState<any[]>([]);
  const [ragLoading, setRagLoading] = useState(false);
  const ragScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/books/${id}/`)
      .then(res => res.json())
      .then(data => {
          setBook(data);
          setLoading(false);
      })
      .catch(err => {
          console.error("Failed to fetch book details", err);
          setLoading(false);
      });
  }, [id]);

  // Fetch recommendations
  useEffect(() => {
    if (book && id) {
      setRecsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      fetch(`${API_URL}/api/books/${id}/recommend/`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(data.recommendations || []);
          setRecsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch recommendations", err);
          setRecsLoading(false);
        });
    }
  }, [book, id]);

  useEffect(() => {
    if (ragScrollRef.current) {
      ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
    }
  }, [ragHistory, ragLoading]);

  const handleRagSend = async (e: any) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    const contextualQuestion = `Regarding the book "${book.title}" by ${book.author}: ${ragQuery}`;
    const userMsg = { role: 'user', content: ragQuery };
    setRagHistory(prev => [...prev, userMsg]);
    setRagQuery('');
    setRagLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: contextualQuestion, book_id: id })
      });
      const data = await response.json();
      setRagHistory(prev => [...prev, {
        role: 'bot',
        content: data.answer || "Could not generate insights for this query."
      }]);
    } catch {
      setRagHistory(prev => [...prev, { role: 'bot', content: 'Connection failed.' }]);
    } finally {
      setRagLoading(false);
    }
  };

  if (loading) {
      return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm uppercase">
            Loading Archive Data...
        </main>
      )
  }

  if (!book) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono uppercase text-sm">Object Not Found</div>;

  return (
    <main className="min-h-screen bg-black text-[#EDEDED] font-sans selection:bg-[#EDEDED] selection:text-black">
      <div className="max-w-7xl mx-auto border-x border-[#222] min-h-screen relative">
        <nav className="border-b border-[#222] px-8 py-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur z-20">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-[#A0A0A0] transition-colors flex items-center gap-4">
                <span className="w-4 h-px bg-white"></span> Back
            </Link>
            <span className="font-mono text-xs text-[#555]">ARCHIVE ID / {book.id.toString().padStart(4, '0')}</span>
        </nav>
        
        <div className="grid lg:grid-cols-[1fr_400px] divide-y lg:divide-y-0 lg:divide-x divide-[#222]">
            <article className="p-8 md:p-16 lg:p-24 flex flex-col gap-12">
                <header>
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 leading-[1.05]">{book.title}</h1>
                    <p className="text-xl text-[#A0A0A0] uppercase tracking-wide">Authored by {book.author}</p>
                </header>

                {book.image_url && (
                    <figure className="w-full aspect-[4/3] bg-[#0A0A0A] border border-[#222] max-w-2xl">
                        <img src={book.image_url} alt="Cover" className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-80 hover:opacity-100 hover:grayscale-0 transition duration-700" />
                    </figure>
                )}

                <div className="prose prose-invert prose-p:text-[#CCC] prose-p:leading-relaxed prose-p:text-lg max-w-3xl">
                    <p>{book.description}</p>
                </div>

                {/* Inline RAG Section */}
                <section className="max-w-3xl border-t border-[#222] pt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-[#111] border border-[#333] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Ask About This Book</h3>
                            <p className="text-xs text-[#666]">Powered by RAG — query insights specific to this document</p>
                        </div>
                    </div>

                    <div className="bg-[#050505] border border-[#222] rounded-xl overflow-hidden">
                        {/* Chat history */}
                        <div ref={ragScrollRef} className="max-h-[350px] overflow-y-auto p-6 flex flex-col gap-6">
                            {ragHistory.length === 0 && (
                                <div className="text-center py-8 text-[#555] text-sm">
                                    <p className="mb-2">Try asking something like:</p>
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {[
                                            `What is this book about?`,
                                            `What themes does it explore?`,
                                            `Who would enjoy this book?`
                                        ].map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setRagQuery(suggestion); }}
                                                className="text-xs border border-[#333] hover:border-[#666] px-3 py-1.5 rounded-full text-[#888] hover:text-white transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ragHistory.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'bot' && (
                                        <div className="shrink-0 w-6 h-6 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center mt-0.5">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-white text-black rounded-2xl rounded-br-sm px-4 py-3' : 'text-[#CCCCCC]'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {ragLoading && (
                                <div className="flex gap-3 items-center">
                                    <div className="w-6 h-6 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    <span className="text-sm text-[#666]">Thinking...</span>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleRagSend} className="border-t border-[#222] flex">
                            <input
                                type="text"
                                value={ragQuery}
                                onChange={(e) => setRagQuery(e.target.value)}
                                placeholder="Ask about this book..."
                                className="flex-1 bg-transparent px-6 py-4 text-sm text-white placeholder-[#555] focus:outline-none"
                                disabled={ragLoading}
                            />
                            <button
                                type="submit"
                                disabled={ragLoading || !ragQuery.trim()}
                                className="px-6 text-white hover:bg-[#111] disabled:opacity-30 transition-colors border-l border-[#222]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </form>
                    </div>
                </section>
            </article>

            <aside className="p-8 md:p-12 flex flex-col gap-12 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
                <section>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#555] mb-6 border-b border-[#222] pb-2">Analysis Vector</h3>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border border-[#333] px-4 py-3">
                            <span className="font-mono text-xs text-[#888]">GENRE</span>
                            <span className="text-sm uppercase tracking-wider">{book.genre || 'UNCLASSIFIED'}</span>
                        </div>
                        <div className="flex justify-between items-center border border-[#333] px-4 py-3">
                            <span className="font-mono text-xs text-[#888]">SENTIMENT</span>
                            <span className={`text-sm uppercase tracking-wider ${book.sentiment === 'Positive' ? 'text-white' : book.sentiment === 'Negative' ? 'text-[#888]' : 'text-[#CCC]'}`}>
                                {book.sentiment || 'NEUTRAL'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border border-[#333] px-4 py-3">
                            <span className="font-mono text-xs text-[#888]">RATING</span>
                            <span className="text-sm uppercase tracking-wider">{book.rating.toFixed(1)} / 5.0</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#555] mb-6 border-b border-[#222] pb-2">Extracted Insight</h3>
                    <div className="bg-[#0A0A0A] border border-[#222] p-6">
                        <p className="text-sm font-mono leading-relaxed text-[#A0A0A0]">
                            {book.summary}
                        </p>
                    </div>
                </section>

                {recommendations.length > 0 && (
                    <section>
                        <h3 className="font-mono text-xs uppercase tracking-widest text-[#555] mb-6 border-b border-[#222] pb-2">If You Like This...</h3>
                        <div className="flex flex-col gap-3">
                            {recommendations.map((rec: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={`/book/${rec.book?.id}`}
                                    className="p-4 border border-[#333] hover:border-[#555] hover:bg-[#0A0A0A] transition-colors group"
                                >
                                    <p className="text-xs text-[#666] uppercase tracking-wider mb-2">{rec.reason}</p>
                                    <p className="text-sm font-medium group-hover:underline">{rec.book?.title}</p>
                                    <p className="text-xs text-[#777]">{rec.book?.author}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="mt-auto pt-10">
                    <button onClick={() => setShowOriginal(true)} className="block w-full border border-white text-center py-4 uppercase text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-colors">
                        View Raw Source
                    </button>
                </div>
            </aside>
        </div>
      </div>
      
      {showOriginal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
              <div className="bg-[#050505] border border-[#333] w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
                  <header className="flex justify-between items-center p-6 border-b border-[#333]">
                      <h2 className="font-mono text-xs text-white uppercase tracking-widest">RAW SOURCE TEXT / {book.id.toString().padStart(4, '0')}</h2>
                      <button onClick={() => setShowOriginal(false)} className="text-[#888] hover:text-white transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </header>
                  <div className="p-8 md:p-12 overflow-y-auto font-mono text-[#AAA] text-sm leading-8 whitespace-pre-wrap">
                      {book.description}
                      <p className="mt-12 text-[#444] block">============= // END OF FILE // =============</p>
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}
