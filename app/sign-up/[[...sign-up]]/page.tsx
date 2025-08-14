"use client";

import { SignUpForm } from "@/components/auth/auth-forms";
import { SharedAuthLayout } from "@/components/auth/shared-auth-layout";

export default function Page() {
  return (
    <SharedAuthLayout mode="sign-up">
      <SignUpForm />
    </SharedAuthLayout>
  );
}
