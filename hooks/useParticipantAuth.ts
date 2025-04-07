// hooks/useParticipantAuth.ts
'use client';

import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook for handling participant authentication
 */
export function useParticipantAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Check if a participant is already logged in
     * @returns {boolean} - Whether the participant is logged in
     */
    const isLoggedIn = useCallback(() => {
        const session = Cookies.get("participant_session");
        if (session) {
            try {
                const parsedSession = JSON.parse(session);
                return Boolean(parsedSession.id && parsedSession.secret);
            } catch (error) {
                console.error("Failed to parse session cookie:", error);
                Cookies.remove("participant_session");
            }
        }
        return false;
    }, []);

    /**
     * Redirects to editor if participant is logged in
     * @param {string} redirectPath - Path to redirect to
     */
    const redirectIfLoggedIn = useCallback((redirectPath: string = "/event/RocklandsCup2025/participant/editor") => {
        if (isLoggedIn()) {
            router.push(redirectPath);
        }
    }, [isLoggedIn, router]);

    /**
     * Login a participant
     * @param {string} name - Participant name
     * @param {string} secret - Participant secret
     * @returns {Promise<boolean>} - Whether the login was successful
     */
    const login = useCallback(async (name: string, secret: string): Promise<boolean> => {
        if (!name.trim() || !secret.trim()) {
            toast.error("Fehlende Angaben", {
                description: "Bitte geben Sie Ihren Namen und Geheimcode ein."
            });
            return false;
        }
        setLoading(true);
        setError(null);

        try {
            // API call to verify participant credentials
            const response = await fetch("/api/dashboard/participants/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, secret })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const data = await response.json();

            // Set the session cookie
            Cookies.set("participant_session", JSON.stringify({
                id: data.id,
                secret: secret
            }), { expires: 30 });

            toast("Anmeldung erfolgreich", {
                description: "Sie werden zur Ergebniseingabe weitergeleitet."
            });

            return true;
        } catch (err: any) {
            const errorMessage = err.message || "Anmeldung fehlgeschlagen";
            setError(errorMessage);
            toast.error("Anmeldung fehlgeschlagen", {
                description: "Name oder Zugangsschlüssel ist ungültig."
            });
            console.error("Login error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Logout a participant
     */
    const logout = useCallback(() => {
        Cookies.remove("participant_session");
        toast("Abgemeldet", {
            description: "Sie wurden erfolgreich abgemeldet."
        });
    }, []);

    /**
     * Get the session data from cookies
     * @returns {Object | null} - Session data or null if not logged in
     */
    const getSessionData = useCallback(() => {
        const session = Cookies.get("participant_session");
        if (session) {
            try {
                return JSON.parse(session);
            } catch (error) {
                console.error("Failed to parse session cookie:", error);
                Cookies.remove("participant_session");
            }
        }
        return null;
    }, []);

    return {
        login,
        logout,
        isLoggedIn,
        redirectIfLoggedIn,
        getSessionData,
        loading,
        error
    };
}