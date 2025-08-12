import { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from "@/components/auth-wrapper";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create account — BrandVoice.ai",
};

const appearance = {
  elements: {
    formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
    card: "bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl",
    headerTitle: "text-white",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border-white/10",
    socialButtonsBlockButtonText: "text-white",
    formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-gray-500",
    formFieldLabel: "text-gray-300",
    formFieldErrorText: "text-rose-300",
    dividerLine: "bg-white/10",
    dividerText: "text-gray-400",
  },
  variables: {
    colorPrimary: "#7c3aed",
    colorBackground: "transparent",
    borderRadius: "12px",
  },
} as const;

export default function Page() {
  return (
    <AuthWrapper title="Create your account" subtitle="3 free missions — no credit card required">
      <div className="space-y-4">
        <SignUp
          appearance={appearance}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
        />

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-purple-300 hover:text-purple-200 underline underline-offset-4">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/legal/terms" className="underline underline-offset-4">Terms</Link> &{" "}
          <Link href="/legal/privacy" className="underline underline-offset-4">Privacy</Link>.
        </p>
      </div>
    </AuthWrapper>
  );
}
