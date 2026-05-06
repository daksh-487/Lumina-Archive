'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Fallback books shown when the backend is offline ──────────────────────────
const FALLBACK_BOOKS = [
  {
    id: 'fallback-1',
    title: 'The Silent Cipher',
    author: 'Elena Marchetti',
    genre: 'Mystery',
    rating: 4.5,
    description: 'A cryptographer discovers a hidden message in a centuries-old manuscript that leads her into a web of deception and danger.',
    image_url: 'https://picsum.photos/seed/obsidian1/400/600',
  },
  {
    id: 'fallback-2',
    title: 'Echoes of Tomorrow',
    author: 'James Whitfield',
    genre: 'Sci-Fi',
    rating: 4.2,
    description: 'In a future where memories can be traded, one man discovers his past holds the key to saving humanity.',
    image_url: 'https://picsum.photos/seed/obsidian2/400/600',
  },
  {
    id: 'fallback-3',
    title: 'The Obsidian Gate',
    author: 'Lyra Okonkwo',
    genre: 'Fantasy',
    rating: 4.8,
    description: 'A young scholar finds a doorway to a realm of shadow and light, where ancient powers await the worthy.',
    image_url: 'https://picsum.photos/seed/obsidian3/400/600',
  },
  {
    id: 'fallback-4',
    title: 'Beneath the Iron Sky',
    author: 'Victor Harlan',
    genre: 'History',
    rating: 3.9,
    description: 'A sweeping historical epic set during the industrial revolution, following three families whose fates intertwine.',
    image_url: 'https://picsum.photos/seed/obsidian4/400/600',
  },
  {
    id: 'fallback-5',
    title: 'Fractured Light',
    author: 'Saira Naveena',
    genre: 'Literature',
    rating: 4.6,
    description: 'A luminous novel exploring the bonds of family across continents, told through letters never sent.',
    image_url: 'https://picsum.photos/seed/obsidian5/400/600',
  },
  {
    id: 'fallback-6',
    title: 'The Algorithm of Souls',
    author: 'Nikolai Petrov',
    genre: 'Sci-Fi',
    rating: 4.1,
    description: 'When an AI begins composing music that moves people to tears, its creator questions what it means to feel.',
    image_url: 'https://picsum.photos/seed/obsidian6/400/600',
  },
  {
    id: 'fallback-7',
    title: 'Midnight Cartography',
    author: 'Camille Durand',
    genre: 'Mystery',
    rating: 4.3,
    description: 'A retired mapmaker is drawn back into espionage when a map she drew decades ago resurfaces with impossible accuracy.',
    image_url: 'https://picsum.photos/seed/obsidian7/400/600',
  },
  {
    id: 'fallback-8',
    title: 'The Ember Codex',
    author: 'Rhiannon Blackthorn',
    genre: 'Fantasy',
    rating: 4.7,
    description: 'Fire mages guard a codex of forbidden spells. When one page is stolen, the balance of power shifts forever.',
    image_url: 'https://picsum.photos/seed/obsidian8/400/600',
  },
  {
    id: 'fallback-9',
    title: 'Still Water Runs',
    author: 'Aiden Cross',
    genre: 'Literature',
    rating: 4.0,
    description: 'A meditative exploration of grief and renewal set in the American Pacific Northwest.',
    image_url: 'https://picsum.photos/seed/obsidian9/400/600',
  },
  {
    id: 'fallback-10',
    title: 'Axioms of the Void',
    author: 'Dr. Hana Kim',
    genre: 'Non-Fiction',
    rating: 4.4,
    description: 'A theoretical physicist presents a groundbreaking new framework for understanding dark matter and consciousness.',
    image_url: 'https://picsum.photos/seed/obsidian10/400/600',
  },
  {
    id: 'fallback-11',
    title: 'The Vermillion Thread',
    author: 'Isabelle Chen',
    genre: 'History',
    rating: 4.3,
    description: 'Tracing the Silk Road through the eyes of a merchant woman, this novel illuminates forgotten trade routes and cultures.',
    image_url: 'https://picsum.photos/seed/obsidian11/400/600',
  },
  {
    id: 'fallback-12',
    title: 'Neon Requiem',
    author: 'Marcus Steele',
    genre: 'Sci-Fi',
    rating: 4.5,
    description: 'In a rain-soaked megacity, a detective with cybernetic implants hunts a killer who erases victims from existence.',
    image_url: 'https://picsum.photos/seed/obsidian12/400/600',
  },
];

export default function Home() {
  const [books, setBooks] = useState<any[]>(FALLBACK_BOOKS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

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
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data);
            setIsLive(true);
          }
          // If API returns empty array, keep fallback books
          setLoading(false);
      })
      .catch(err => {
          console.error("[Lumina] Failed to fetch books:", err.message);
          // Keep fallback books — don't clear them
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
          <div className="flex items-center gap-4">
            {!isLive && !loading && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#555] border border-[#222] px-3 py-1.5">
                Showcase Mode
              </span>
            )}
            <Link href="/chat" className="text-sm font-medium border border-[#333] hover:border-white hover:bg-white hover:text-black transition-all px-5 py-2 uppercase tracking-wide">
               Query Archive
            </Link>
          </div>
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
        )}
      </div>
    </main>
  );
}
