// File: /app/api/dashboard/participants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getParticipantById, deleteParticipantById } from '@/lib/participantMgmt'; // Ensure imports are correct

// Define the expected structure directly in the function signature

export async function GET(
    request: NextRequest,
    // Revert to the inline destructuring type annotation
    { params }: { params: any }
) {
    try {
        // Access id directly from the destructured params
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        const participant = await getParticipantById(id);

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        return NextResponse.json(participant);
    } catch (error) {
        console.error('Error fetching participant:', error);
        return NextResponse.json({ error: 'Failed to fetch participant' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    // Revert to the inline destructuring type annotation
    { params }: { params: { id: string } }
) {
    try {
        // Access id directly from the destructured params
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        const success = await deleteParticipantById(id);

        if (!success) {
            // Consider returning 404 if the participant wasn't found for deletion
            return NextResponse.json({ error: 'Failed to delete participant or participant not found' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting participant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
