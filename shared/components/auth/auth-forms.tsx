"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

const sharedAppearance = {
  elements: {
    formButtonPrimary:
      "bg-purple-600 hover:bg-purple-700 text-white font-semibold mx-auto",
    card: "bg-transparent border-0 shadow-none p-0 rounded-none backdrop-blur-none ring-0",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "hidden",
    footerAction__signIn: "hidden",
    footerActionText: "hidden",
    footerActionLink: "hidden",
    devModeBadge: "hidden",
    socialButtonsBlockButton:
      "bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-600/50 font-medium",
    socialButtonsBlockButtonText: "text-white",
    formFieldInput:
      "bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
    formFieldLabel: "text-gray-100 font-medium text-center lg:text-left",
    identityPreviewText: "text-gray-100",
    formFieldErrorText: "text-red-300",
    dividerLine: "bg-gray-600/40",
    dividerText: "text-gray-300",
    rootBox: "mx-auto",
  },
  variables: {
    colorPrimary: "#7c3aed",
    colorBackground: "transparent",
    borderRadius: "0px",
  },
} as const;

function useClerkMounted(selector: string) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (document.querySelector(selector)) {
      setMounted(true);
      return;
    }
    const obs = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        setMounted(true);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [selector]);
  return mounted;
}

function DesktopSkeleton({ variant }: { variant: "sign-in" | "sign-up" }) {
  const isSignUp = variant === "sign-up";
  const containerHeight = variant === "sign-in" ? "h-[214px]" : "h-[294px]";
  return (
    <div
      className={`hidden xl:block w-[402px] ${containerHeight} overflow-hidden`}
      aria-hidden
    >
      <div className="flex flex-col">
        {/* Social button */}
        <div className="h-10 bg-gray-800/40" />
        <div className="h-3" />
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800/40" />
          <div className="w-5 h-3 bg-gray-800/40" />
          <div className="flex-1 h-px bg-gray-800/40" />
        </div>
        <div className="h-3" />
        {/* Fields */}
        <div className="h-10 bg-gray-800/40" />
        <div className="h-2" />
        <div className="h-10 bg-gray-800/40" />
        {isSignUp && (
          <>
            <div className="h-2" />
            <div className="h-10 bg-gray-800/40" />
          </>
        )}
        <div className="h-3" />
        {/* Submit */}
        <div className="h-10 bg-gray-800/40" />
        {/* Flexible spacer to fill remaining reserved height */}
        <div className="flex-1" />
      </div>
    </div>
  );
}

export function SignInForm() {
  const ready = useClerkMounted('[data-clerk-component="SignIn"]');
  return (
    <>
      <div className="mx-auto flex justify-center w-full xl:w-[402px]">
        {!ready && <DesktopSkeleton variant="sign-in" />}
        <div className={!ready ? "hidden xl:block" : "w-full"}>
          <SignIn
            appearance={sharedAppearance}
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
          />
        </div>
      </div>
      <div className="space-y-4 text-center lg:text-left">
        <p className="text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-purple-300 hover:text-purple-200 underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/legal/privacy" className="underline underline-offset-4">
            Privacy
          </Link>
          .
        </p>
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} BrandVoice.ai
        </p>
      </div>
    </>
  );
}

export function SignUpForm() {
  const ready = useClerkMounted('[data-clerk-component="SignUp"]');
  return (
    <>
      <div className="mx-auto flex justify-center w-full xl:w-[402px]">
        {!ready && <DesktopSkeleton variant="sign-up" />}
        <div className={!ready ? "hidden xl:block" : "w-full"}>
          <SignUp
            appearance={sharedAppearance}
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            afterSignUpUrl="/"
          />
        </div>
      </div>
      <div className="space-y-4 text-center lg:text-left">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-purple-300 hover:text-purple-200 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/legal/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/legal/privacy" className="underline underline-offset-4">
            Privacy
          </Link>
          .
        </p>
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} BrandVoice.ai
        </p>
      </div>
    </>
  );
}
