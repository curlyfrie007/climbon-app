// File: /app/api/dashboard/participants/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Import updated function
import { verifyParticipantCredentials } from '@/lib/participantMgmt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, secret } = body;

        if (!name || !secret) {
            return NextResponse.json({ error: 'Name and secret are required' }, { status: 400 });
        }

        // Calls the updated function, returns ParticipantKKFN | null
        const participant = await verifyParticipantCredentials(name, secret);

        if (!participant) {
            return NextResponse.json({ error: 'Invalid name or secret' }, { status: 401 }); // Use 401 for unauthorized
        }

        // Return relevant participant info (structure based on ParticipantKKFN)
        return NextResponse.json({
            id: participant.id,
            name: participant.name,
            startclass: participant.startclass,
            // You might not want to return the full results or secret here
            message: 'Verification successful'
        });
    } catch (error) {
        console.error('Error verifying participant:', error);
        return NextResponse.json({ error: 'Failed to verify participant' }, { status: 500 });
    }
}