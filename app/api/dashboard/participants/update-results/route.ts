// File: /app/api/dashboard/participants/update-results/route.ts
/*import { NextRequest, NextResponse } from 'next/server'
import { updateParticipantResults } from '@/lib/participantMgmt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, routeNumber, zone, attempts, secret } = body

        // Validate required fields
        if (!id || routeNumber === undefined || zone === undefined || attempts === undefined) {
            return NextResponse.json(
                { error: 'ID, routeNumber, zone, and attempts are required' },
                { status: 400 }
            )
        }

        // Validate route number
        if (routeNumber < 1 || routeNumber > 8) {
            return NextResponse.json(
                { error: 'Route number must be between 1 and 8' },
                { status: 400 }
            )
        }

        // Find the participant to validate secret
        if (secret !== undefined) {
            const participant = await prisma.participant.findUnique({
                where: { id },
                select: { secret: true }
            })

            if (!participant) {
                return NextResponse.json(
                    { error: 'Participant not found' },
                    { status: 404 }
                )
            }

            if (participant.secret !== secret) {
                return NextResponse.json(
                    { error: 'Invalid secret' },
                    { status: 403 }
                )
            }
        }

        const updatedParticipant = await updateParticipantResults(id, routeNumber, zone, attempts)

        if (!updatedParticipant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedParticipant)
    } catch (error) {
        console.error('Error updating participant results:', error)
        return NextResponse.json(
            { error: 'Failed to update participant results' },
            { status: 500 }
        )
    }
}*/