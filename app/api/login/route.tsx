// File: app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/_lib/sessions";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const formData = await request.formData();
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    // Perform login logic
    try {
        const user = await prisma.admins.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "Email not found" }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
        }

        await createSession(user.id);
        return NextResponse.redirect("/dashboard"); // Redirect on success
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
