// File: /app/api/participants/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyParticipantCredentials } from '@/lib/participantMgmt';

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { name, secret } = body;

        if (!name || !secret) {
            return NextResponse.json(
                { error: 'Name and secret are required' },
                { status: 400 }
            );
        }

        // Verify the participant credentials
        const participant = await verifyParticipantCredentials(name, secret);

        if (!participant) {
            return NextResponse.json(
                { error: 'Invalid name or secret' },
                { status: 401 }
            );
        }

        // Return the participant ID on successful verification
        return NextResponse.json({
            id: participant.id,
            name: participant.name,
            startclass: participant.startclass,
            message: 'Verification successful'
        });
    } catch (error) {
        console.error('Error verifying participant:', error);
        return NextResponse.json(
            { error: 'Failed to verify participant' },
            { status: 500 }
        );
    }
}