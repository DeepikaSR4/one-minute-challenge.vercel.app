'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Target, AlertTriangle, User, CheckCircle2 } from 'lucide-react'
import AudioRecorder from '@/components/ui/AudioRecorder'
import { useAuth } from '@/lib/firebase/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'

export default function DayPage() {
    const params = useParams()
    const dayNumber = parseInt(params.day as string, 10)
    const router = useRouter()
    const { user, loading } = useAuth()
    const [scenario, setScenario] = useState<any>(null)
    const [attempts, setAttempts] = useState<any[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        if (!loading && !user) router.replace('/login')
    }, [user, loading, router])

    useEffect(() => {
        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
            router.replace('/dashboard')
            return
        }
        if (!user) return

        async function load() {
            const profileSnap = await getDoc(doc(db, 'users', user!.uid))
            const startDateStr = profileSnap.data()?.challenge_start_date
            if (!startDateStr) { router.replace('/dashboard'); return }

            const diffDays = Math.floor(Math.abs(Date.now() - new Date(startDateStr).getTime()) / 86400000)
            if (dayNumber > diffDays + 1) { router.replace('/dashboard'); return }

            // Fetch scenario
            const q = query(collection(db, 'scenarios'), where('day_number', '==', dayNumber), limit(1))
            const snap = await getDocs(q)
            setScenario(snap.empty ? {
                title: 'Daily Scenario',
                situation: 'You are on a weekly sync call and need to provide an update on the project.',
                role: 'Project Manager',
                objective: 'Clearly state what was accomplished last week and identify one blocker.',
                constraint_text: 'Do not use filler words like "um" or "like".',
                time_limit: 90
            } : snap.docs[0].data())

            // Fetch ALL attempts for this day, newest first
            const recSnap = await getDocs(
                query(collection(db, 'recordings'), where('user_id', '==', user!.uid), where('day_number', '==', dayNumber))
            )
            const recs = recSnap.docs
                .map(d => ({ ...d.data(), id: d.id }))
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setAttempts(recs)

            setDataLoading(false)
        }
        load()
    }, [user, dayNumber, router])

    if (loading || dataLoading || !scenario) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                    <h1 className="text-xl font-display font-bold neon-text-blue">Day {dayNumber}</h1>
                    <p className="text-2xl font-display font-bold">{scenario.title}</p>
                </div>
            </div>

            {/* Previous attempts */}
            {attempts.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                        {attempts.length === 1 ? 'Your Attempt' : `Your ${attempts.length} Attempts`}
                    </p>
                    {attempts.map((rec, i) => (
                        <div key={rec.id} className="flex items-center justify-between p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Attempt {attempts.length - i}
                                        <span className="ml-2 text-neon-green font-bold">{rec.overall_score}/50</span>
                                    </p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        Clarity {rec.clarity_score} · Confidence {rec.confidence_score} · Conciseness {rec.conciseness_score}
                                        {rec.created_at && ` · ${new Date(rec.created_at).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/day/${dayNumber}/feedback?id=${rec.id}`}
                                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-neon-green/30 text-neon-green hover:bg-neon-green/10 transition-colors"
                            >
                                View →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Scenario card */}
            <div className="glass p-5 md:p-8 rounded-2xl border-white/10 space-y-5 break-words">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> Your Role
                    </h3>
                    <p className="text-base sm:text-lg font-medium">{scenario.role}</p>
                </div>
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">Situation</h3>
                    <p className="text-base sm:text-lg leading-relaxed text-white/90">{scenario.situation}</p>
                </div>
                <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neon-blue mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Objective
                    </h3>
                    <p className="text-base sm:text-lg text-white font-medium">{scenario.objective}</p>
                </div>
                {scenario.constraint_text && (
                    <div className="bg-neon-violet/5 border border-neon-violet/20 rounded-xl p-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neon-violet mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Constraint
                        </h3>
                        <p className="text-base sm:text-lg text-white font-medium">{scenario.constraint_text}</p>
                    </div>
                )}
                <div className="flex items-center gap-2 text-white/50 text-sm font-semibold uppercase tracking-widest pt-4">
                    <Clock className="w-4 h-4" /> Time Limit: {scenario.time_limit} Seconds
                </div>
            </div>

            {/* Recorder */}
            <div className="mt-2">
                {attempts.length > 0 && (
                    <p className="text-xs text-white/40 text-center mb-3">Want to try again? Record a new attempt below.</p>
                )}
                <AudioRecorder dayNumber={dayNumber} timeLimit={scenario.time_limit} />
            </div>
        </div>
    )
}
