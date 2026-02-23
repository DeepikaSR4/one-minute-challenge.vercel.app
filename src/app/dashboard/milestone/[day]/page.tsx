'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, TrendingUp, MicOff, Zap } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/lib/firebase/AuthProvider'

export default function MilestonePage() {
    const params = useParams()
    const dayNumber = parseInt(params.day as string, 10)
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) router.replace('/login')
    }, [user, loading, router])

    useEffect(() => {
        if (!loading && ![10, 20, 30].includes(dayNumber)) router.replace('/dashboard')
    }, [dayNumber, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const stats = {
        avg_score: 41.5, improvement_percent: 28, filler_reduction: 45,
        strongest_skill: 'Clarity', weakest_skill: 'Conciseness',
        badge_text: "You're 28% clearer than Day 1."
    }
    const isFinal = dayNumber === 30

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-display font-bold text-white/60">Milestone</h1>
                        <p className="text-3xl font-display font-bold"><span className="neon-text-blue">Day {dayNumber} Review</span></p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold">
                    <Share2 className="w-4 h-4" /> Share
                </button>
            </div>

            <div className="relative glass p-8 sm:p-12 rounded-3xl border-neon-blue/40 shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-blue/20 rounded-full blur-[80px] -z-10" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-neon-violet/20 rounded-full blur-[80px] -z-10" />

                <div className="text-center space-y-2 mb-10">
                    <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tighter">{stats.badge_text}</h2>
                    <p className="text-xl text-white/60 font-sans mt-4">
                        <Logo className="mx-auto" /> {dayNumber}-Day Progress Report
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-6 rounded-2xl flex flex-col gap-2">
                        <TrendingUp className="w-6 h-6 text-neon-green" />
                        <span className="text-3xl font-display font-bold text-white">{stats.improvement_percent}%</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">Score Boost</span>
                    </div>
                    <div className="glass p-6 rounded-2xl flex flex-col gap-2">
                        <MicOff className="w-6 h-6 text-neon-blue" />
                        <span className="text-3xl font-display font-bold text-white">{stats.filler_reduction}%</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">Less "Ums" & "Likes"</span>
                    </div>
                    <div className="glass p-6 rounded-2xl flex flex-col gap-2">
                        <Zap className="w-6 h-6 text-neon-violet" />
                        <span className="text-2xl font-display font-bold text-white">{stats.strongest_skill}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">Strongest Skill</span>
                    </div>
                    <div className="glass p-6 rounded-2xl flex flex-col gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                        <span className="text-xl font-display font-bold text-white mt-1">{stats.weakest_skill}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">Needs Work</span>
                    </div>
                </div>

                {isFinal && (
                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-neon-blue text-neon-blue font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                            Call-Ready Certified
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-4">
                <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                    {isFinal ? "View Final Results" : "Continue Challenge"}
                </Link>
            </div>
        </div>
    )
}
