"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from "@/shared/components/auth-wrapper";
import { brandVoiceClerkAppearance } from "@/shared/components/clerk-appearance";

export default function Page() {
  return (
    <AuthWrapper
      title="Create your account"
      subtitle="Start transforming your content instantly"
    >
      <SignUp
        appearance={brandVoiceClerkAppearance}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
      />
    </AuthWrapper>
  );
}
