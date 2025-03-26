import { compare, hash } from 'bcryptjs';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
// Now you can use prisma.user to access User operations
// And you can use the inferred types like this:
type User = Awaited<ReturnType<typeof prisma.user.findUnique>>

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 10);
}

export async function comparePasswords(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return compare(password, hashedPassword);
}

export function generateToken(
    payload: object,
    expiresIn: string | number = '30d' // Allow string or number
): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    // Convert string durations to seconds if needed
    let expiresInValue: number | undefined;
    if (typeof expiresIn === 'string') {
        // Convert common duration strings to seconds
        if (expiresIn === '30d') expiresInValue = 60 * 60 * 24 * 30; // 30 days in seconds
        else if (expiresIn === '7d') expiresInValue = 60 * 60 * 24 * 7;
        else if (expiresIn === '1d') expiresInValue = 60 * 60 * 24;
        else if (expiresIn === '1h') expiresInValue = 60 * 60;
        else expiresInValue = parseInt(expiresIn); // Attempt to parse as seconds
    } else {
        expiresInValue = expiresIn;
    }

    return sign(payload, secret as Secret, { expiresIn: expiresInValue });
}

export function verifyToken<T>(token: string): T | null {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return verify(token, secret) as T;
    } catch (error) {
        return null;
    }
}

export async function setAuthCookie(token: string) {
    // Add async/await to handle the Promise
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days - long expiration as requested
    });
}

export async function getAuthCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value;
}

export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}

export function generateParticipantToken(): string {
    return uuidv4().replace(/-/g, '');
}

export type SessionUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;

export async function getCurrentUser(): Promise<SessionUser | null> {
    // Make sure to await the Promise
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken<{
        id: string;
        email: string;
        type?: string;
        firstName?: string;
        lastName?: string;
    }>(token);

    if (!payload || payload.type === 'participant') return null;

    return {
        id: payload.id,
        email: payload.email,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
    };
}

export async function getCurrentParticipant() {
    // Make sure to await the Promise
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken<{ id: string; type: string }>(token);
    if (!payload || payload.type !== 'participant') return null;

    return {
        id: payload.id,
    };
}