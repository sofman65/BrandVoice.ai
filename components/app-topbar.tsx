"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";

type Props = { sidebar: React.ReactNode };

export function AppTopbar({ sidebar }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768 && open) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <div className="md:hidden flex items-center justify-between border-b border-white/10 px-4 py-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="text-white">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[18rem] p-0 bg-white/5 backdrop-blur border-white/10">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Brand in the middle */}
      <Logo size="sm" variant="full" tone="gradient" />

      {/* spacer to balance hamburger width */}
      <div className="w-10" />
    </div>
  );
}
