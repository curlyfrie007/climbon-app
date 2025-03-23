'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/signup/actions";
import { useActionState } from "react";

// Initial state with values to persist input fields
const initialState = {
    errors: {},
    values: {
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        key: "",
    },
};



export function SignupForm() {
    const [state, action, pending] = useActionState(signup, initialState);

    // Use local state for inputs (controlled components)
    const [values, setValues] = useState(initialState.values);

    // Sync state with returned form values
    useEffect(() => {
        if (state?.values) {
            setValues(state.values);
        }
    }, [state]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };



    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">SignUp</CardTitle>
                <CardDescription>Erstelle einen Account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">Vorname</Label>
                            <Input
                                id="firstname"
                                name="firstname"
                                type="text"
                                placeholder="John"
                                required
                                value={values.firstname}
                                onChange={handleChange}
                            />
                            {state?.errors?.firstname && <p>{state.errors.firstname}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Nachname</Label>
                            <Input
                                id="lastname"
                                name="lastname"
                                type="text"
                                placeholder="Doe"
                                required
                                value={values.lastname}
                                onChange={handleChange}
                            />
                            {state?.errors?.lastname && <p>{state.errors.lastname}</p>}
                        </div>

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
                            {state?.errors?.email && <p>{state.errors.email}</p>}
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
                            {state?.errors?.password && <p>{state.errors.password}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="key">Access Key</Label>
                            <Input
                                id="key"
                                name="key"
                                type="string"
                                required
                                value={values.key}
                                onChange={handleChange}
                            />
                            {state?.errors?.key && <p>{state.errors.key}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Submitting..." : "SignUp"}
                        </Button>

                        <div className="mt-4 text-center">
                            <p>
                                Already have an account?{" "}
                                <a href="/login" className="text-blue-500 hover:underline">
                                    Log In
                                </a>
                            </p>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
