'use client'
import { usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ParticipantsTable } from '@/components/dashboard/participant-table';
import { ParticipantsTable } from '@/components/dashboard/participant-table-claude';
import { LeaderboardTable } from '@/components/dashboard/leaderboard';
import { Card } from '@/components/ui/card';
import { LeaderboardTableDashboard } from '@/components/dashboard/leaderboardDashboard';



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
                <TabsContent value="results" className='w-full'>
                    <h1 className="text-4xl text-bold mb-4">Ergebnisse</h1>
                    <LeaderboardTableDashboard></LeaderboardTableDashboard>
                </TabsContent>

            </Tabs>

        </div>
    )
}
