"use client"
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export function MainNav() {
  return (
    <nav className="flex items-center justify-between w-full">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative p-1">
          <Image
            src="/sl-logo.svg"
            alt="BrandVoice.ai Logo"
            width={40}
            height={40}
            className="dark:invert transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            BrandVoice.ai
          </span>
          <span className="text-xs text-gray-400 -mt-1">Content Repurposer</span>
        </div>
      </Link>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-all">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/" 
            userProfileUrl="/user-profile"
          />
        </SignedIn>
      </div>
    </nav>
  );
}


