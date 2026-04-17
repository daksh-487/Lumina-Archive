'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Chat() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query })
      });
      const data = await response.json();
      
      const botMessage = { 
          role: 'bot', 
          content: data.answer || "I couldn't find relevant information to answer that question.",
          citations: data.citations || []
      };
      setHistory(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, {role: 'bot', content: 'Connection failed. The backend server might be offline.'}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] text-[#E0E0E0] font-sans h-screen flex flex-col selection:bg-white selection:text-black">
      <nav className="px-8 py-6 flex justify-between items-center shrink-0 border-b border-[#1A1A1A]">
        <Link href="/" className="text-sm font-medium tracking-wide text-white hover:text-[#A0A0A0] transition-colors flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
        </Link>
        <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-[#888] uppercase tracking-widest font-mono">Archive Access: Active</span>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-12 lg:px-8 mx-auto w-full max-w-4xl flex flex-col gap-10" ref={scrollRef}>
        {history.length === 0 && (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-70">
             <div className="w-16 h-16 border border-[#333] rounded-2xl flex items-center justify-center mb-8 bg-[#0A0A0A]">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h2 className="text-3xl font-light mb-4 text-white tracking-tight">Intelligence Query</h2>
             <p className="text-[#888] text-base leading-relaxed">
                Ask a question against the library. The intelligence engine will scan the vector database, compile relevant literature chunks, and synthesize an accurate answer.
             </p>
          </div>
        )}
        
        {history.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className="shrink-0 mt-1">
                  {msg.role === 'user' ? (
                      <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">U</div>
                  ) : (
                      <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] text-white rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                  )}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                  <p className={`text-lg leading-relaxed whitespace-pre-wrap font-light ${msg.role === 'user' ? 'text-white' : 'text-[#CCCCCC]'}`}>
                      {msg.content}
                  </p>
                  
                  {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-6 w-full">
                          <p className="text-xs text-[#666] mb-3 uppercase tracking-wider font-semibold">Sources Referenced</p>
                          <div className="flex flex-wrap gap-3">
                              {msg.citations.map((c: any, idx: number) => (
                                  <Link href={c.url} key={idx} className="flex flex-col bg-[#0A0A0A] border border-[#222] hover:border-[#555] rounded-xl p-4 transition-colors max-w-sm">
                                      <span className="text-sm font-medium text-white mb-1 truncate">{c.title}</span>
                                      <span className="text-xs text-[#888] line-clamp-2 leading-relaxed">"{c.snippet}"</span>
                                  </Link>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start w-full">
             <div className="max-w-[85%] flex gap-6 flex-row">
                 <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] text-white rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </div>
                 </div>
                 <div className="flex items-center text-[#888] text-sm">
                     Generating synthesis...
                 </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 shrink-0 w-full bg-gradient-to-t from-black via-black to-transparent">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the archive..."
            className="w-full bg-[#0A0A0A] border border-[#222] hover:border-[#444] focus:border-white rounded-2xl py-5 pl-6 pr-20 text-white placeholder-[#666] focus:outline-none transition-all text-base shadow-2xl"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-3 top-3 bottom-3 aspect-square bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
