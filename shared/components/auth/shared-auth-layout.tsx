"use client";

import { SparklesCore } from "@/components/ui/sparkles";
import Image from "next/image";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BrandSignature } from "@/shared/components/brand/brand-signature";

interface SharedAuthLayoutProps {
  mode: "sign-in" | "sign-up";
  children: ReactNode; // Clerk form component
}

export function SharedAuthLayout({ mode, children }: SharedAuthLayoutProps) {
  const isSignIn = mode === "sign-in";
  return (
    <div className="relative min-h-screen w-full bg-[#0F0F11] text-white flex flex-col lg:flex-row overflow-hidden">
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

      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />
      <div className="absolute inset-0 backdrop-blur-[18px]" />
      <BrandSignature className="opacity-80" />

      {/* Left marketing panel */}
      <div className="hidden lg:flex relative flex-1 px-10 xl:px-16 py-12 flex-col justify-center gap-12 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
            Premium AI Creator Studio
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(46,230,212,0.7)]" />
            Always-on voice memory
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Image src="/sl-logo.svg" alt="BrandVoice.ai Logo" width={20} height={20} className="dark:invert opacity-90" />
              </div>
              <span className="font-semibold text-white/80">BrandVoice Identity Engine</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white">
                Precision Content Repurposing with{" "}
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                  voice-first intelligence
                </span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
                Transform long-form intelligence into cinematic, channel-native drops. Every hook, CTA, and cadence
                respects your brand&apos;s voice memory—accelerated by spark trails and echo lines that feel unmistakably BrandVoice.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <Pill>Voice-safe processing</Pill>
              <Pill>Dynamic hooks + echoes</Pill>
              <Pill>Format-aware layouts</Pill>
              <Pill>Experiment-ready variants</Pill>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
            className="relative rounded-2xl border border-white/10 bg-white/5 px-8 py-7 backdrop-blur-xl shadow-[0_25px_120px_rgba(0,0,0,0.45)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.25),transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(46,230,212,0.2),transparent_45%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Echo Console</p>
                <p className="text-xl font-semibold text-white">Voice Waves</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-amber-200">
                Live status
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1.4}
                  particleDensity={520}
                  className="w-full h-full [mask-image:radial-gradient(circle_at_center,white_15%,transparent_70%)]"
                  particleColor="#7C3AED"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/10" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.5, 0.9, 0.6] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="absolute inset-x-6 bottom-6 h-[2px] bg-gradient-to-r from-purple-400 via-emerald-300 to-amber-200 blur-sm opacity-90" />
                  <div className="absolute inset-x-8 bottom-8 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {FEATURES.slice(0, 4).map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 * i }}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(255,207,112,0.8)]" />
                      <p className="text-xs text-white/70 uppercase tracking-[0.08em]">{f.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-white/80 leading-snug">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
          }}
          className="relative z-10 grid grid-cols-2 xl:grid-cols-3 gap-4 text-left"
        >
          {FEATURES.map((feature) => (
            <FeatureItem key={feature.title} title={feature.title} desc={feature.desc} />
          ))}
        </motion.ul>
      </div>

      {/* Right auth panel */}
      <div className="relative z-10 px-6 md:px-10 py-12 flex flex-col lg:items-center lg:justify-center items-center justify-center overflow-hidden w-full lg:w-auto lg:flex-none min-h-screen lg:min-h-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-black/30 to-black/70" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden">
          <div className="relative w-[520px] h-[520px] sm:w-[560px] sm:h-[560px] opacity-40 -translate-y-6">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={420}
              className="w-full h-full [mask-image:radial-gradient(circle_at_center,white_20%,transparent_70%)]"
              particleColor="#7C3AED"
            />
          </div>
        </div>
        <div className="lg:hidden w-full flex justify-center mb-12 relative z-10">
          <Image
            src="/sl-logo.svg"
            alt="BrandVoice.ai Logo"
            width={84}
            height={84}
            className="dark:invert opacity-90"
            priority
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6 relative z-10 w-full max-w-md text-center lg:text-left rounded-2xl border border-white/10 bg-white/5 px-6 py-7 backdrop-blur-xl shadow-[0_25px_120px_rgba(0,0,0,0.45)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.18),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(46,230,212,0.22),transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">
              {isSignIn ? "Return to your studio" : "Step inside"}
            </p>
            <h2 className="text-2xl font-semibold">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-gray-300 text-sm">
              {isSignIn
                ? "Sign in to access your workspace"
                : "Get started in seconds"}
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl border border-purple-400/10" />
            <div className="relative">{children}</div>
          </div>
          <div className="relative space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(124,58,237,0.7)]" />
              <p className="font-medium text-white/80">Secured by BrandVoice identity layer</p>
            </div>
            <p className="text-xs text-white/50">
              Built for teams treating content as an operating system. {isSignIn ? "Sign in" : "Create an account"} to access your workspace.
            </p>
          </div>
        </motion.div>
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
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_12px_50px_rgba(0,0,0,0.35)] hover:border-purple-400/30"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-white tracking-tight">
          {title}
        </div>
        <div className="text-xs text-white/65 leading-snug">
          {desc}
        </div>
      </div>
    </motion.li>
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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(255,207,112,0.8)]" />
      {children}
    </span>
  );
}
