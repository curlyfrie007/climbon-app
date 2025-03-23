import { z } from "zod";

export const SignupFormSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    key: z.string().min(6, "Acces Key must be at least 6 characters"), // Make it optional if not required
});

export type SignupFormData = z.infer<typeof SignupFormSchema>;

export type FormState =
    | {
        errors?: {
            firstname?: string[];
            lastname?: string[];
            email?: string[];
            password?: string[];
            key?: string[];
        };
        values?: {
            firstname: string;
            lastname: string;
            email: string;
            password: string;
            key: string;
        };
        message?: string;
        redirectTo?: string;
    }
    | undefined;

export type FormStateLogin =
    | {
        errors?: {
            email?: string[];
            password?: string[];
        };
        values?: {
            email: string;
            password: string;
        };
        message?: string;
        redirectTo?: string;
    }
    | undefined;


// Login Schema
export const LoginFormSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;


export type SessionPayload = {
    userId: string | number;
    expiresAt: Date;
};