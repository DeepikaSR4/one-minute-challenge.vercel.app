'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase/config'
import { collection, addDoc, updateDoc } from 'firebase/firestore'

export default function AudioRecorder({ dayNumber, timeLimit = 90 }: { dayNumber: number, timeLimit?: number }) {
    const router = useRouter()
    const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'processing'>('idle')
    const [countdown, setCountdown] = useState(3)
    const [timeRecording, setTimeRecording] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (recordingState === 'countdown') {
            if (countdown > 0) timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            else startRecording()
        }
        return () => clearTimeout(timer)
    }, [countdown, recordingState])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (recordingState === 'recording') {
            timer = setInterval(() => {
                setTimeRecording(t => {
                    if (t >= timeLimit) { stopRecording(); return t }
                    return t + 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [recordingState, timeLimit])

    const handleSpeakNow = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            setRecordingState('countdown')
            setCountdown(3)
        } catch {
            alert("Please allow microphone access to proceed.")
        }
    }

    const startRecording = async () => {
        chunksRef.current = []
        setTimeRecording(0)
        setRecordingState('recording')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        mediaRecorder.onstop = async () => {
            setRecordingState('processing')
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
            stream.getTracks().forEach(t => t.stop())
            await uploadAndProcessAudio(audioBlob)
        }
        mediaRecorder.start()
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    }

    const uploadAndProcessAudio = async (blob: Blob) => {
        try {
            const user = auth.currentUser
            if (!user) throw new Error("Not authenticated")
            const idToken = await user.getIdToken()

            // Convert blob to base64 to send directly to API (no Firebase Storage needed)
            const arrayBuffer = await blob.arrayBuffer()
            const base64Audio = Buffer.from(arrayBuffer).toString('base64')

            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ dayNumber, audioBase64: base64Audio })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Evaluation failed")

            // Each attempt gets its own auto-ID so previous entries are never overwritten
            const docRef = await addDoc(collection(db, 'recordings'), data.result)
            // Store the doc ID inside the document itself for direct lookup
            await updateDoc(docRef, { id: docRef.id })

            router.push(`/dashboard/day/${dayNumber}/feedback?id=${docRef.id}`)
        } catch (error) {
            console.error(error)
            alert("Something went wrong analyzing your audio. Please try again.")
            setRecordingState('idle')
        }
    }

    if (recordingState === 'idle') return (
        <button onClick={handleSpeakNow} className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-6 bg-neon-blue text-black rounded-2xl font-bold text-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(0,240,255,0.4)]">
            <span className="relative z-10">Let's Go</span>
            <Mic className="relative z-10 w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
    )

    if (recordingState === 'countdown') return (
        <div className="w-full flex items-center justify-center py-6 glass rounded-2xl bg-neon-blue/10">
            <span className="text-6xl font-display font-bold neon-text-blue animate-pulse">
                {countdown > 0 ? countdown : 'GO!'}
            </span>
        </div>
    )

    if (recordingState === 'recording') return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full flex items-center justify-between py-6 px-8 glass rounded-2xl border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-sans font-bold text-xl text-red-500">Recording</span>
                </div>
                <span className="font-display font-bold text-2xl text-white">
                    00:{timeRecording.toString().padStart(2, '0')} / 00:{timeLimit.toString().padStart(2, '0')}
                </span>
            </div>
            <button onClick={stopRecording} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-neutral-200 transition-colors">
                <Square className="w-5 h-5 fill-black" /> Finish Early
            </button>
        </div>
    )

    if (recordingState === 'processing') return (
        <div className="w-full flex flex-col items-center justify-center py-8 glass rounded-2xl border-neon-violet/50 bg-neon-violet/10">
            <Loader2 className="w-10 h-10 text-neon-violet animate-spin mb-4" />
            <span className="font-sans font-bold text-lg text-white">Analyzing Speech Patterns...</span>
            <span className="font-sans text-sm text-white/60 mt-2">Evaluating Audio via AI</span>
        </div>
    )

    return null
}
