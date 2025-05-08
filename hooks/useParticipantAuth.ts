// hooks/useParticipantAuth.ts
'use client';

import { useState, useCallback, useEffect } from 'react'; // Added useEffect
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StartclassKKFN } from './useParticipants'; // Import the type if needed elsewhere

// Define the expected structure from the verify endpoint
type VerifyResponse = {
    id: string;
    name: string;
    startclass: StartclassKKFN;
    message: string;
}

// Define the structure stored in the cookie
type ParticipantSession = {
    id: string;
    secret: string;
    name?: string;       // Optional: store name for convenience
    startclass?: StartclassKKFN; // Optional: store startclass
}

/**
 * Hook for handling participant authentication for a specific event
 * @param {string} eventBasePath - e.g., "/event/KKFN2025"
 */
export function useParticipantAuth(eventBasePath: string = "/event/KKFN2025") { // Make event path configurable
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginPath = `${eventBasePath}/participant/login`;
    const editorPath = `${eventBasePath}/participant/editor`;
    const cookieName = `participant_session_${eventBasePath.replace(/\//g, '_')}`; // Event-specific cookie

    const isLoggedIn = useCallback(() => {
        const session = Cookies.get(cookieName);
        if (session) {
            try {
                const parsedSession: ParticipantSession = JSON.parse(session);
                // Basic check for essential fields
                return Boolean(parsedSession.id && parsedSession.secret);
            } catch (e) {
                console.error("Failed to parse session cookie:", e);
                Cookies.remove(cookieName); // Clean up invalid cookie
            }
        }
        return false;
    }, [cookieName]);

    const redirectIfLoggedIn = useCallback(() => {
        if (isLoggedIn()) {
            router.push(editorPath); // Redirect to the editor path for this event
        }
    }, [isLoggedIn, router, editorPath]);

    // Redirect on initial load if already logged in
    useEffect(() => {
        // Avoid redirecting if already on the editor page
        if (window.location.pathname !== editorPath) {
             redirectIfLoggedIn();
        }
    }, [redirectIfLoggedIn, editorPath]);


    const login = useCallback(async (name: string, secret: string): Promise<boolean> => {
        if (!name.trim() || !secret.trim()) { /* ... */ return false; }
        setLoading(true); setError(null);

        try {
            const response = await fetch("/api/dashboard/participants/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, secret })
            });

             if (!response.ok) {
                // Handle specific errors like 401 Unauthorized
                if (response.status === 401) {
                     throw new Error('Invalid name or secret');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const data: VerifyResponse = await response.json();

            // Store essential data in the cookie
            const sessionData: ParticipantSession = {
                id: data.id,
                secret: secret, // Store the secret used for login
                name: data.name, // Store name
                startclass: data.startclass // Store startclass
            };
            Cookies.set(cookieName, JSON.stringify(sessionData), { expires: 30 }); // Use event-specific cookie

            toast("Anmeldung erfolgreich", { description: "Sie werden zur Ergebniseingabe weitergeleitet." });
            router.push(editorPath); // Redirect after successful login
            return true;
        } catch (err: any) {
            const errorMessage = err.message || "Anmeldung fehlgeschlagen";
            setError(errorMessage);
            toast.error("Anmeldung fehlgeschlagen", { description: errorMessage === 'Invalid name or secret' ? errorMessage : "Bitte überprüfen Sie Ihre Eingaben." });
            console.error("Login error:", err);
            return false;
        } finally { setLoading(false); }
    }, [cookieName, editorPath, router]);

    const logout = useCallback(() => {
        Cookies.remove(cookieName); // Remove event-specific cookie
        toast("Abgemeldet", { description: "Sie wurden erfolgreich abgemeldet." });
        router.push(loginPath); // Redirect to login page for this event
    }, [cookieName, loginPath, router]);

    const getSessionData = useCallback((): ParticipantSession | null => {
        const session = Cookies.get(cookieName);
        if (session) {
            try { return JSON.parse(session); }
            catch (e) { Cookies.remove(cookieName); }
        }
        return null;
    }, [cookieName]);

    return { login, logout, isLoggedIn, redirectIfLoggedIn, getSessionData, loading, error };
}