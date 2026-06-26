"use client";

import MenuSection from "@/components/home/menuSection";
import HeroSection from "@/components/home/heroSection";
import ConfettiExplosion from "@/components/confetti/ConfettiExplosion";
import { useEffect, useState } from "react";

export default function Home() {
  const [boom, setBoom] = useState(false);

  const lanzarConfetti = () => {
    setBoom(true);
    setTimeout(() => setBoom(false), 200);
  };

  useEffect(() => {
    lanzarConfetti();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full items-end bg-white overflow-visible">
      <main className="flex-1 flex flex-col w-full items-center">
        <MenuSection />
        <HeroSection />
        {/* <ValuesSection /> */}
        {/* <StorySection /> */}
      </main>
      <ConfettiExplosion trigger={boom} />
    </div>
  );
}
