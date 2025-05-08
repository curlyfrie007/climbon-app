// File: /app/api/dashboard/participants/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Import updated function and type
import { createParticipant, StartclassKKFN } from '@/lib/participantMgmt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Explicitly type the expected body structure
        const { name, startclass, secret }: { name: string; startclass: StartclassKKFN; secret: string } = body;

        // Basic validation for presence
        if (!name || !startclass || !secret) {
            return NextResponse.json({ error: 'Name, startclass, and secret are required' }, { status: 400 });
        }

        // Validate startclass against the defined enum values
        const validStartclasses: StartclassKKFN[] = ["Männlich", "Weiblich"];
        if (!validStartclasses.includes(startclass)) {
            return NextResponse.json(
                { error: 'Invalid startclass. Must be "Männlich" or "Weiblich"' },
                { status: 400 }
            );
        }

        // Call the updated createParticipant function
        const participant = await createParticipant(name, startclass, secret);

        // Return the created participant (ParticipantKKFN structure)
        return NextResponse.json(participant, { status: 201 });

    } catch (error: any) {
        console.error('Error creating participant:', error);
        // Handle potential unique constraint errors (like duplicate secret if you add that)
         if (error.code === 'P2002') {
             // Check target fields if Prisma provides them
             const target = (error.meta?.target as string[]) || [];
             if (target.includes('secret')) { // Example if secret becomes unique
                 return NextResponse.json({ error: 'This secret is already in use.' }, { status: 409 });
             }
         }
        return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
    }
}