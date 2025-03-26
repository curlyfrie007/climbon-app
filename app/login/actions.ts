'use server'

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LoginFormSchema, FormStateLogin } from '@/app/_lib/definitions'; // Import login schema
import { createSession } from '@/app/_lib/sessions';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function login(state: FormStateLogin, formData: FormData): Promise<FormStateLogin> {
    const formValues = {
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
    };

    // Validate the form fields
    const validatedFields = LoginFormSchema.safeParse(formValues);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            values: formValues,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        // Check if the user exists
        const user = await prisma.admins.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                errors: { email: ["This email does not exist."] },
                values: formValues,
            };
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                errors: { password: ["Incorrect password."] },
                values: formValues,
            };
        }

        // The createSession function now returns a result instead of redirecting
        const sessionResult = await createSession(user.id);
        console.log("User logged in:", user);

        // Return success message and redirection info
        return {
            errors: {},
            values: { email: "", password: "" },
            message: "Login successful", // Success message
            redirectTo: "/dashboard",
        };
    } catch (error: any) {
        console.error("Error during login:", error);
        return {
            message: "Something went wrong during login.",
            values: formValues,
        };
    }
}