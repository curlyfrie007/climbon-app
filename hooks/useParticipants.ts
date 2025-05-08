// hooks/useParticipants.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// --- Type Definitions ---
export type ResultKKFN = {
    boulders: boolean[];
    lastUpdateTime: string | null;
};

export type StartclassKKFN = 'Männlich' | 'Weiblich';

export type ParticipantKKFN = {
    id: string;
    name: string;
    registrationDate: Date;
    secret: string;
    startclass: StartclassKKFN;
    results: ResultKKFN;
};
// --- End Type Definitions ---

// --- Helper Functions ---
function parseParticipantData(data: any[]): ParticipantKKFN[] {
    return data.map(p => parseSingleParticipantData(p)).filter(p => p !== null) as ParticipantKKFN[];
}

function parseSingleParticipantData(p: any): ParticipantKKFN | null {
     if (!p) return null;
     const results = typeof p.results === 'string'
         ? JSON.parse(p.results)
         : (p.results || { boulders: [], lastUpdateTime: null });

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
// --- End Helper Functions ---


// --- Hooks ---

export function useParticipants() {
    const [participants, setParticipants] = useState<ParticipantKKFN[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipants = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/participants');
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Error: ${response.status}`);
            }
            const data = await response.json();
            setParticipants(parseParticipantData(data));
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch participants:', err);
            setError(err.message || 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

    return { participants, loading, error, refetch: fetchParticipants };
}


export function useParticipantsByStartclass(startclass: StartclassKKFN | null) {
    const [participants, setParticipants] = useState<ParticipantKKFN[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipantsByClass = useCallback(async () => {
        // Check if startclass is valid before proceeding
        if (!startclass || (startclass !== 'Männlich' && startclass !== 'Weiblich')) {
            console.log(`useParticipantsByStartclass: Skipping fetch for invalid or null startclass: ${startclass}`);
            setParticipants([]);
            setLoading(false);
            setError(null); // Clear previous errors if startclass becomes invalid
            return;
        }
         setLoading(true);
         setError(null); // Clear previous errors before fetching
        try {
            // *** Add console log here ***
            console.log(`useParticipantsByStartclass: Fetching for startclass: "${startclass}"`);
            const response = await fetch(`/api/dashboard/participants/by-startclass?startclass=${encodeURIComponent(startclass)}`);
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 // Log the error received from the API
                 console.error(`API Error for startclass "${startclass}":`, errorData);
                 throw new Error(errorData.error || `Error: ${response.status}`); // Line 105 (approx)
             }
             const data = await response.json();
             setParticipants(parseParticipantData(data));
             // setError(null); // Already cleared above
        } catch (err: any) {
             console.error(`Failed to fetch ${startclass} participants:`, err);
             setError(err.message || `Failed to load ${startclass} participants`);
             setParticipants([]); // Clear data on error
        } finally { setLoading(false); }
    }, [startclass]); // Dependency array includes startclass

     useEffect(() => {
         fetchParticipantsByClass(); // Runs when startclass changes
     }, [fetchParticipantsByClass]); // Correct dependency

    return { participants, loading, error, refetch: fetchParticipantsByClass };
}


export function useParticipant(id: string | null) {
    const [participant, setParticipant] = useState<ParticipantKKFN | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipant = useCallback(async () => {
         if (!id) {
             setParticipant(null); setLoading(false); setError(null); return;
         }
         setLoading(true); setError(null);
        try {
            const response = await fetch(`/api/dashboard/participants/${id}`);
            if (response.status === 404) {
                 setParticipant(null); return; // Not found
            }
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Error: ${response.status}`);
             }
             const data = await response.json();
             setParticipant(parseSingleParticipantData(data));
        } catch (err: any) {
             console.error('Failed to fetch participant:', err);
             setError(err.message || 'Failed to load participant');
             setParticipant(null);
        } finally { setLoading(false); }
    }, [id]);

    useEffect(() => { fetchParticipant(); }, [fetchParticipant]);

    return { participant, loading, error, refetch: fetchParticipant };
}


export function useCreateParticipant() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createParticipant = async ( name: string, startclass: StartclassKKFN, secret: string ): Promise<ParticipantKKFN | null> => {
        setLoading(true); setError(null); setSuccess(false);
        try {
            const response = await fetch('/api/dashboard/participants/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ name, startclass, secret }),
            });
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Error: ${response.status}`);
             }
             const createdParticipant = await response.json();
             setSuccess(true);
             return parseSingleParticipantData(createdParticipant);
        } catch (err: any) {
             console.error('Failed to create participant:', err);
             setError(err.message || 'Failed to create participant');
             return null;
        } finally { setLoading(false); }
    };
    return { createParticipant, loading, error, success };
}


export function useUpdateParticipantBoulderResult() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateBoulderResult = async ( id: string, boulderIndex: number, completed: boolean, secret?: string ): Promise<ParticipantKKFN | null> => {
        setLoading(true); setError(null); setSuccess(false);
        if (!secret) {
             setError("Secret is required to update results."); setLoading(false); return null;
        }
        try {
            const body: any = { id, boulderIndex, completed, secret };
             const response = await fetch('/api/dashboard/participants/update-boulder-result', {
                method: 'PUT', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(body),
            });
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Error: ${response.status}`);
             }
             const updatedParticipant = await response.json();
             setSuccess(true);
             return parseSingleParticipantData(updatedParticipant);
        } catch (err: any) {
            console.error('Failed to update participant result:', err);
             setError(err.message || 'Failed to update result');
            return null;
        } finally { setLoading(false); }
    };
    return { updateBoulderResult, loading, error, success };
}


export function useDeleteParticipant() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [success, setSuccess] = useState(false);

     const deleteParticipant = async (id: string): Promise<boolean> => {
         setLoading(true); setError(null); setSuccess(false);
        try {
            const response = await fetch(`/api/dashboard/participants/${id}`, { method: 'DELETE' });
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Error: ${response.status}`);
             }
             setSuccess(true);
             return true;
        } catch (err: any) {
             console.error('Failed to delete participant:', err);
             setError(err.message || 'Failed to delete participant');
             return false;
        } finally { setLoading(false); }
     };
    return { deleteParticipant, loading, error, success };
}


export function useParticipantManager() {
    const { participants, loading: participantsLoading, error: participantsError, refetch: refetchParticipants } = useParticipants();
    const { createParticipant, loading: createLoading, error: createError, success: createSuccess } = useCreateParticipant();
    const { updateBoulderResult, loading: updateLoading, error: updateError, success: updateSuccess } = useUpdateParticipantBoulderResult();
    const { deleteParticipant, loading: deleteLoading, error: deleteError, success: deleteSuccess } = useDeleteParticipant();

    const fetchByStartclass = useCallback(async (startclass: StartclassKKFN): Promise<ParticipantKKFN[]> => {
        try {
            const response = await fetch(`/api/dashboard/participants/by-startclass?startclass=${encodeURIComponent(startclass)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            const data = await response.json();
            return parseParticipantData(data);
        } catch (error) {
            console.error(`Error fetching ${startclass} participants:`, error);
            return [];
        }
    }, []);

    const fetchParticipant = useCallback(async (id: string): Promise<ParticipantKKFN | null> => {
        try {
            const response = await fetch(`/api/dashboard/participants/${id}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            return parseSingleParticipantData(data);
        } catch (error) {
            console.error('Error fetching participant:', error);
            return null;
        }
    }, []);

    return {
        participants, participantsLoading, participantsError, refetchParticipants,
        createParticipant, createLoading, createError, createSuccess,
        updateBoulderResult, updateLoading, updateError, updateSuccess,
        deleteParticipant, deleteLoading, deleteError, deleteSuccess,
        fetchByStartclass, fetchParticipant
    };
}
// --- End Hooks ---
