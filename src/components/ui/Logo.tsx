import Link from "next/link";
import { cn } from "@/utils/cn"; // Ensure we have a cn utility if needed, else we can just use normal classes

interface LogoProps {
    className?: string;
    withTagline?: boolean;
}

export function Logo({ className, withTagline = false }: LogoProps) {
    return (
        <Link href="/" className={cn("flex flex-col items-start group cursor-pointer hover:opacity-80 transition-opacity", className)}>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-display font-bold tracking-tight text-white">
                    One
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet">
                        Minute
                    </span>
                </span>
                {withTagline && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50 uppercase tracking-widest ml-1">
                        Challenge
                    </span>
                )}
            </div>
        </Link>
    );
}
