'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('[Lumina] Fetching books from:', `${API_URL}/api/books/`);
    fetch(`${API_URL}/api/books/`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json();
      })
      .then(data => {
          console.log('[Lumina] Books fetched:', data.length, 'books');
          setBooks(Array.isArray(data) ? data : []);
          setLoading(false);
      })
      .catch(err => {
          console.error("[Lumina] Failed to fetch books:", err.message);
          setBooks([]);
          setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-[#EDEDED] px-8 py-20 font-sans selection:bg-[#EDEDED] selection:text-black">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-24 border-b border-[#333] pb-8 pt-10">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white mb-2 uppercase">
              The Obsidian Assembly
            </h1>
            <p className="text-sm text-[#888] uppercase tracking-widest">Document Intelligence Archive / 01</p>
          </div>
          <Link href="/chat" className="text-sm font-medium border border-[#333] hover:border-white hover:bg-white hover:text-black transition-all px-5 py-2 uppercase tracking-wide">
             Query Archive
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="animate-pulse bg-[#111] h-80 rounded-none border border-[#222]"></div>
            ))}
          </div>
        ) : (
          books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 border border-[#333] rounded-2xl flex items-center justify-center mb-8 bg-[#0A0A0A]">
                <svg className="w-8 h-8 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-2xl font-light mb-3 text-white tracking-tight">Archive Empty</h2>
              <p className="text-[#666] text-sm max-w-md leading-relaxed">
                The backend server is offline or no books have been uploaded yet. Please ensure the backend is running and accessible.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {books.map((book: any) => (
              <Link href={`/book/${book.id}`} key={book.id} className="group flex flex-col h-full cursor-pointer">
                <div className="relative w-full aspect-[2/3] bg-[#0A0A0A] border border-[#222] overflow-hidden mb-5 transition-colors group-hover:border-[#555]">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#333] font-mono text-xs uppercase">No Visual</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-start">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#666] border border-[#333] px-2 py-0.5">
                            {book.genre || 'Literature'}
                        </span>
                        <div className="flex text-[#888] text-[10px] font-mono mt-1">
                            {(book.rating || 0).toFixed(1)} RTG
                        </div>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1.5 leading-snug group-hover:underline decoration-1 underline-offset-4">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[#777]">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
          )
        )}
      </div>
    </main>
  );
}
