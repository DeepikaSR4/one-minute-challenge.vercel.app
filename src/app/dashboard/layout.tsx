import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 glass sticky top-0 z-50">
                <Logo />
                <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                    <span className="hidden sm:inline-block">Streak: <span className="text-neon-green font-bold">2 Days</span> 🔥</span>
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-2 hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </header>
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
                {children}
            </main>
        </div>
    )
}
