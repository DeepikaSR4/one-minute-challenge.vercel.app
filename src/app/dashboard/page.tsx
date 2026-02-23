'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/firebase/AuthProvider'
import { Lock, Play } from 'lucide-react'

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [startDateStr, setStartDateStr] = useState<string | null | undefined>(undefined)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        if (!loading && !user) router.replace('/login')
    }, [user, loading, router])

    useEffect(() => {
        if (!user) return
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            setStartDateStr(snap.data()?.challenge_start_date ?? null)
        })
    }, [user])

    async function startChallenge() {
        if (!user) return
        setStarting(true)
        const date = new Date().toISOString()
        await setDoc(doc(db, 'users', user.uid), { challenge_start_date: date }, { merge: true })
        setStartDateStr(date)
        setStarting(false)
    }

    if (loading || startDateStr === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!startDateStr) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-neon-blue/20 flex items-center justify-center mb-4 neon-border-violet">
                    <Play className="w-12 h-12 text-neon-blue ml-2" />
                </div>
                <h1 className="text-4xl font-display font-bold">Ready to sound like a leader?</h1>
                <p className="text-white/60 max-w-md">
                    Once you start, you'll get one scenario per day for 30 days. You cannot skip ahead. Missing days will break your streak.
                </p>
                <button
                    onClick={startChallenge}
                    disabled={starting}
                    className="mt-4 bg-white text-black font-bold text-lg px-8 py-4 rounded-xl hover:scale-105 transition-transform"
                >
                    {starting ? 'Starting...' : 'Start 30-Day Sprint'}
                </button>
            </div>
        )
    }

    const startDate = new Date(startDateStr)
    const now = new Date()
    const diffDays = Math.floor(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentDay = diffDays + 1
    const days = Array.from({ length: 30 }, (_, i) => i + 1)

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold">Your Challenge</h1>
                <p className="text-white/60 mt-1">Day {currentDay} of 30</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {days.map((day) => {
                    const isUnlocked = day <= currentDay
                    const isToday = day === currentDay

                    if (!isUnlocked) {
                        return (
                            <div key={day} className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 aspect-square opacity-50 relative overflow-hidden">
                                <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-white/40" />
                                </div>
                                <span className="font-display font-bold text-xl text-white/40">Day {day}</span>
                            </div>
                        )
                    }

                    return (
                        <Link
                            href={`/dashboard/day/${day}`}
                            key={day}
                            className={`glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 aspect-square transition-all hover:scale-105 ${isToday ? 'border-neon-blue/50 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-white/10 hover:border-white/30'}`}
                        >
                            <span className={`font-display font-bold text-2xl ${isToday ? 'neon-text-blue' : 'text-white'}`}>Day {day}</span>
                            {isToday && <span className="text-xs font-semibold text-neon-blue uppercase tracking-wider">Today</span>}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
