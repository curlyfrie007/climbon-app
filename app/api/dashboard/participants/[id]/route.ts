// File: /app/api/dashboard/participants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getParticipantById, deleteParticipantById } from '@/lib/participantMgmt'

export async function GET(
    request: NextRequest,
    { params }: { params: any }
) {
    try {
        // Await the entire params object first
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Valid participant ID is required' },
                { status: 400 }
            )
        }

        const participant = await getParticipantById(id)

        if (!participant) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(participant)
    } catch (error) {
        console.error('Error fetching participant:', error)
        return NextResponse.json(
            { error: 'Failed to fetch participant' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: any }
) {
    try {
        // Await the entire params object first
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Valid participant ID is required' },
                { status: 400 }
            )
        }

        const success = await deleteParticipantById(id)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete participant' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting participant:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}