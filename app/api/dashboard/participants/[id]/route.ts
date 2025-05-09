// File: /app/api/dashboard/participants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getParticipantById, deleteParticipantById } from '@/lib/participantMgmt'; // Ensure imports are correct

// Define a type for the context object containing params (optional but good practice)
interface RouteContext {
    params: {
        id: string;
    };
}

export async function GET(
    request: NextRequest,
    // Use the defined interface or let Next.js infer the type
    // Removing the explicit inline type: { params }: { params: { id: string } }
    context: RouteContext // Use the interface
    // Or simply: context: { params: { id: string } }
    // Or even just context and access context.params.id
) {
    try {
        // Access id via context.params
        const id = context.params.id;

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
    // Use the defined interface or let Next.js infer the type
    context: RouteContext // Use the interface
) {
    try {
        // Access id via context.params
        const id = context.params.id;

        if (!id) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        const success = await deleteParticipantById(id);

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting participant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
