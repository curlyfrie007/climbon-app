"use server"
import { LoginForm } from "@/components/login-form"

export default async function Auth() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">

                <LoginForm></LoginForm>

            </div>
        </div>
    )
}
