"use client";
import { SparklesCore } from "@/components/ui/sparkles";
import Image from "next/image";
import React from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthWrapper({
  children,
  title = "BrandVoice.ai",
  subtitle,
}: AuthWrapperProps) {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background Sparkles */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1000}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Gentle radial mask for readability */}
      <div className="pointer-events-none absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(420px_260px_at_center,transparent_25%,white)]" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-md mx-auto px-6">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/sl-logo.svg"
              alt="BrandVoice.ai Logo"
              width={72}
              height={72}
              className="opacity-90"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>

          {subtitle && <p className="text-gray-300 text-lg">{subtitle}</p>}
        </div>

        {/* Auth (no extra card to avoid double frame) */}
        <div className="">{children}</div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Powered by{" "}
            <span className="text-purple-400 font-semibold">
              Sofianos Lampropoulos
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
