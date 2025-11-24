"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthWrapper } from "@/shared/components/auth-wrapper";
import { brandVoiceClerkAppearance } from "@/shared/components/clerk-appearance";

export default function Page() {
  return (
    <AuthWrapper
      title="Welcome back"
      subtitle="Sign in to your BrandVoice studio"
    >
      <SignIn
        appearance={brandVoiceClerkAppearance}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
      />
    </AuthWrapper>
  );
}
