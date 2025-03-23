'use client'
import { usePathname } from 'next/navigation'

export default function Auth() {
    const pathname = usePathname().split('/');

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">

                <p>Post: {pathname[3]}</p>

            </div>
        </div>
    )
}
