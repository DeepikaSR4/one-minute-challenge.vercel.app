import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Target, AlertTriangle, User } from 'lucide-react'
import AudioRecorder from '@/components/ui/AudioRecorder'

export default async function DayPage({
    params,
}: {
    params: Promise<{ day: string }>
}) {
    const { day } = await params
    const dayNumber = parseInt(day, 10)

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
        redirect('/dashboard')
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile to check eligibility
    const { data: profile } = await supabase
        .from('users')
        .select('challenge_start_date')
        .eq('id', user.id)
        .single()

    const startDateStr = profile?.challenge_start_date

    if (!startDateStr) {
        redirect('/dashboard') // Challenge not started
    }

    const startDate = new Date(startDateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const currentDay = diffDays + 1

    if (dayNumber > currentDay) {
        redirect('/dashboard') // Trying to skip ahead
    }

    // Fetch the scenario
    const { data: scenario, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('day_number', dayNumber)
        .single()

    // For development, if scenario is missing, we use a placeholder instead of breaking
    const s = scenario || {
        id: 'placeholder',
        day_number: dayNumber,
        title: 'Development Placeholder Scenario',
        situation: 'You are on a weekly sync call and need to provide an update on the project.',
        role: 'Project Manager',
        objective: 'Clearly state what was accomplished last week and identify one blocker.',
        constraint_text: 'Do not use filler words like "um" or "like".',
        time_limit: 90
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                    <h1 className="text-xl font-display font-bold neon-text-blue">Day {dayNumber}</h1>
                    <p className="text-2xl font-display font-bold">{s.title}</p>
                </div>
            </div>

            <div className="glass p-6 md:p-8 rounded-2xl border-white/10 space-y-6 break-words">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> Your Role
                    </h3>
                    <p className="text-lg font-medium">{s.role}</p>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">
                        Situation
                    </h3>
                    <p className="text-lg leading-relaxed text-white/90">{s.situation}</p>
                </div>

                <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neon-blue mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Objective
                    </h3>
                    <p className="text-lg text-white font-medium">{s.objective}</p>
                </div>

                {s.constraint_text && (
                    <div className="bg-neon-violet/5 border border-neon-violet/20 rounded-xl p-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neon-violet mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Constraint
                        </h3>
                        <p className="text-lg text-white font-medium">{s.constraint_text}</p>
                    </div>
                )}

                <div className="flex items-center gap-2 text-white/50 text-sm font-semibold uppercase tracking-widest pt-4">
                    <Clock className="w-4 h-4" /> Time Limit: {s.time_limit} Seconds
                </div>
            </div>

            <div className="mt-4">
                <AudioRecorder dayNumber={dayNumber} timeLimit={s.time_limit} />
            </div>
        </div>
    )
}
