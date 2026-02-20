import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse request
        const { dayNumber } = await req.json()
        if (!dayNumber) {
            return NextResponse.json({ error: 'dayNumber is required' }, { status: 400 })
        }

        // 3. Fetch scenario details
        const { data: scenario, error: scenarioError } = await supabase
            .from('scenarios')
            .select('*')
            .eq('day_number', dayNumber)
            .single()

        if (scenarioError || !scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
        }

        // 4. Download audio from Supabase Storage
        const path = `${user.id}/${dayNumber}.webm`
        const { data: audioData, error: downloadError } = await supabase.storage
            .from('recordings')
            .download(path)

        if (downloadError || !audioData) {
            console.error('Download error:', downloadError)
            return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
        }

        // 5. Convert audio to Base64 for Gemini
        const arrayBuffer = await audioData.arrayBuffer()
        const base64Audio = Buffer.from(arrayBuffer).toString('base64')

        // 6. Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
      You are an expert executive communication coach.
      A user has recorded their response to a scenario. 
      Analyze the audio and provide a highly structured JSON evaluation.

      ### Scenario Details
      Title: ${scenario.title}
      Role: ${scenario.role}
      Situation: ${scenario.situation}
      Objective: ${scenario.objective}
      Constraint: ${scenario.constraint_text || 'None'}

      ### Evaluation Criteria
      Score each out of 10:
      - clarity_score: How clearly was the message delivered without excessive rambling?
      - structure_score: Did it have a logical flow (e.g., beginning, middle, end)?
      - confidence_score: Did the speaker sound authoritative and sure of themselves?
      - tone_score: Was the tone appropriately professional for the context?
      - conciseness_score: Did they get to the point fast?

      Also:
      - filler_count: Estimate how many filler words (um, uh, like, you know) were used. If the audio is completely silent or garbled, put 0 but score very low.
      - transcript: A faithful transcript of what they said. If empty or unintelligible, say "[Unintelligible / Silence]".

      Provide feedback arrays (2-3 items each) for:
      - what_you_did_well
      - improvement_areas

      Check if they met the objectives:
      - addressed_situation (boolean)
      - offered_solution (boolean)
      - followed_constraint (boolean)

      Finally:
      - suggested_rewrite: Write a "perfect" 30-second version of what they *should* have said.

      ### JSON Schema Requirement
      Return ONLY raw JSON matching this structure perfectly. Do NOT wrap in markdown \`\`\`json block.
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
      }
    `

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: base64Audio
                }
            },
            { text: prompt }
        ])

        const responseText = result.response.text()

        // Attempt to parse JSON (safeguard against markdown block)
        let parsedData
        try {
            const cleaned = responseText.replace(/```json|```/g, '').trim()
            parsedData = JSON.parse(cleaned)
        } catch (e) {
            console.error('Failed to parse Gemini output:', responseText)
            return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
        }

        // 7. Calculate overall score (out of 50)
        const overall_score =
            parsedData.clarity_score +
            parsedData.structure_score +
            parsedData.confidence_score +
            parsedData.tone_score +
            parsedData.conciseness_score

        // 8. Store in database
        const { error: dbError } = await supabase
            .from('recordings')
            .upsert({
                user_id: user.id,
                day_number: dayNumber,
                audio_url: path,
                transcript: parsedData.transcript,
                clarity_score: parsedData.clarity_score,
                structure_score: parsedData.structure_score,
                confidence_score: parsedData.confidence_score,
                tone_score: parsedData.tone_score,
                conciseness_score: parsedData.conciseness_score,
                filler_count: parsedData.filler_count,
                overall_score,
                feedback_summary: parsedData.feedback_summary
            }, { onConflict: 'user_id,day_number' })

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
        }

        // 9. Return success
        return NextResponse.json({ success: true, url: `/dashboard/day/${dayNumber}/feedback` })

    } catch (error: any) {
        console.error('Evaluation Route Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
