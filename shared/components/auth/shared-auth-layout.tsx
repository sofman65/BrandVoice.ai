"use client";

import { SparklesCore } from "@/components/ui/sparkles";
import Image from "next/image";
import { ReactNode } from "react";

interface SharedAuthLayoutProps {
  mode: "sign-in" | "sign-up";
  children: ReactNode; // Clerk form component
}

export function SharedAuthLayout({ mode, children }: SharedAuthLayoutProps) {
  const isSignIn = mode === "sign-in";
  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col lg:flex-row overflow-hidden">
      <style jsx global>{`
        @keyframes scroll-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-infinite {
          animation: scroll-infinite 30s linear infinite;
        }
        .animate-scroll-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
      {/* Background vignette */}
      <div className="absolute inset-0 bg-black/60 [mask-image:radial-gradient(900px_600px_at_25%_45%,transparent,black)]" />
      {/* Left marketing panel (hidden below lg) */}
      <div className="hidden lg:flex relative flex-1 px-8 lg:px-16 py-12 flex-col justify-center items-center gap-12 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center xl:justify-center">
          <div className="relative w-[560px] h-[560px] md:w-[640px] md:h-[640px] xl:w-[780px] xl:h-[780px] opacity-40 xl:-translate-y-16 transition-transform duration-500">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={450}
              className="w-full h-full [mask-image:radial-gradient(circle_at_center,white_28%,transparent_72%)]"
              particleColor="#FFFFFF"
            />
          </div>
        </div>
        <div className="relative z-10 max-w-2xl w-full space-y-10">
          <div>
            <Image
              src="/sl-logo.svg"
              alt="BrandVoice.ai Logo"
              width={96}
              height={96}
              className="dark:invert opacity-90 mx-auto"
              priority
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
              Precision Content Repurposing
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto">
              Transform long‑form intelligence into high‑performance,
              channel‑native assets. Maintain voice integrity. Accelerate
              distribution. Unlock systematic scale.
            </p>
          </div>
          <div className="w-full max-w-2xl mx-auto">
            <ul className="hidden xl:flex flex-wrap justify-center gap-x-12 gap-y-8">
              <FeatureItem
                title="Strategic Repurposing"
                desc="Framework-driven extraction and restructuring of key narratives."
              />
              <FeatureItem
                title="Brand Consistency"
                desc="Adaptive memory preserves tone, lexicon, and positioning."
              />
              <FeatureItem
                title="Channel Optimization"
                desc="Format, length, hooks & CTAs tuned per platform dynamics."
              />
              <FeatureItem
                title="Rapid Experimentation"
                desc="Generate controlled variants for data-backed iteration."
              />
              <FeatureItem
                title="Enterprise Security"
                desc="Isolated processing with strict data handling boundaries."
              />
              <FeatureItem
                title="Scalable Automation"
                desc="Batch workflows & scheduled publishing pipelines."
              />
            </ul>
            <div className="xl:hidden relative overflow-hidden">
              <div className="flex animate-scroll-infinite gap-x-8">
                {FEATURES.concat(FEATURES).map((f, i) => (
                  <FeatureItemCarousel key={i} title={f.title} desc={f.desc} />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Built for teams treating content as an operating system.{" "}
            {isSignIn ? "Sign in" : "Create an account"} to access your
            workspace.
          </p>
        </div>
      </div>
      {/* Right auth panel */}
      <div className="relative z-10 px-6 md:px-10 py-12 flex flex-col lg:items-center lg:justify-center items-center justify-center overflow-hidden bg-purple-600/10 border-t lg:border-t-0 lg:border-l border-purple-500/20 w-full lg:w-auto lg:flex-none min-h-screen lg:min-h-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden">
          <div className="relative w-[480px] h-[480px] sm:w-[560px] sm:h-[560px] opacity-35 -translate-y-8">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={380}
              className="w-full h-full [mask-image:radial-gradient(circle_at_center,white_26%,transparent_70%)]"
              particleColor="#FFFFFF"
            />
          </div>
        </div>
        <div className="lg:hidden w-full flex justify-center mb-12 relative z-10">
          <Image
            src="/sl-logo.svg"
            alt="BrandVoice.ai Logo"
            width={80}
            height={80}
            className="dark:invert opacity-90"
            priority
          />
        </div>
        <div className="space-y-6 relative z-10 w-full max-w-md text-center lg:text-left">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-gray-400 text-sm">
              {isSignIn
                ? "Sign in to access your workspace"
                : "Get started in seconds"}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Strategic Repurposing",
    desc: "Framework-driven extraction and restructuring of key narratives.",
  },
  {
    title: "Brand Consistency",
    desc: "Adaptive memory preserves tone, lexicon, and positioning.",
  },
  {
    title: "Channel Optimization",
    desc: "Format, length, hooks & CTAs tuned per platform dynamics.",
  },
  {
    title: "Rapid Experimentation",
    desc: "Generate controlled variants for data-backed iteration.",
  },
  {
    title: "Enterprise Security",
    desc: "Isolated processing with strict data handling boundaries.",
  },
  {
    title: "Scalable Automation",
    desc: "Batch workflows & scheduled publishing pipelines.",
  },
];

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="w-full sm:w-1/2 xl:w-1/3 px-2 flex">
      <div className="border-l-2 border-white/50 pl-4 py-2 flex flex-col justify-start gap-1 min-h-[68px] w-full">
        <div className="text-sm font-medium text-gray-200 tracking-wide">
          {title}
        </div>
        <div className="text-xs text-gray-500 leading-snug max-w-[260px]">
          {desc}
        </div>
      </div>
    </li>
  );
}

function FeatureItemCarousel({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex-none w-64 px-3">
      <div className="border-l-2 border-white/50 pl-4 py-2 flex flex-col justify-start gap-1 min-h-[68px]">
        <div className="text-sm font-medium text-gray-200 tracking-wide">
          {title}
        </div>
        <div className="text-xs text-gray-500 leading-snug">{desc}</div>
      </div>
    </div>
  );
}
