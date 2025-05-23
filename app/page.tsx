"use client"
import Image from "next/image";
//import { useRouter } from "next/navigation";

export default function Home() {
  //const router = useRouter();
  //router.push("/event/RocklandsCup2025");
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <a href="/event/RocklandsCup2025">Rocklands Cup 2025</a>
      </main>
      
    </div>
  );
}
