// File: /app/api/dashboard/participants/by-startclass/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getParticipantsByStartclass } from '@/lib/participantMgmt'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const startclass = searchParams.get('startclass')

        // Validate startclass
        const validStartclasses = ["Maennlich", "Weiblich", "Maennlich_Ue40", "Weiblich_Ue40"]
        if (!startclass || !validStartclasses.includes(startclass)) {
            return NextResponse.json(
                { error: 'Valid startclass is required' },
                { status: 400 }
            )
        }

        const participants = await getParticipantsByStartclass(startclass as any)
        return NextResponse.json(participants)
    } catch (error) {
        console.error('Error fetching participants by startclass:', error)
        return NextResponse.json(
            { error: 'Failed to fetch participants' },
            { status: 500 }
        )
    }
}