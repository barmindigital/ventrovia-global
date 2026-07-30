"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const DEGREES_PER_PIXEL = 0.045;

export function ScrollHeroOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const updateRotation = () => {
      const rotation = reducedMotion.matches
        ? 0
        : Math.min(window.scrollY * DEGREES_PER_PIXEL, 24);
      const scale = reducedMotion.matches
        ? 1
        : Math.min(1 + window.scrollY * 0.00008, 1.045);

      orbRef.current?.style.setProperty(
        "--hero-scroll-rotation",
        `${-rotation}deg`,
      );
      orbRef.current?.style.setProperty("--hero-scroll-scale", `${scale}`);
      animationFrame = 0;
    };

    const requestRotationUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(updateRotation);
      }
    };

    updateRotation();
    window.addEventListener("scroll", requestRotationUpdate, { passive: true });
    reducedMotion.addEventListener("change", requestRotationUpdate);

    return () => {
      window.removeEventListener("scroll", requestRotationUpdate);
      reducedMotion.removeEventListener("change", requestRotationUpdate);
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="hero-orb" ref={orbRef}>
      <Image
        alt="Объёмная красная планета — символ глобальных поставок"
        className="hero-planet"
        draggable={false}
        height={1100}
        priority
        sizes="(max-width: 820px) 88vw, 44vw"
        src="/images/hero/supply-planet.webp"
        unoptimized
        width={1100}
      />
    </div>
  );
}
