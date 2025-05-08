// File: /app/api/dashboard/participants/by-startclass/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Import updated function and type
import { getParticipantsByStartclass, StartclassKKFN } from '@/lib/participantMgmt';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startclass = searchParams.get('startclass');

        // Validate startclass
        const validStartclasses: StartclassKKFN[] = ["Männlich", "Weiblich"];
        if (!startclass || !validStartclasses.includes(startclass as StartclassKKFN)) {
            return NextResponse.json(
                { error: 'Valid startclass ("Männlich" or "Weiblich") is required' },
                { status: 400 }
            );
        }

        // Call the updated function, casting the validated startclass
        const participants = await getParticipantsByStartclass(startclass as StartclassKKFN);

        // Returns ParticipantKKFN[] structure
        return NextResponse.json(participants);
    } catch (error) {
        console.error('Error fetching participants by startclass:', error);
        return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }
}