import 'server-only';

import type { SessionPayload } from '@/app/_lib/definitions';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Check if secret key exists and throw a clear error if not
const secretKey = process.env.SECRET;
if (!secretKey) {
    throw new Error('Missing SECRET environment variable. Please set it in your .env file.');
}

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1hr')
        .sign(key);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt });

    // Get the cookies store - await if it's a Promise
    const cookieStore = await Promise.resolve(cookies());

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: false,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });


    // Don't redirect here - let the calling function handle redirection
    return { success: true, redirectTo: '/dashboard' };
}

export async function verifySession() {
    // Get the cookies store - await if it's a Promise
    const cookieStore = await Promise.resolve(cookies());
    const cookie = cookieStore.get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
        return { isAuth: false };
    }

    return { isAuth: true, userId: Number(session.userId) };
}

export async function updateSession() {
    // Get the cookies store - await if it's a Promise
    const cookieStore = await Promise.resolve(cookies());
    const session = cookieStore.get('session')?.value;
    const payload = await decrypt(session);

    if (!session || !payload) {
        return null;
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expires,
        sameSite: 'lax',
        path: '/',
    });
}

export async function deleteSession() {
    // Get the cookies store - await if it's a Promise
    const cookieStore = await Promise.resolve(cookies());
    cookieStore.delete('session');

    // Don't redirect here - let the calling function handle redirection
    return { success: true, redirectTo: '/login' };
}