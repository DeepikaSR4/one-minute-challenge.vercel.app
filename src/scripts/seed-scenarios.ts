// Usage: npx tsx src/scripts/seed-scenarios.ts
// Make sure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY are set in .env.local

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
}

const db = getFirestore()

const scenarios = [
    { day_number: 1, title: "Handling an Angry Client Call", role: "Account Manager", situation: "A major client calls furious that a deliverable is two days late. They are threatening to escalate to your CEO.", objective: "De-escalate the situation, take ownership, and provide a clear solution within 30 seconds.", constraint_text: "Do not say 'I understand your frustration' — it sounds hollow.", time_limit: 90 },
    { day_number: 2, title: "Project Status Update", role: "Project Manager", situation: "Your team lead asks for an impromptu status update on the current sprint in the middle of a standup.", objective: "Summarize progress, blockers, and next steps in under 60 seconds.", constraint_text: "Do not use the word 'basically'.", time_limit: 90 },
    { day_number: 3, title: "Saying No to Extra Work", role: "Software Engineer", situation: "Your manager asks you to take on an extra feature the day before a release.", objective: "Decline professionally while offering an alternative timeline.", constraint_text: "Do not sound defensive.", time_limit: 90 },
    { day_number: 4, title: "Pitching an Idea to Leadership", role: "Product Manager", situation: "You have 90 seconds to pitch a new feature idea to the VP of Product in the hallway.", objective: "State the problem, your solution, and the business impact clearly.", constraint_text: "Do not use jargon like 'synergy' or 'leverage'.", time_limit: 90 },
    { day_number: 5, title: "Giving Critical Feedback", role: "Team Lead", situation: "A team member submitted work that doesn't meet quality standards. You need to address it on a 1:1 call.", objective: "Deliver the feedback in a way that is direct, constructive, and actionable.", constraint_text: "Use the 'situation-impact-ask' format.", time_limit: 90 },
]

async function seed() {
    console.log('Seeding scenarios to Firestore...')
    for (const scenario of scenarios) {
        await db.collection('scenarios').add(scenario)
        console.log(`✓ Added Day ${scenario.day_number}: ${scenario.title}`)
    }
    console.log('Done! Add more scenarios as needed.')
    process.exit(0)
}

seed().catch(console.error)
