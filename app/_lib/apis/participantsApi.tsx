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

// Create a new participant
async function createParticipant(name: string, startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40", secret: string): Promise<Participant> {
    const participant = await prisma.participant.create({
        data: {
            name,
            startclass,
            secret,
            registrationDate: new Date(),
        },
    })

    // Prisma returns results as a JSON object, but we need to cast it to our type
    return {
        ...participant,
        results: participant.results as unknown as Result,
    }
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

// Get participant by ID
async function getParticipantById(id: string): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
        where: { id },
    })

    if (!participant) return null

    return {
        ...participant,
        results: participant.results as unknown as Result,
    }
}

// Update participant results
async function updateParticipantResults(id: string, routeNumber: number, zone: number, attempts: number): Promise<Participant | null> {
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

// Filter participants by startclass
async function getParticipantsByStartclass(startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40"): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
        where: { startclass },
    })

    return participants.map(p => ({
        ...p,
        results: p.results as unknown as Result,
    }))
}

// // Example usage
// async function main() {
//     try {
//         // Create new participant
//         const newParticipant = await createParticipant(
//             "Max Mustermann",
//             "Männlich",
//             "secret123"
//         )
//         console.log("Created participant:", newParticipant)

//         // Update participant results
//         const updatedParticipant = await updateParticipantResults(
//             newParticipant.id,
//             1, // Route1
//             3, // zone
//             2  // attempts
//         )
//         console.log("Updated participant:", updatedParticipant)

//         // Get all participants
//         const allParticipants = await getAllParticipants()
//         console.log(`Found ${allParticipants.length} participants`)

//         // Get participants by startclass
//         const menParticipants = await getParticipantsByStartclass("Männlich")
//         console.log(`Found ${menParticipants.length} male participants`)
//     } catch (error) {
//         console.error("Error:", error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }

// // Run the example
// main()