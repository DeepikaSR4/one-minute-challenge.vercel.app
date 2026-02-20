import { login, signup } from './actions'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function LoginPage() {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto h-[100dvh]">
            <div className="flex flex-col gap-4 mb-8 items-center text-center">
                <Logo withTagline />
                <p className="text-lg text-white/70 font-sans font-medium">
                    You already know English.<br />
                    We help you sound like a leader.
                </p>
            </div>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground glass p-8 border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon-blue/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-neon-violet/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col gap-4">
                    <label className="text-md" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-lg px-4 py-3 bg-black/50 border border-white/10 text-white placeholder-white/40 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                        name="email"
                        placeholder="you@company.com"
                        required
                    />
                    <label className="text-md mt-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="rounded-lg px-4 py-3 bg-black/50 border border-white/10 text-white placeholder-white/40 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            formAction={login}
                            className="bg-white text-black font-semibold rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                        >
                            Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            formAction={signup}
                            className="border border-white/20 text-white font-semibold rounded-lg px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
