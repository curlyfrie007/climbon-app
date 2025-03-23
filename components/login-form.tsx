'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/login/actions";
import { useActionState } from "react";

// Initial state with values to persist input fields
const initialState = {
    errors: {},
    values: {
        email: "",
        password: "",
    },
};

export function LoginForm() {
    const [state, action, pending] = useActionState(login, initialState);
    const [values, setValues] = useState(initialState.values);
    const router = useRouter();

    // Sync state with returned form values
    useEffect(() => {
        if (state?.values) {
            setValues(state.values);
        }

        // Check for redirectTo property and redirect if present
        if (state?.redirectTo) {
            console.log(`Redirecting to: ${state.redirectTo}`);
            router.push(state.redirectTo);
        }
        // Fallback for backward compatibility
        // else if (state?.message === "Login successful") {
        //     router.push('/dashboard');
        // }
    }, [state, router]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Log into your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={values.email}
                                onChange={handleChange}
                            />
                            {state?.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={values.password}
                                onChange={handleChange}
                            />
                            {state?.errors?.password && (
                                <p className="text-sm text-red-500">{state.errors.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Logging in..." : "Login"}
                        </Button>

                        {state?.message && !state.redirectTo && (
                            <p className="text-sm text-center text-green-500">{state.message}</p>
                        )}

                        <div className="mt-4 text-center">
                            <p>
                                Don't have an account?{" "}
                                <a href="/signup" className="text-blue-500 hover:underline">
                                    Sign Up
                                </a>
                            </p>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}