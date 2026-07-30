"use client";

import { useEffect, useRef } from "react";

const CANVAS_SIZE = 420;
const RADIANS_PER_PIXEL = 0.0045;

export function ScrollHeroOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!context) {
      return;
    }

    const sourceCanvas = document.createElement("canvas");
    const sourceContext = sourceCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    if (!sourceContext) {
      return;
    }

    const planetImage = new Image();
    let animationFrame = 0;
    let sourcePixels: ImageData | null = null;
    let sourceCenterX = 0;
    let sourceCenterY = 0;
    let sourceRadius = 0;

    const renderPlanet = () => {
      if (!sourcePixels) {
        animationFrame = 0;
        return;
      }

      const angle = reducedMotion.matches
        ? 0
        : window.scrollY * RADIANS_PER_PIXEL;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const output = context.createImageData(CANVAS_SIZE, CANVAS_SIZE);
      const outputPixels = output.data;
      const source = sourcePixels.data;
      const outputRadius = CANVAS_SIZE / 2 - 1;
      const outputCenter = CANVAS_SIZE / 2;

      for (let y = 0; y < CANVAS_SIZE; y += 1) {
        const normalY = (y + 0.5 - outputCenter) / outputRadius;

        for (let x = 0; x < CANVAS_SIZE; x += 1) {
          const normalX = (x + 0.5 - outputCenter) / outputRadius;
          const radiusSquared = normalX * normalX + normalY * normalY;

          if (radiusSquared >= 1) {
            continue;
          }

          const normalZ = Math.sqrt(1 - radiusSquared);
          const objectY = normalY * cosine + normalZ * sine;
          const latitude = Math.asin(objectY) / (Math.PI / 2);
          const sourceX =
            sourceCenterX + normalX * sourceRadius * 0.68;
          const sourceY =
            sourceCenterY + latitude * sourceRadius * 0.68;
          const sourcePixelX = Math.max(
            0,
            Math.min(sourcePixels.width - 1, Math.round(sourceX)),
          );
          const sourcePixelY = Math.max(
            0,
            Math.min(sourcePixels.height - 1, Math.round(sourceY)),
          );
          const sourceIndex =
            (sourcePixelY * sourcePixels.width + sourcePixelX) * 4;
          const outputIndex = (y * CANVAS_SIZE + x) * 4;
          const edgeOpacity = Math.min(1, (1 - radiusSquared) * 70);

          outputPixels[outputIndex] = source[sourceIndex];
          outputPixels[outputIndex + 1] = source[sourceIndex + 1];
          outputPixels[outputIndex + 2] = source[sourceIndex + 2];
          outputPixels[outputIndex + 3] = 255 * edgeOpacity;
        }
      }

      context.putImageData(output, 0, 0);
      orbRef.current?.setAttribute("data-ready", "true");
      animationFrame = 0;
    };

    const requestRotationUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(renderPlanet);
      }
    };

    planetImage.onload = () => {
      sourceCanvas.width = planetImage.naturalWidth;
      sourceCanvas.height = planetImage.naturalHeight;
      sourceContext.drawImage(planetImage, 0, 0);
      sourcePixels = sourceContext.getImageData(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
      );
      sourceCenterX = sourceCanvas.width / 2;
      sourceCenterY = sourceCanvas.height / 2;
      sourceRadius = Math.min(sourceCanvas.width, sourceCanvas.height) / 2 - 2;
      renderPlanet();
    };
    planetImage.src = "/images/hero/supply-planet-transparent.webp";

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
      {/* The image remains as a fast, accessible fallback until the canvas is ready. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Объёмная красная планета — символ глобальных поставок"
        className="hero-planet-fallback"
        draggable={false}
        height={960}
        src="/images/hero/supply-planet-transparent.webp"
        width={960}
      />
      <canvas
        aria-hidden="true"
        className="hero-planet-canvas"
        height={CANVAS_SIZE}
        ref={canvasRef}
        width={CANVAS_SIZE}
      />
    </div>
  );
}
