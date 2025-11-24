"use client";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingWrapper } from "@/shared/components/onboarding-wrapper";
import { QueryProvider } from "@/shared/components/query-provider";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Sora } from "next/font/google";
import { MissionShell } from "@/shared/components/mission-shell";
import { MissionSidebar } from "@/shared/components/mission-sidebar";
import "./globals.css";
import { usePathname } from "next/navigation";

const sora = Sora({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
    return (
    <ClerkProvider
      appearance={{
        elements: { formButtonPrimary: "bg-purple-600 hover:bg-purple-700" },
      }}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={sora.className}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <QueryProvider>
              <SignedIn>
                <OnboardingWrapper>
                  <MissionShell
                    sidebar={<MissionSidebar />}
                    detail={
                      <PageTransition keyRoute={pathname}>
                        {children}
                      </PageTransition>
                    }
                  />
                </OnboardingWrapper>
              </SignedIn>

              <SignedOut>
                <PageTransition keyRoute={pathname}>
                  {children}
                </PageTransition>
              </SignedOut>

              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
