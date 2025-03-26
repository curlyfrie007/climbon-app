// File: /app/api/dashboard/participants/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createParticipant } from '@/lib/participantMgmt'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, startclass, secret } = body

        // Validate required fields
        if (!name || !startclass || !secret) {
            return NextResponse.json(
                { error: 'Name, startclass, and secret are required' },
                { status: 400 }
            )
        }

        // Validate startclass
        const validStartclasses = ["Maennlich", "Weiblich", "Maennlich_Ue40", "Weiblich_Ue40"]
        if (!validStartclasses.includes(startclass)) {
            return NextResponse.json(
                { error: 'Invalid startclass' },
                { status: 400 }
            )
        }

        const participant = await createParticipant(name, startclass, secret)
        return NextResponse.json(participant, { status: 201 })
    } catch (error) {
        console.error('Error creating participant:', error)
        return NextResponse.json(
            { error: 'Failed to create participant' },
            { status: 500 }
        )
    }
}