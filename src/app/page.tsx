'use client'
import Link from "next/link";
import { ArrowRight, Mic, PlayCircle, Brain } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function Home() {
  const { user } = useAuth()
  const ctaHref = user ? '/dashboard' : '/login'

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-5xl z-50">
        <div className="relative glass rounded-2xl px-6 py-4 flex items-center justify-between border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold tracking-tight">
              One<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet">Minute</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50 uppercase tracking-widest ml-1">
              Challenge
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href={ctaHref}
              className="relative group px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold transition-all hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-violet/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">{user ? 'Go to Dashboard' : 'Start Sprint'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-4 relative pt-40">

        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[35vw] h-[35vw] bg-neon-blue/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[30vw] h-[30vw] bg-neon-violet/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold text-neon-green border-neon-green/30 uppercase tracking-widest">
            30 Days to Sound Confident
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">
            Stop freezing when<br />it's your turn to speak.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet">
              Train how you express yourself.
            </span>
          </h1>

          <p className="text-xl text-white/60 font-sans max-w-2xl mx-auto">
            You already know English. But under pressure, your thoughts get messy, you ramble, or you hesitate.
            OneMinute helps you practice speaking clearly — in real-world situations — one minute at a time.
          </p>

          <div className="pt-6 flex flex-col items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold text-lg transition-transform hover:scale-105"
            >
              {user ? 'Go to Dashboard' : 'Start 30-Day Sprint'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-white/40">1 minute a day. No fluff.</p>
          </div>

          {/* Subtle language note */}
          <p className="text-xs text-white/25 mt-2">Currently available in English. More languages coming soon.</p>
        </div>

        {/* Problem Section */}
        <section className="max-w-4xl mx-auto mt-24 sm:mt-32 space-y-8 sm:space-y-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">This is what usually happens:</h2>

          <div className="space-y-3 text-white/60 text-base sm:text-lg text-left max-w-xl mx-auto">
            <p>• You know what you want to say — but it doesn't come out right.</p>
            <p>• You start speaking — and lose structure halfway.</p>
            <p>• You use filler words to buy time.</p>
            <p>• You finish — and wish you said it better.</p>
          </div>

          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            The problem isn't your vocabulary.<br />
            It's that you've never trained how to think and speak under pressure.
          </p>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto mt-32 mb-20 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              <PlayCircle />
            </div>
            <h3 className="text-xl font-bold font-display">Daily Scenario</h3>
            <p className="text-white/60">
              Every day, you get a realistic speaking situation — from introducing yourself to handling difficult conversations.
              Not theory. Real pressure.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon-violet/10 flex items-center justify-center text-neon-violet">
              <Mic />
            </div>
            <h3 className="text-xl font-bold font-display">90 Seconds to Speak</h3>
            <p className="text-white/60">
              No editing. No rewriting. Just speak like you would in real life.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green">
              <Brain />
            </div>
            <h3 className="text-xl font-bold font-display">AI Feedback Breakdown</h3>
            <p className="text-white/60">
              Get scored on clarity, structure, confidence, and conciseness.
              Plus a sharper 30-second rewrite so you know exactly how to improve.
            </p>
          </div>

        </section>

      </main>

      <footer className="py-8 text-center border-t border-white/5">
        <p className="text-sm font-display font-bold text-white/80">OneMinute</p>
        <p className="text-xs text-white/30 mt-1">A product by SansAI ❤️</p>
      </footer>
    </div>
  );
}