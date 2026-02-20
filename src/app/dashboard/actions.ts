'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startChallenge() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('users')
        .update({ challenge_start_date: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        console.error('Error starting challenge:', error)
        throw new Error('Could not start challenge')
    }

    revalidatePath('/dashboard')
}
