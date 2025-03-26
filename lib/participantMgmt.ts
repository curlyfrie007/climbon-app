import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Type definitions to match your requirements
export type Result = {
    Route1: {
        zone: number
        attempts: number
    },
    Route2: {
        zone: number
        attempts: number
    },
    Route3: {
        zone: number
        attempts: number
    },
    Route4: {
        zone: number
        attempts: number
    },
    Route5: {
        zone: number
        attempts: number
    },
    Route6: {
        zone: number
        attempts: number
    },
    Route7: {
        zone: number
        attempts: number
    },
    Route8: {
        zone: number
        attempts: number
    },
}

export type Participant = {
    id: string
    name: string
    registrationDate: Date
    secret: string
    startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40"
    results: Result
}

// Get all participants
export async function getAllParticipants(): Promise<Participant[]> {
    const participants = await prisma.participant.findMany()

    // Cast results for each participant
    return participants.map(p => ({
        ...p,
        results: p.results as unknown as Result,
    }))
}

// Export other functions to be used in API routes
export async function createParticipant(name: string, startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40", secret: string): Promise<Participant> {
    const participant = await prisma.participant.create({
        data: {
            name,
            startclass,
            secret,
            registrationDate: new Date(),
            results: {
                Route1: { zone: 0, attempts: 0 },
                Route2: { zone: 0, attempts: 0 },
                Route3: { zone: 0, attempts: 0 },
                Route4: { zone: 0, attempts: 0 },
                Route5: { zone: 0, attempts: 0 },
                Route6: { zone: 0, attempts: 0 },
                Route7: { zone: 0, attempts: 0 },
                Route8: { zone: 0, attempts: 0 }
            }
        },
    })

    return {
        ...participant,
        results: participant.results as unknown as Result,
    }
}

export async function getParticipantById(id: string): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
        where: { id },
    })

    if (!participant) return null

    return {
        ...participant,
        results: participant.results as unknown as Result,
    }
}

export async function updateParticipantResults(id: string, routeNumber: number, zone: number, attempts: number): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
        where: { id },
    })

    if (!participant) return null

    // Parse current results
    const currentResults = participant.results as unknown as Result

    // Create updated results by modifying the specific route
    const routeKey = `Route${routeNumber}` as keyof Result
    const updatedResults = {
        ...currentResults,
        [routeKey]: {
            zone,
            attempts,
        }
    }

    // Update the participant with new results
    const updatedParticipant = await prisma.participant.update({
        where: { id },
        data: {
            results: updatedResults,
        },
    })

    return {
        ...updatedParticipant,
        results: updatedParticipant.results as unknown as Result,
    }
}

export async function getParticipantsByStartclass(startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40"): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
        where: { startclass },
    })

    return participants.map(p => ({
        ...p,
        results: p.results as unknown as Result,
    }))
}

export async function deleteParticipantById(id: string): Promise<boolean> {
    try {
        await prisma.participant.delete({
            where: { id },
        });
        return true;
    } catch (error) {
        console.error('Error deleting participant:', error);
        return false;
    }
}


export async function verifyParticipantCredentials(
    name: string,
    secret: string
): Promise<Participant | null> {
    try {
        // First, find participants by name
        const response = await fetch(`/api/dashboard/participants/by-name?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            console.error('Error fetching participants by name:', response.status);
            return null;
        }

        const participants = await response.json();

        // If no participants found with that name
        if (!participants || participants.length === 0) {
            return null;
        }

        // Find the participant with matching secret
        const verifiedParticipant = participants.find(
            (p: Participant) => p.secret === secret
        );

        return verifiedParticipant || null;
    } catch (error) {
        console.error('Error verifying participant credentials:', error);
        return null;
    }
}

/**
 * Get participants by name
 * @param name Participant name
 * @returns Array of participants with matching name
 */
export async function getParticipantsByName(name: string): Promise<Participant[]> {
    try {
        // Implementation depends on your data storage method
        // Example using database query or API call
        const response = await fetch(`/api/dashboard/participants`);

        if (!response.ok) {
            throw new Error(`Failed to fetch participants: ${response.status}`);
        }

        const allParticipants = await response.json();

        // Filter participants by name (case insensitive partial match)
        return allParticipants.filter((p: Participant) =>
            p.name.toLowerCase().includes(name.toLowerCase())
        );
    } catch (error) {
        console.error('Error fetching participants by name:', error);
        return [];
    }
}