'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState<'login' | 'signup' | 'google' | null>(null)

    async function handleGoogleSignIn() {
        setErrorMessage(null)
        setLoading('google')
        try {
            const provider = new GoogleAuthProvider()
            const cred = await signInWithPopup(auth, provider)
            const idToken = await cred.user.getIdToken()
            document.cookie = `firebase-token=${idToken}; path=/; max-age=3600; SameSite=Lax`
            router.push('/dashboard')
        } catch {
            setErrorMessage('Google sign-in failed. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    async function handleAuth(e: React.FormEvent<HTMLFormElement>, mode: 'login' | 'signup') {
        e.preventDefault()
        setErrorMessage(null)
        setLoading(mode)
        const form = e.currentTarget
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value
        try {
            const cred = mode === 'login'
                ? await signInWithEmailAndPassword(auth, email, password)
                : await createUserWithEmailAndPassword(auth, email, password)
            const idToken = await cred.user.getIdToken()
            document.cookie = `firebase-token=${idToken}; path=/; max-age=3600; SameSite=Lax`
            router.push('/dashboard')
        } catch (error: any) {
            const msg =
                error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
                    ? 'Invalid email or password.'
                    : error.code === 'auth/email-already-in-use'
                        ? 'An account with this email already exists.'
                        : error.code === 'auth/weak-password'
                            ? 'Password must be at least 6 characters.'
                            : 'Something went wrong. Please try again.'
            setErrorMessage(msg)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Background glows */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-[40vw] h-[40vw] bg-neon-blue/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/3 w-[35vw] h-[35vw] bg-neon-violet/10 rounded-full blur-[120px]" />
            </div>

            {/* Logo */}
            <div className="mb-8 text-center">
                <span className="text-3xl font-display font-bold tracking-tight">
                    One<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet">Minute</span>
                </span>
                <p className="text-white/50 mt-2 text-sm">Train how you express yourself.</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm relative">
                <div className="glass rounded-2xl border border-white/10 shadow-2xl p-8 flex flex-col gap-5">

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading !== null}
                        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-60"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-white/25 text-xs">
                        <div className="flex-1 h-px bg-white/10" />
                        <span>or continue with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={(e) => {
                            const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
                            handleAuth(e, submitter?.value as 'login' | 'signup')
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-white/60" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@company.com"
                                required
                                className="rounded-xl px-4 py-3 bg-black/50 border border-white/10 text-white text-sm placeholder-white/30 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-white/60" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="rounded-xl px-4 py-3 bg-black/50 border border-white/10 text-white text-sm placeholder-white/30 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                name="action"
                                value="login"
                                disabled={loading !== null}
                                className="bg-white text-black text-sm font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors disabled:opacity-60"
                            >
                                {loading === 'login' ? 'Signing in…' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                            </button>
                            <button
                                type="submit"
                                name="action"
                                value="signup"
                                disabled={loading !== null}
                                className="border border-white/15 text-white text-sm font-semibold rounded-xl px-4 py-3 hover:bg-white/5 transition-colors disabled:opacity-60"
                            >
                                {loading === 'signup' ? 'Creating account…' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
