// app/event/KKFN2025/participant/editor/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParticipantAuth } from '@/hooks/useParticipantAuth';
import {
    useParticipant,
    useUpdateParticipantBoulderResult,
    ParticipantKKFN,
    StartclassKKFN,
    ResultKKFN
} from '@/hooks/useParticipants';
import { Button } from '@/components/ui/button';
// Import Toggle instead of Checkbox
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Helper function (ensure it initializes results.boulders correctly)
function parseSingleParticipantData(p: any): ParticipantKKFN | null {
     if (!p) return null;
     const results = typeof p.results === 'string'
         ? JSON.parse(p.results)
         : (p.results || { boulders: [], lastUpdateTime: null });

     // Ensure boulders array has the correct length upon parsing
     if (!results.boulders || results.boulders.length !== 35) {
         console.warn(`Correcting boulder array length for participant ${p.id}. Found ${results.boulders?.length}, expected 35.`);
         results.boulders = Array(35).fill(false);
     }

     return {
        ...p,
        registrationDate: p.registrationDate ? new Date(p.registrationDate) : new Date(),
        results: results,
        startclass: (p.startclass === 'Männlich' || p.startclass === 'Weiblich') ? p.startclass : 'Männlich',
    };
}


export default function ParticipantEditorPage() {
    const router = useRouter();
    const { getSessionData, isLoggedIn, logout } = useParticipantAuth("/event/KKFN2025");
    const [sessionChecked, setSessionChecked] = useState(false);

    const session = getSessionData();
    const participantId = session?.id;

    const {
        participant: fetchedParticipant,
        loading: participantLoading,
        error: participantError,
    } = useParticipant(participantId ?? null);

    const [localParticipant, setLocalParticipant] = useState<ParticipantKKFN | null>(null);

    const {
        updateBoulderResult,
        loading: updateLoading,
        error: updateApiError
    } = useUpdateParticipantBoulderResult();

    // Effect to check login status
    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/event/KKFN2025/participant/login');
        } else {
            setSessionChecked(true);
        }
    }, [isLoggedIn, router]);

    // Effect to sync local state when fetched data changes
    useEffect(() => {
        if (fetchedParticipant) {
            setLocalParticipant(parseSingleParticipantData(fetchedParticipant));
        }
    }, [fetchedParticipant]);


    // Handler function with optimistic update logic
    const handleBoulderChange = async (index: number, completed: boolean) => {
        if (!participantId || !session?.secret || !localParticipant) {
            toast.error("Session error or data missing. Please log in again.");
            logout();
            return;
        };

        // --- Optimistic Update ---
        const originalParticipantState = localParticipant;
        const currentBoulders = [...(originalParticipantState.results?.boulders ?? Array(35).fill(false))];

        if (index < 0 || index >= currentBoulders.length) {
            console.error("Invalid boulder index for optimistic update:", index);
            return;
        }
        currentBoulders[index] = completed; // Update the specific boulder

        const optimisticParticipant: ParticipantKKFN = {
            ...originalParticipantState,
            results: {
                ...(originalParticipantState.results ?? { boulders: [], lastUpdateTime: null }),
                boulders: currentBoulders,
                lastUpdateTime: originalParticipantState.results?.lastUpdateTime
            }
        };
        setLocalParticipant(optimisticParticipant);
        // --- End Optimistic Update ---

        try {
            // Call the API
            const updatedParticipantFromApi = await updateBoulderResult(
                participantId, index, completed, session.secret
            );
            if (updatedParticipantFromApi) {
                setLocalParticipant(parseSingleParticipantData(updatedParticipantFromApi));
            } else {
                toast.error(`Failed to save update for Boulder ${index + 1}`, {
                     description: updateApiError || 'Reverting change.'
                });
                setLocalParticipant(originalParticipantState);
            }
        } catch (error) {
             console.error("Error calling updateBoulderResult:", error);
             toast.error(`Failed to update Boulder ${index + 1}`, {
                 description: 'An unexpected error occurred. Reverting change.'
             });
             setLocalParticipant(originalParticipantState);
        }
    };

    // --- Loading and Error States ---
    if (!sessionChecked || participantLoading) { /* ... loading UI ... */
         return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading session or participant data...
            </div>
        );
    }
    if (participantError) { /* ... error UI ... */
        return <div className="p-4 text-red-600">Error loading participant data: {participantError}</div>;
    }
    if (!localParticipant) { /* ... no data UI ... */
         return (
             <div className="p-4 text-center">
                Participant data not available.
                <Button onClick={logout} variant="link" className="ml-2">Logout</Button>
             </div>
        );
    }
    // --- End Loading and Error States ---

    // --- Derived Data (use localParticipant) ---
    const boulders = localParticipant.results?.boulders ?? Array(35).fill(false);
    const completedCount = boulders.filter(b => b).length;
    const totalBoulders = 35;
    const bouldersForFinals = localParticipant.startclass === 'Weiblich' ? 30 : 35;
    // --- End Derived Data ---

    // --- Render using localParticipant ---
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Header section */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold">KKFN2025 Scorecard</h1>
                    <p className="text-xl text-muted-foreground">{localParticipant.name} ({localParticipant.startclass})</p>
                </div>
                <Button variant="outline" onClick={logout}>Logout</Button>
            </div>

            {/* Score display section */}
            <div className="p-4 mb-6 border rounded-lg bg-card shadow-sm">
                {/* Saving indicator or alternate content */}
            {updateLoading ? (
                <div className="text-center text-2xl text-blue-600 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Speichern...
                </div>
            ) : (
                <p className="text-2xl font-semibold text-center">
                    Score: {completedCount} / {totalBoulders}
                </p>
            )}
                 
                 <p className='text-sm text-center'>{bouldersForFinals !== totalBoulders && ` (${bouldersForFinals} erfoderlich)`}</p>
                {localParticipant.results?.lastUpdateTime && (
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        Last update: {new Date(localParticipant.results.lastUpdateTime).toLocaleString()}
                    </p>
                )}
            </div>

            
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7 gap-4 justify-center">
                {/* Render Toggle components */}
                {boulders.map((isCompleted, index) => (
                    <Toggle
                        key={index}
                        aria-label={`Toggle Boulder ${index + 1}`} // Accessibility label
                        pressed={isCompleted}
                        // Pass the *new* state directly from the component's callback
                        onPressedChange={(newState) => handleBoulderChange(index, newState)}
                        variant="outline"
                        size="lg" // Use larger size for better touch target
                        disabled={updateLoading}
                        // Styling changes:
                        className={`
                            aspect-square flex items-center justify-center font-bold text-lg
                            border-1 
                            data-[state=on]:bg-blue-500 data-[state=on]:border-blue-600 data-[state=on]:text-white
                            data-[state=off]:bg-card data-[state=off]:text-foreground data-[state=off]:border-border
                            hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                            w-full h-full rounded-md
                        `}
                    >
                        {/* Display only the number */}
                        {index + 1}
                    </Toggle>
                ))}
                {/* Handle case where boulders array might be empty during loading */}
                {boulders.length === 0 && !participantLoading && (
                    <p className="col-span-full text-center text-muted-foreground">Loading boulders...</p>
                )}
            </div>
            {/* --- End Updated Grid Section --- */}
        </div>
    );
}
