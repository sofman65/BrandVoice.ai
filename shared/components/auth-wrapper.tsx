"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WavyBackground } from "@/components/ui/wavy-background";

interface AuthWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthWrapper({
  children,
  title = "Welcome back",
  subtitle = "Sign in to your BrandVoice studio",
}: AuthWrapperProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#08070C] text-white overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">

        {/* ========================================================= */}
        {/* LEFT PANEL — SHARP WAVES (VISIBLE + INTENSE)             */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden bg-[#08070C]">

          {/* Stars */}
        

          {/* Logo */}
          <div className="relative z-20 px-10 pt-10">
            <span className="text-3xl font-semibold tracking-tight">
              <span className="text-white">Brand</span>
              <span className="text-white drop-shadow-[0_0_14px_rgba(124,58,237,0.8)]">
                Voice
              </span>
            </span>
          </div>

          <div className="relative z-20 px-6 sm:px-8 lg:px-10 pt-10 lg:pt-12 pb-14 max-w-xl space-y-4 flex flex-col">
            <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-tight">
              Precision content repurposing for teams with a signature voice.
            </p>
            <p className="text-sm text-white/65 leading-relaxed max-w-xl">
              Voice-safe pipelines, adaptive tone memory, and cinematic hooks that
              keep every drop on-brand—across LinkedIn, Threads, YouTube, and beyond.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              <span className="rounded-full bg-white/10 px-3 py-1 border border-white/10">
                Voice memory
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 border border-white/10">
                Channel tuning
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 border border-white/10">
                Experiment-ready
              </span>
            </div>
            <div className="space-y-2 pt-4">
              <TextGenerateEffect
                words="Your voice. Everywhere. Effortlessly."
                className="text-lg sm:text-xl font-semibold text-white drop-shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                duration={0.6}
              />
              <p className="text-xs text-white/65">
                AI-crafted, brand-true drops—ready for every channel.
              </p>
            </div>
          </div>

          {/* Elegant left waves */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.32] lg:opacity-[0.38] mix-blend-screen">
            <WavyBackground
              waveOpacity={0.24}
              blur={10}
              waveWidth={16}
              speed="slow"
              backgroundFill="transparent"
              colors={["#9B5BFF", "#7C3AED", "#2EE6D4", "#86D1FF"]}
              className="absolute inset-0"
            />
          </div>


          {/* Soft dark vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,transparent,rgba(0,0,0,0.55))]" />
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL — BLURRED WAVE CONTINUATION                  */}
        {/* ========================================================= */}
        <div className="relative flex items-center justify-center bg-[#0A0910] px-4 sm:px-6 py-10 overflow-hidden">

          {/* Divider */}
          <div className="hidden lg:block absolute left-0 top-0 h-full w-px bg-white/10 z-20" />

          {/* Right blurred continuation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Big blurred continuation */}
            {/* <div className="absolute inset-0 opacity-[0.55] mix-blend-screen">
              <WavyBackground
                waveOpacity={0.45}
                blur={85}
                waveWidth={60}
                speed="slow"
                backgroundFill="transparent"
                colors={["#9B5BFF", "#7C3AED", "#2EE6D4", "#86D1FF"]}
                className="absolute inset-0"
              />
            </div> */}

            {/* Purple glow behind card */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(160,60,255,0.27),transparent_70%)]" /> */}

            {/* Dark wash to clean the glass */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Masked blur to ensure the form remains readable */}
            <div className="absolute inset-0 backdrop-blur-[28px] [mask-image:linear-gradient(to_left,black_30%,transparent)]" />
          </div>

          {/* FORM */}
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 space-y-2 text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">
                Return to your studio
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-white/65">{subtitle}</p>
              )}
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-7 shadow-[0_25px_120px_rgba(0,0,0,0.6)] space-y-5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-white/5 pointer-events-none" />
              <div className="relative space-y-4">{children}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
