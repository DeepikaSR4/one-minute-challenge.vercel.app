'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/AuthProvider'
import { Logo } from '@/components/ui/Logo'
import SignOutButton from '@/components/ui/SignOutButton'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'

function calculateStreak(recordings: { day_number: number, created_at: string }[]): number {
    if (recordings.length === 0) return 0

    // Sort by day_number descending
    const sorted = [...recordings].sort((a, b) => b.day_number - a.day_number)

    let streak = 1
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].day_number - sorted[i + 1].day_number === 1) {
            streak++
        } else {
            break
        }
    }

    return streak
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        if (!loading && !user) router.replace('/login')
    }, [user, loading, router])

    useEffect(() => {
        if (!user) return
        const q = query(collection(db, 'recordings'), where('user_id', '==', user.uid))
        getDocs(q).then(snap => {
            const recs = snap.docs.map(d => d.data() as { day_number: number, created_at: string })
            setStreak(calculateStreak(recs))
        })
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 glass sticky top-0 z-50">
                <Logo />
                <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                    {streak >= 2 && (
                        <span className="hidden sm:inline-block">
                            Streak: <span className="text-neon-green font-bold">{streak} Days</span> 🔥
                        </span>
                    )}
                    <SignOutButton />
                </div>
            </header>
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
                {children}
            </main>
        </div>
    )
}
