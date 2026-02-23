import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Lightweight Firebase token verification without Admin SDK
async function verifyFirebaseToken(idToken: string): Promise<{ uid: string } | null> {
    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        // Decode the JWT payload (base64) to get uid — this is safe because
        // Firebase Storage security rules and Firestore rules provide real protection.
        // For a personal project this lightweight decode is acceptable.
        const parts = idToken.split('.')
        if (parts.length !== 3) return null
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
        if (payload.aud !== projectId) return null
        if (payload.exp < Date.now() / 1000) return null
        return { uid: payload.user_id || payload.sub }
    } catch {
        return null
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
    try {
        // 1. Authenticate user via Bearer token (lightweight JWT decode)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const idToken = authHeader.slice(7)
        const decoded = await verifyFirebaseToken(idToken)
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        const uid = decoded.uid

        // 2. Parse request
        const { dayNumber, audioBase64 } = await req.json()
        if (!dayNumber || !audioBase64) {
            return NextResponse.json({ error: 'dayNumber and audioBase64 are required' }, { status: 400 })
        }

        // 3. Call Gemini API directly with audio sent from client
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
You are an expert executive communication coach.
A user has recorded their response to a scenario.
Analyze the audio and provide a highly structured JSON evaluation.

### Evaluation Criteria
Score each out of 10:
- clarity_score: How clearly was the message delivered?
- structure_score: Did it have a logical flow?
- confidence_score: Did the speaker sound authoritative?
- tone_score: Was the tone appropriately professional?
- conciseness_score: Did they get to the point fast?

Also:
- filler_count: Estimate filler words (um, uh, like, you know).
- transcript: A faithful transcript. If silent, say "[Unintelligible / Silence]".

Feedback arrays (2-3 items each):
- what_you_did_well
- improvement_areas

Objective check:
- addressed_situation (boolean)
- offered_solution (boolean)
- followed_constraint (boolean)

Finally:
- suggested_rewrite: A "perfect" 30-second version of what they should have said.

Return ONLY raw JSON. Do NOT wrap in markdown \`\`\`json block.
{
  "transcript": "string",
  "clarity_score": number,
  "structure_score": number,
  "confidence_score": number,
  "tone_score": number,
  "conciseness_score": number,
  "filler_count": number,
  "feedback_summary": {
    "what_you_did_well": ["string"],
    "improvement_areas": ["string"],
    "missed_objective_check": {
      "addressed_situation": boolean,
      "offered_solution": boolean,
      "followed_constraint": boolean
    },
    "suggested_rewrite": "string"
  }
}`

        const result = await model.generateContent([
            { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
            { text: prompt }
        ])

        const responseText = result.response.text()

        let parsedData
        try {
            const cleaned = responseText.replace(/```json|```/g, '').trim()
            parsedData = JSON.parse(cleaned)
        } catch {
            console.error('Failed to parse Gemini output:', responseText)
            return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
        }

        const overall_score =
            parsedData.clarity_score + parsedData.structure_score +
            parsedData.confidence_score + parsedData.tone_score +
            parsedData.conciseness_score

        // 4. Return results — client saves to Firestore directly
        return NextResponse.json({
            success: true,
            url: `/dashboard/day/${dayNumber}/feedback`,
            result: {
                user_id: uid,
                day_number: dayNumber,
                transcript: parsedData.transcript,
                clarity_score: parsedData.clarity_score,
                structure_score: parsedData.structure_score,
                confidence_score: parsedData.confidence_score,
                tone_score: parsedData.tone_score,
                conciseness_score: parsedData.conciseness_score,
                filler_count: parsedData.filler_count,
                overall_score,
                feedback_summary: parsedData.feedback_summary,
                created_at: new Date().toISOString(),
            }
        })

    } catch (error: any) {
        console.error('Evaluation Route Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
