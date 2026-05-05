'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/books/')
      .then(res => res.json())
      .then(data => {
          setBooks(data);
          setLoading(false);
      })
      .catch(err => {
          console.error("Failed to fetch books", err);
          // Fallback data if backend is offline
          setBooks([
              { id: 1, title: 'Backend Offline', author: 'Test Author', rating: 4.5, genre: 'Test' }
          ]);
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
                            {book.rating.toFixed(1)} RTG
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
        )}
      </div>
    </main>
  );
}
