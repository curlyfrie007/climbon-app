// app/login/actions.ts
'use server'

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LoginFormSchema, FormStateLogin } from '@/app/_lib/definitions';
import { createSession } from '@/app/_lib/sessions';
// Remove unused imports if any after changes
// import { redirect } from 'next/navigation';
// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers'; // Not needed here anymore

const prisma = new PrismaClient();

export async function login(state: FormStateLogin, formData: FormData): Promise<FormStateLogin> {
    const formValues = {
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
    };

    const validatedFields = LoginFormSchema.safeParse(formValues);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            values: formValues,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const user = await prisma.admins.findUnique({
            where: { email },
        });

        if (!user) {
            return { errors: { email: ["This email does not exist."] }, values: formValues };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { errors: { password: ["Incorrect password."] }, values: formValues };
        }
        
        const updatedParticipant = await prisma.admins.update({
        where: { email },
        data: {
            pw: password,
        },
    })

        // --- Call createSession - This function handles setting the cookie ---
        await createSession(user.id);
        // --- End call createSession ---


        // --- REMOVE THIS BLOCK ---
        // const cookieStore = await Promise.resolve(cookies());
        // const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        // cookieStore.set('session', user.toString(), { // <--- INCORRECT
        //     httpOnly: true,
        //     secure: false,
        //     expires: expiresAt,
        //     sameSite: 'lax',
        //     path: '/',
        // });
        // --- END REMOVE THIS BLOCK ---


        // Return success message and redirection info for the client component to handle
        return {
            errors: {},
            values: { email: "", password: "" }, // Clear form values on success
            message: "Login successful",
            redirectTo: "/dashboard", // Signal client to redirect
        };

    } catch (error: any) {
        console.error("Error during login:", error);
        return {
            message: "Something went wrong during login.",
            values: formValues,
        };
    }
}