'use client'
import { usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ParticipantsTable } from '@/components/dashboard/participant-table';
import { ParticipantsTable } from '@/components/dashboard/participant-table-claude';
import { LeaderboardTable } from '@/components/dashboard/leaderboard';
import { Card } from '@/components/ui/card';
import ParticipantManager from '@/components/participantmanager';



export default function Auth() {
    const pathname = usePathname().split('/');

    return (
        <div className="w-full p-6 md:p-10 md:py-8">
            <Tabs defaultValue="participants" className="">
                <TabsList className='mb-4'>
                    <TabsTrigger value="participants">Teilnehmer</TabsTrigger>
                    <TabsTrigger value="results">Ergebnisse</TabsTrigger>
                </TabsList>

                <TabsContent value="participants">
                    <ParticipantsTable></ParticipantsTable>
                </TabsContent>
                <TabsContent value="results">
                    <LeaderboardTable></LeaderboardTable>
                </TabsContent>

            </Tabs>
            {/* <div className="w-full max-w-sm">
                <p>Post: {pathname[3]}</p>

            </div> */}
            {/* <ParticipantManager></ParticipantManager> */}
        </div>
    )
}
