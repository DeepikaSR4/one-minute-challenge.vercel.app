import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp, RefreshCcw } from 'lucide-react'

export default async function FeedbackPage({
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

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch the recording/feedback from the DB
    const { data: recording } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_number', dayNumber)
        .single()

    // NOTE: For the sake of the demo UI, if there's no actual recording in the DB 
    // (because Edge functions aren't fully deployed yet), we will inject a dummy completed state.
    const r = recording || {
        clarity_score: 8,
        structure_score: 7,
        confidence_score: 6,
        tone_score: 9,
        conciseness_score: 7,
        overall_score: 37,
        filler_count: 4,
        feedback_summary: {
            what_you_did_well: [
                "You immediately addressed the situation without hesitating.",
                "Your tone was professional and not overly defensive."
            ],
            improvement_areas: [
                "You used 'like' and 'um' when transitioning between points.",
                "The conclusion could have been stronger and more action-oriented."
            ],
            missed_objective_check: {
                addressed_situation: true,
                offered_solution: true,
                followed_constraint: false
            },
            suggested_rewrite: "Hi team, last week we finalized the Q3 roadmap and resolved the database migration. However, we are currently blocked on the API integration due to missing staging credentials. I will need Ops to provide those by EOD to stay on track."
        }
    }

    const feedback = r.feedback_summary as any;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto w-full pb-20">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                    <h1 className="text-xl font-display font-bold text-white/60">Day {dayNumber} Feedback</h1>
                    <p className="text-3xl font-display font-bold"><span className="neon-text-blue">Analysis Complete</span></p>
                </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="md:col-span-2 glass p-6 rounded-2xl border-neon-blue/30 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                    <span className="text-5xl font-display font-bold neon-text-blue">{r.overall_score}<span className="text-2xl text-white/40">/50</span></span>
                    <span className="text-sm font-bold uppercase tracking-widest text-white/60 mt-2">Overall Score</span>
                </div>

                <div className="col-span-1 glass p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-2xl font-bold">{r.clarity_score}/10</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Clarity</span>
                </div>
                <div className="col-span-1 glass p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-2xl font-bold">{r.structure_score}/10</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Structure</span>
                </div>
                <div className="col-span-1 glass p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-2xl font-bold">{r.confidence_score}/10</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Confidence</span>
                </div>
                <div className="col-span-1 glass p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-2xl font-bold">{r.conciseness_score}/10</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Concise</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
                {/* Positives */}
                <div className="glass p-6 rounded-2xl border-neon-green/20">
                    <h3 className="text-lg font-bold font-display flex items-center gap-2 mb-4 text-neon-green">
                        <TrendingUp className="w-5 h-5" /> What You Did Well
                    </h3>
                    <ul className="space-y-3">
                        {feedback.what_you_did_well.map((item: string, i: number) => (
                            <li key={i} className="flex gap-3 text-white/80">
                                <CheckCircle2 className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="glass p-6 rounded-2xl border-neon-violet/20">
                    <h3 className="text-lg font-bold font-display flex items-center gap-2 mb-4 text-neon-violet">
                        <RefreshCcw className="w-5 h-5" /> Areas to Improve
                    </h3>
                    <ul className="space-y-3">
                        {feedback.improvement_areas.map((item: string, i: number) => (
                            <li key={i} className="flex gap-3 text-white/80">
                                <div className="w-2 h-2 rounded-full bg-neon-violet shrink-0 mt-2" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Constraints Check */}
            <div className="glass p-6 rounded-2xl mt-4">
                <h3 className="text-lg font-bold font-display mb-4">Objective Check</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                        {feedback.missed_objective_check.addressed_situation ? <CheckCircle2 className="w-4 h-4 text-neon-green" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-sm font-medium">Addressed Situation</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                        {feedback.missed_objective_check.offered_solution ? <CheckCircle2 className="w-4 h-4 text-neon-green" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-sm font-medium">Offered Solution</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                        {feedback.missed_objective_check.followed_constraint ? <CheckCircle2 className="w-4 h-4 text-neon-green" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-sm font-medium">Followed Constraint</span>
                    </div>
                </div>
            </div>

            {/* Suggested Rewrite */}
            <div className="relative glass p-8 rounded-2xl mt-4 overflow-hidden border-neon-blue/30 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-[50px] -z-10" />
                <h3 className="text-xl font-bold font-display mb-4 neon-text-blue">The 30-Second Perfect Pitch</h3>
                <p className="text-lg leading-relaxed text-white">"{feedback.suggested_rewrite}"</p>
            </div>

            <div className="flex justify-center mt-8">
                <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    )
}
