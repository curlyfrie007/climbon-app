import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ParticipantKeyAlertDialog from "@/components/dashboard/participantKey"

import { SiteHeader } from "@/components/site-header";


export const metadata: Metadata = {
    title: "NextIsAJug",
    description: "Climbing competition management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="max-h-screen">
            <h1 className="p-8 px-6 md:px-10 text-5xl font-bold pb-0">Rocklands Cup 2025</h1>
            <div className="">
                <ParticipantKeyAlertDialog />
                {children}
            </div>
        </div>
    );
}
