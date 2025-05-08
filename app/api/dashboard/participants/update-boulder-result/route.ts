// File: /app/api/dashboard/participants/update-boulder-result/route.ts (New Path)
import { NextRequest, NextResponse } from 'next/server';
// Import updated function
import { updateParticipantBoulderResult } from '@/lib/participantMgmt';
// No need for PrismaClient here if validation is done in the mgmt function

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        // Destructure expected fields
        const { id, boulderIndex, completed, secret } = body;

        // --- Basic Input Validation ---
        if (id === undefined || boulderIndex === undefined || completed === undefined) {
            return NextResponse.json({ error: 'id, boulderIndex, and completed status are required' }, { status: 400 });
        }
        if (secret === undefined) { // Ensure secret is provided
            return NextResponse.json({ error: 'Secret is required for update' }, { status: 401 });
        }
         if (typeof boulderIndex !== 'number' || boulderIndex < 0 || boulderIndex >= 35) {
            return NextResponse.json({ error: 'Boulder index must be a number between 0 and 34' }, { status: 400 });
        }
        if (typeof completed !== 'boolean') {
             return NextResponse.json({ error: 'Completed status must be a boolean' }, { status: 400 });
        }
        // --- End Basic Input Validation ---


        // Call the updated function which includes secret validation
        const updatedParticipant = await updateParticipantBoulderResult(
            id,
            boulderIndex,
            completed,
            secret // Pass secret for validation
        );

        // updateParticipantBoulderResult now returns null on auth failure or not found
        if (!updatedParticipant) {
            // We don't know if it was 'not found' or 'invalid secret'.
            // Returning 403 (Forbidden) or 404 (Not Found) might be more specific,
            // but 401 (Unauthorized) can also cover invalid credentials (secret).
            // Or a generic 400 Bad Request if the input caused the mgmt function to return null early.
            // Let's use 400 for simplicity here, assuming validation covers most cases.
            // Or check the reason if the mgmt function threw specific errors.
             return NextResponse.json({ error: 'Upd34   ate failed: Participant not found or invalid secret' }, { status: 403 }); // Forbidden is often suitable for auth issues
        }

        // Returns the updated ParticipantKKFN structure
        return NextResponse.json(updatedParticipant);

    } catch (error) {
        console.error('Error updating participant boulder result:', error);
        return NextResponse.json({ error: 'Failed to update participant results' }, { status: 500 });
    }
}