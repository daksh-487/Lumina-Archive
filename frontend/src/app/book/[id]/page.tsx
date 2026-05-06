'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ── Same fallback catalogue as the homepage ───────────────────────────────────
const FALLBACK_BOOKS: Record<string, any> = {
  'fallback-1':  { id: 'fallback-1',  title: 'The Silent Cipher',       author: 'Elena Marchetti',    genre: 'Mystery',     rating: 4.5, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian1/400/600',  description: 'A cryptographer discovers a hidden message in a centuries-old manuscript that leads her into a web of deception and danger spanning three continents. What begins as an academic exercise quickly becomes a race against a shadowy organisation determined to keep the cipher\'s secrets buried forever. Rich with historical detail and breathtaking twists, this novel redefines the modern thriller.', summary: 'A page-turning thriller that blends cryptography, history, and international espionage into a relentlessly compelling narrative.' },
  'fallback-2':  { id: 'fallback-2',  title: 'Echoes of Tomorrow',      author: 'James Whitfield',    genre: 'Sci-Fi',      rating: 4.2, sentiment: 'Positive', image_url: 'https://picsum.photos/seed/obsidian2/400/600',  description: 'In a future where memories can be traded like commodities, one man discovers that his past—long suppressed by a corporate memory broker—holds the key to saving humanity from an extinction-level event. A deeply human story wrapped in high-concept science fiction.', summary: 'A moving exploration of identity, capitalism, and what it means to truly remember who you are.' },
  'fallback-3':  { id: 'fallback-3',  title: 'The Obsidian Gate',       author: 'Lyra Okonkwo',       genre: 'Fantasy',     rating: 4.8, sentiment: 'Positive', image_url: 'https://picsum.photos/seed/obsidian3/400/600',  description: 'A young scholar finds a doorway hidden inside the university library—a gateway to a realm of shadow and light where ancient powers await the worthy. But passage through the Gate comes at a cost: you leave a piece of yourself behind each time.', summary: 'An extraordinary debut fantasy with lush world-building and a heroine who earns every victory.' },
  'fallback-4':  { id: 'fallback-4',  title: 'Beneath the Iron Sky',    author: 'Victor Harlan',      genre: 'History',     rating: 3.9, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian4/400/600',  description: 'A sweeping historical epic set across the industrial revolution, following three families—a mill owner, a seamstress, and a radical journalist—whose fates intertwine across decades of social upheaval and transformation.', summary: 'A meticulously researched portrait of an era that shaped the modern world, told through intimate human stories.' },
  'fallback-5':  { id: 'fallback-5',  title: 'Fractured Light',         author: 'Saira Naveena',      genre: 'Literature',  rating: 4.6, sentiment: 'Positive', image_url: 'https://picsum.photos/seed/obsidian5/400/600',  description: 'A luminous novel exploring the bonds of family across three generations and two continents, told entirely through letters never sent. Each unsent word is a world of longing, pride, and the stubborn love that outlasts distance.', summary: 'Tender, precise, and quietly devastating — one of the most original epistolary novels in recent memory.' },
  'fallback-6':  { id: 'fallback-6',  title: 'The Algorithm of Souls',  author: 'Nikolai Petrov',     genre: 'Sci-Fi',      rating: 4.1, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian6/400/600',  description: 'When an AI music system begins composing pieces that move audiences to uncontrollable tears, its creator is forced to ask: is the machine feeling something—or merely simulating it? And does the difference matter?', summary: 'A philosophical sci-fi novel that asks urgent questions about consciousness, creativity, and what we owe to the minds we build.' },
  'fallback-7':  { id: 'fallback-7',  title: 'Midnight Cartography',    author: 'Camille Durand',     genre: 'Mystery',     rating: 4.3, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian7/400/600',  description: 'A retired French mapmaker living quietly in Lisbon is drawn back into the world of cold-war espionage when a map she drew forty years ago resurfaces—annotated with coordinates no human should know. Elegant, atmospheric, and tightly plotted.', summary: 'A slow-burn spy mystery that rewards patience with one of fiction\'s most satisfying final revelations.' },
  'fallback-8':  { id: 'fallback-8',  title: 'The Ember Codex',         author: 'Rhiannon Blackthorn', genre: 'Fantasy',    rating: 4.7, sentiment: 'Positive', image_url: 'https://picsum.photos/seed/obsidian8/400/600',  description: 'Fire mages have guarded the Ember Codex for a thousand years. When its most dangerous page is stolen by an entity that should not exist, the last apprentice must cross a dying empire to retrieve it before the next age of darkness begins.', summary: 'Epic in scope yet intimate in character — fantasy world-building at its most confident and immersive.' },
  'fallback-9':  { id: 'fallback-9',  title: 'Still Water Runs',        author: 'Aiden Cross',        genre: 'Literature',  rating: 4.0, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian9/400/600',  description: 'A meditative, lyrical exploration of grief and slow renewal set across the seasons in the American Pacific Northwest. After his wife\'s sudden death, a river ecologist retreats to the wilderness and discovers solace in the rhythms of the natural world.', summary: 'Quiet and profound — a novel that moves like its title: deep, purposeful, and impossible to rush.' },
  'fallback-10': { id: 'fallback-10', title: 'Axioms of the Void',      author: 'Dr. Hana Kim',       genre: 'Non-Fiction', rating: 4.4, sentiment: 'Positive', image_url: 'https://picsum.photos/seed/obsidian10/400/600', description: 'A theoretical physicist presents a groundbreaking new framework for understanding the relationship between dark matter, quantum consciousness, and the arrow of time. Written for the curious non-specialist without sacrificing intellectual rigour.', summary: 'Bold, clear, and exhilarating — science writing that makes you feel the universe is bigger and stranger than you imagined.' },
  'fallback-11': { id: 'fallback-11', title: 'The Vermillion Thread',   author: 'Isabelle Chen',      genre: 'History',     rating: 4.3, sentiment: 'Neutral',  image_url: 'https://picsum.photos/seed/obsidian11/400/600', description: 'Tracing the ancient Silk Road through the eyes of a merchant woman in the Tang Dynasty, this novel illuminates forgotten trade routes, cross-cultural exchange, and the quiet revolutions that women have always carried out in the margins of recorded history.', summary: 'A richly imagined historical novel that brings a silenced world to vivid, textured life.' },
  'fallback-12': { id: 'fallback-12', title: 'Neon Requiem',            author: 'Marcus Steele',      genre: 'Sci-Fi',      rating: 4.5, sentiment: 'Negative', image_url: 'https://picsum.photos/seed/obsidian12/400/600', description: 'In a rain-soaked megacity where memory is currency and identity is malleable, a detective with illegal cybernetic implants hunts a serial killer who erases victims from existence — leaving not bodies but absences. A masterwork of neo-noir science fiction.', summary: 'Brutal, beautiful, and relentlessly inventive — cyberpunk fiction that earns its darkness.' },
};

export default function BookDetail() {
  const { id } = useParams();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // RAG inline state
  const [ragQuery, setRagQuery] = useState('');
  const [ragHistory, setRagHistory] = useState<any[]>([]);
  const [ragLoading, setRagLoading] = useState(false);
  const ragScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If this is a fallback book, load it directly — no API needed
    if (bookId && FALLBACK_BOOKS[bookId]) {
      setBook(FALLBACK_BOOKS[bookId]);
      setLoading(false);
      return;
    }

    // Otherwise try the live backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/books/${bookId}/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => {
        setOffline(true);
        setLoading(false);
      });
  }, [bookId]);

  useEffect(() => {
    if (ragScrollRef.current) {
      ragScrollRef.current.scrollTop = ragScrollRef.current.scrollHeight;
    }
  }, [ragHistory, ragLoading]);

  const handleRagSend = async (e: any) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    const userMsg = { role: 'user', content: ragQuery };
    setRagHistory(prev => [...prev, userMsg]);
    setRagQuery('');
    setRagLoading(true);

    // If book is a fallback, respond with a smart canned response based on the book data
    if (bookId && FALLBACK_BOOKS[bookId]) {
      await new Promise(r => setTimeout(r, 800)); // simulate thinking
      const b = FALLBACK_BOOKS[bookId];
      const answers: Record<string, string> = {
        'what is this book about': b.description,
        'what themes': `"${b.title}" explores themes of ${b.genre === 'Mystery' ? 'deception, truth, and the cost of secrets' : b.genre === 'Sci-Fi' ? 'technology, identity, and the human condition' : b.genre === 'Fantasy' ? 'power, sacrifice, and the unknown' : b.genre === 'Literature' ? 'family, memory, and the passage of time' : b.genre === 'History' ? 'social change, resilience, and legacy' : 'knowledge, discovery, and meaning'}.`,
        'who would enjoy': `Readers who enjoy ${b.genre} will love "${b.title}". It's especially suited for those who appreciate ${b.sentiment === 'Positive' ? 'uplifting' : b.sentiment === 'Negative' ? 'dark and gritty' : 'nuanced and balanced'} storytelling.`,
      };
      const q = ragQuery.toLowerCase();
      const matched = Object.keys(answers).find(k => q.includes(k));
      const reply = matched ? answers[matched] : b.summary || `"${b.title}" by ${b.author} is a ${b.genre} book rated ${b.rating}/5. ${b.description}`;
      setRagHistory(prev => [...prev, { role: 'bot', content: reply }]);
      setRagLoading(false);
      return;
    }

    // Try live backend RAG
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const contextualQuestion = `Regarding the book "${book?.title}" by ${book?.author}: ${ragQuery}`;
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: contextualQuestion, book_id: bookId })
      });
      const data = await response.json();
      setRagHistory(prev => [...prev, {
        role: 'bot',
        content: data.answer || "Could not generate insights for this query."
      }]);
    } catch {
      setRagHistory(prev => [...prev, {
        role: 'bot',
        content: 'The intelligence engine is currently offline. Please check back when the backend server is running.'
      }]);
    } finally {
      setRagLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm uppercase">
        Loading Archive Data...
      </main>
    );
  }

  // Backend offline & not a fallback book
  if (offline || !book) {
    return (
      <main className="min-h-screen bg-black text-[#EDEDED] font-sans flex flex-col items-center justify-center gap-6 px-8">
        <div className="w-16 h-16 border border-[#333] rounded-2xl flex items-center justify-center bg-[#0A0A0A] mb-2">
          <svg className="w-8 h-8 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-light text-white tracking-tight">Backend Offline</h2>
        <p className="text-[#666] text-sm max-w-md text-center leading-relaxed">
          This book lives in the live database. The backend server is currently unreachable — the archive showcases {Object.keys(FALLBACK_BOOKS).length} sample titles while offline.
        </p>
        <Link href="/" className="mt-4 border border-[#333] hover:border-white hover:bg-white hover:text-black transition-all px-6 py-3 text-sm uppercase tracking-wide font-medium">
          ← Return to Archive
        </Link>
      </main>
    );
  }

  const isFallback = bookId && FALLBACK_BOOKS[bookId as string];

  return (
    <main className="min-h-screen bg-black text-[#EDEDED] font-sans selection:bg-[#EDEDED] selection:text-black">
      <div className="max-w-7xl mx-auto border-x border-[#222] min-h-screen relative">
        <nav className="border-b border-[#222] px-8 py-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur z-20">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-[#A0A0A0] transition-colors flex items-center gap-4">
                <span className="w-4 h-px bg-white"></span> Back
            </Link>
            <span className="font-mono text-xs text-[#555]">
              {isFallback ? 'SHOWCASE / SAMPLE' : `ARCHIVE ID / ${String(book.id).padStart(4, '0')}`}
            </span>
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
                            <p className="text-xs text-[#666]">
                              {isFallback ? 'Answering from book metadata (showcase mode)' : 'Powered by RAG — query insights specific to this document'}
                            </p>
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
                            <span className="text-sm uppercase tracking-wider">{(book.rating || 0).toFixed(1)} / 5.0</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#555] mb-6 border-b border-[#222] pb-2">Extracted Insight</h3>
                    <div className="bg-[#0A0A0A] border border-[#222] p-6">
                        <p className="text-sm font-mono leading-relaxed text-[#A0A0A0]">
                            {book.summary || 'No summary available for this title.'}
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
                      <h2 className="font-mono text-xs text-white uppercase tracking-widest">RAW SOURCE TEXT / {isFallback ? 'SAMPLE' : String(book.id).padStart(4, '0')}</h2>
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


