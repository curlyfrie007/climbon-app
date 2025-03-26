// File: /app/api/dashboard/participants/by-name/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getParticipantsByName } from '@/lib/participantMgmt';

export async function GET(request: NextRequest) {
    try {
        // Get name from query parameters
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: 'Name parameter is required' },
                { status: 400 }
            );
        }

        // Fetch participants by name
        const participants = await getParticipantsByName(name);

        return NextResponse.json(participants);
    } catch (error) {
        console.error('Error fetching participants by name:', error);
        return NextResponse.json(
            { error: 'Failed to fetch participants' },
            { status: 500 }
        );
    }
}