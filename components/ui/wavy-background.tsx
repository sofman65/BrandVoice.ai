"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

type Speed = "slow" | "fast";

interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: Speed;
  waveOpacity?: number;
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
}: WavyBackgroundProps) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSafari, setIsSafari] = useState(false);
  const animationId = useRef<number>();

  const getSpeed = () => (speed === "slow" ? 0.001 : 0.002);

  const waveColors =
    colors ??
    ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee", "#7C3AED"];

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    nt: { value: number },
    n: number
  ) => {
    nt.value += getSpeed();
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (let x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt.value) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nt = { value: 0 };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.filter = `blur(${blur}px)`;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    const render = () => {
      const { width, height } = canvas;
      ctx.fillStyle = backgroundFill || "rgba(0,0,0,1)";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, width, height);
      drawWave(ctx, width, height, nt, 5);
      animationId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      ro.disconnect();
    };
  }, [backgroundFill, blur, speed, waveWidth, waveOpacity, waveColors, noise]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
