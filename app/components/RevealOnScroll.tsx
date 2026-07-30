"use client";

import { type ReactNode, useEffect, useRef } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

export function RevealOnScroll({
  children,
  className = "",
  stagger = false,
}: RevealOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.14 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`reveal-on-scroll${stagger ? " reveal-stagger" : ""}${
        className ? ` ${className}` : ""
      }`}
      ref={elementRef}
    >
      {children}
    </div>
  );
}
