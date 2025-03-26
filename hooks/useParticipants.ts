// hooks/useParticipants.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// Type definitions matching your API
export type Result = {
    Route1: { zone: number; attempts: number };
    Route2: { zone: number; attempts: number };
    Route3: { zone: number; attempts: number };
    Route4: { zone: number; attempts: number };
    Route5: { zone: number; attempts: number };
    Route6: { zone: number; attempts: number };
    Route7: { zone: number; attempts: number };
    Route8: { zone: number; attempts: number };
};

export type Participant = {
    id: string;
    name: string;
    registrationDate: Date;
    secret: string;
    startclass: "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40";
    results: Result;
};

export type StartClassType = "Maennlich" | "Weiblich" | "Maennlich_Ue40" | "Weiblich_Ue40";

/**
 * Hook to fetch all participants
 */
export function useParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
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
            setParticipants(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch participants:', err);
            setError(err.message || 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParticipants();
    }, [fetchParticipants]);

    return { participants, loading, error, refetch: fetchParticipants };
}

/**
 * Hook to fetch participants by startclass
 */
export function useParticipantsByStartclass(startclass: StartClassType) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipantsByClass = useCallback(async () => {
        if (!startclass) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/dashboard/participants/by-startclass?startclass=${encodeURIComponent(startclass)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            const data = await response.json();
            setParticipants(data);
            setError(null);
        } catch (err: any) {
            console.error(`Failed to fetch ${startclass} participants:`, err);
            setError(err.message || `Failed to load ${startclass} participants`);
        } finally {
            setLoading(false);
        }
    }, [startclass]);

    useEffect(() => {
        fetchParticipantsByClass();
    }, [fetchParticipantsByClass]);

    return { participants, loading, error, refetch: fetchParticipantsByClass };
}

/**
 * Hook to fetch a single participant by ID
 */
export function useParticipant(id: string | null) {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParticipant = useCallback(async () => {
        if (!id) {
            setParticipant(null);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/dashboard/participants/${id}`);
            if (response.status === 404) {
                setParticipant(null);
                setError(null);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const data = await response.json();
            setParticipant(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch participant:', err);
            setError(err.message || 'Failed to load participant');
            setParticipant(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchParticipant();
        } else {
            setParticipant(null);
            setLoading(false);
            setError(null);
        }
    }, [id, fetchParticipant]);

    return { participant, loading, error, refetch: fetchParticipant };
}

/**
 * Hook for creating a participant
 */
export function useCreateParticipant() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createParticipant = async (
        name: string,
        startclass: StartClassType,
        secret: string
    ): Promise<Participant | null> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/dashboard/participants/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, startclass, secret }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const createdParticipant = await response.json();
            setSuccess(true);
            return createdParticipant;
        } catch (err: any) {
            console.error('Failed to create participant:', err);
            setError(err.message || 'Failed to create participant');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createParticipant, loading, error, success };
}

/**
 * Hook for updating participant results
 */
export function useUpdateParticipantResults() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateResults = async (
        id: string,
        routeNumber: number,
        zone: number,
        attempts: number,
        secret?: string
    ): Promise<Participant | null> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const body: any = { id, routeNumber, zone, attempts };
            if (secret) {
                body.secret = secret;
            }

            const response = await fetch('/api/dashboard/participants/update-results', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const updatedParticipant = await response.json();
            setSuccess(true);
            return updatedParticipant;
        } catch (err: any) {
            console.error('Failed to update participant results:', err);
            setError(err.message || 'Failed to update results');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updateResults, loading, error, success };
}

/**
 * Combined hook to provide all participant-related functionality
 */
export function useParticipantManager() {
    const {
        participants,
        loading: participantsLoading,
        error: participantsError,
        refetch: refetchParticipants
    } = useParticipants();

    const {
        createParticipant,
        loading: createLoading,
        error: createError,
        success: createSuccess
    } = useCreateParticipant();

    const {
        updateResults,
        loading: updateLoading,
        error: updateError,
        success: updateSuccess
    } = useUpdateParticipantResults();

    // Function to fetch participants by startclass
    const fetchByStartclass = async (startclass: StartClassType): Promise<Participant[]> => {
        try {
            const response = await fetch(`/api/dashboard/participants/by-startclass?startclass=${encodeURIComponent(startclass)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${startclass} participants:`, error);
            return [];
        }
    };

    // Function to fetch a single participant
    const fetchParticipant = async (id: string): Promise<Participant | null> => {
        try {
            const response = await fetch(`/api/dashboard/participants/${id}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching participant:', error);
            return null;
        }
    };

    return {
        // Participants list state and actions
        participants,
        participantsLoading,
        participantsError,
        refetchParticipants,

        // Create participant function and state
        createParticipant,
        createLoading,
        createError,
        createSuccess,

        // Update results function and state
        updateResults,
        updateLoading,
        updateError,
        updateSuccess,

        // Additional utility functions
        fetchByStartclass,
        fetchParticipant
    };
}

/**
 * Delete functionality
 */
export function useDeleteParticipant() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const deleteParticipant = async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/dashboard/participants/${id}`, {
                method: 'DELETE',
            });

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
        } finally {
            setLoading(false);
        }
    };

    return { deleteParticipant, loading, error, success };
}

// Also update your combined hook to include delete functionality