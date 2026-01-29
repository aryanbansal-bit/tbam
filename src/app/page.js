'use client';

import { useState } from 'react';
import Image from 'next/image';

import governorImg from '@/app/public/DG.jpeg';
import bannerImg from '@/app/public/Banners.png';
import presidentImg from '@/app/public/PRESIDENT.png';

export default function Page() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setShowLogin(false);
        window.location.reload();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-gray-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#005DAA] shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-1 rounded">
              <span className="text-[#005DAA] font-extrabold text-xs">
                ROTARY
              </span>
            </div>
            <span className="text-white text-xs font-bold tracking-[0.25em] uppercase">
              District 3012
            </span>
          </div>

          <button
            onClick={() => setShowLogin(true)}
            className="text-white border border-white/40 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest hover:bg-white hover:text-[#005DAA] transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto pt-8 pb-16 px-6">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={bannerImg}
              alt="Unite For Good"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Motto */}
          <div className="relative -mt-10 flex justify-center">
            <div className="bg-white px-10 py-5 rounded-xl shadow-lg border-t-4 border-[#F7A81B] text-center">
              <h2 className="text-[#005DAA] text-xl md:text-2xl font-black italic uppercase">
                Service Above Self
              </h2>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-gray-400 font-bold uppercase">
                District 3012
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIGNITARIES */}
      <section className="max-w-6xl mx-auto px-6 -mt-4 mb-20">
        <div className="grid md:grid-cols-2 gap-10">

          {/* PRESIDENT */}
          <div className="group bg-white rounded-2xl p-8 shadow-sm border hover:shadow-xl transition-all flex flex-col items-center">
            <div className="relative w-44 h-44 mb-6 rounded-2xl overflow-hidden">
              <Image
                src={presidentImg}
                alt="Francesco Arezzo"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[#005DAA] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              President, RI 2025–26
            </span>
            <h3 className="text-2xl font-black">
              Francesco Arezzo
            </h3>
            <div className="w-8 h-1 bg-[#005DAA] mt-4 opacity-30" />
          </div>

          {/* GOVERNOR — FACE SAFE */}
          <div className="group bg-white rounded-2xl p-8 shadow-sm border hover:shadow-xl transition-all flex flex-col items-center">
            <div className="relative w-44 h-44 mb-6 rounded-2xl overflow-hidden">
              <Image
                src={governorImg}
                alt="Amita Anil Mohindru"
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[#F7A81B] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              District Governor 2025–26
            </span>
            <h3 className="text-2xl font-black">
              Amita Anil Mohindru
            </h3>
            <div className="w-8 h-1 bg-[#F7A81B] mt-4 opacity-30" />
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] py-8 text-center">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest">
          © 2026 Rotary District 3012
        </p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#005DAA]/40 backdrop-blur"
            onClick={() => setShowLogin(false)}
          />
          <div className="relative bg-white rounded-2xl p-10 max-w-sm w-full shadow-2xl border-t-8 border-[#F7A81B]">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-center text-2xl font-black text-[#005DAA] uppercase">
              Admin Access
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <input
                placeholder="Username"
                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#005DAA] outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#005DAA] outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-[10px] font-bold text-center uppercase">
                  {error}
                </p>
              )}
              <button
                disabled={isLoading}
                className="w-full py-4 bg-[#005DAA] text-white font-black rounded-xl uppercase tracking-widest hover:bg-[#004a87] transition"
              >
                {isLoading ? 'Verifying…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
