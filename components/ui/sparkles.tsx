"use client";
import React, { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, SingleOrMultiple } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps) => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadSlim(engine); })
      .then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({ opacity: 1, transition: { duration: 1 } });
    }
  };

  const generatedId = useId();
  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            interactivity: {
              events: { onClick: { enable: true, mode: "push" }, resize: true as any },
              modes: { push: { quantity: 3 } },
            },
            particles: {
              move: {
                enable: true, direction: "none", speed: { min: 0.1, max: 0.8 },
                outModes: { default: "out" },
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 120,
              },
              color: { value: particleColor || "#ffffff" },
              size: { value: { min: minSize || 1, max: maxSize || 2.4 } },
              opacity: { value: { min: 0.08, max: 0.9 }, animation: { enable: true, speed: speed || 3 } },
              links: { enable: false },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};
