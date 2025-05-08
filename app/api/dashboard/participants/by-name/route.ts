// File: /app/api/dashboard/participants/by-name/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Import updated function
import { getParticipantsByName } from '@/lib/participantMgmt';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
        }

        // Calls the updated function, returns ParticipantKKFN[]
        const participants = await getParticipantsByName(name);

        return NextResponse.json(participants);
    } catch (error) {
        console.error('Error fetching participants by name:', error);
        return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }
}