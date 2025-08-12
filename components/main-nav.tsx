"use client"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export function MainNav() {
  return (
    <header className="flex items-center justify-between py-3">
      <Link href="/" className="font-semibold">BrandVoice.ai</Link>
      <div className="flex items-center gap-3">
        <SignedIn>
          <UserButton userProfileUrl="/user-profile" afterSwitchSessionUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  )
}


