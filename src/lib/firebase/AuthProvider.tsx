'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface AuthContextType {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
            // Keep cookie in sync with auth state
            if (u) {
                u.getIdToken().then(token => {
                    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`
                })
            } else {
                document.cookie = 'firebase-token=; path=/; max-age=0'
            }
        })
        return unsubscribe
    }, [])

    return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
