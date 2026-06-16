"use client";

import { LogoMobileRed } from "@/components/ui/icons";
import { useTrackSectionView } from "@/hooks/useTrackSectionView";

const heroStyle = {
  "--hero-fs": "clamp(3.5rem, 12vw, 7.5rem)",
} as React.CSSProperties;

const headingStyle: React.CSSProperties = {
  fontSize: "var(--hero-fs)",
  lineHeight: 1.05,
};

export default function HeroSection() {
  const sectionRef = useTrackSectionView('hero');
  return (
    <section ref={sectionRef} className="w-full py-8 sm:py-14 md:py-20 lg:py-[110px]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col text-left" style={heroStyle}>
          {/* Fila 1: HOY! COMEMOS — columna en móvil, fila en lg+ */}
          <div className="flex flex-col lg:flex-row lg:gap-[0.5em]">
            <h1 style={headingStyle} className="font-extrabold! text-primary-red! m-0!">
              HOY!
            </h1>
            <h1 style={headingStyle} className="font-extrabold! text-primary-red! m-0!">
              COMEMOS
            </h1>
          </div>

          {/* Fila 2: RICO + logos */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-[0.5em]">
            <h2 style={headingStyle} className="font-extrabold! text-primary-red! m-0!">
              RICO
            </h2>

            {/* Logos escalan en proporción al texto via em */}
            <div
              className="flex items-center gap-[0.4em] mt-[0.15em] sm:mt-0"
              style={{ fontSize: "var(--hero-fs)" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{ width: "0.55em", height: "0.83em", display: "inline-flex" }}
                >
                  <LogoMobileRed className="w-full h-full" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
