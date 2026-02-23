'use client'

import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { signOut } from 'firebase/auth'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const router = useRouter()

    async function handleSignOut() {
        await signOut(auth)
        // Clear the token cookie
        document.cookie = 'firebase-token=; path=/; max-age=0'
        router.push('/')
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 hover:text-white transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    )
}
