// File: /app/api/dashboard/participants/route.ts
import { NextResponse } from 'next/server'
// Import the updated function
import { getAllParticipants } from '@/lib/participantMgmt'

export async function GET() {
    try {
        // This now returns ParticipantKKFN[]
        const participants = await getAllParticipants();
        return NextResponse.json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch participants' },
            { status: 500 }
        );
    }
}