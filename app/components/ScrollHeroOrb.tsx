"use client";

import { useEffect, useRef } from "react";

const DEGREES_PER_PIXEL = 0.16;

export function ScrollHeroOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const updateRotation = () => {
      const rotation = reducedMotion.matches
        ? 0
        : window.scrollY * DEGREES_PER_PIXEL;

      orbRef.current?.style.setProperty(
        "--hero-scroll-rotation",
        `${rotation}deg`,
      );
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
      <span className="hero-tile hero-tile-one" />
      <span className="hero-tile hero-tile-two" />
      <span className="hero-tile hero-tile-three" />
      <span className="hero-ring" />
    </div>
  );
}
