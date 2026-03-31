"use client";

import Link from "next/link";
import { House, List, UserCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-6 transition-transform">
            <House size={24} color="#FFFBEB" weight="fill" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tighter text-foreground">
            Your <span className="text-primary">Abode</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="font-medium text-foreground/80 hover:text-primary transition-colors">
            Marketplace
          </Link>
          {isLoaded && isSignedIn && (
            <Link href="/dashboard" className="font-medium text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
          <Link href="/favorites" className="font-medium text-foreground/80 hover:text-primary transition-colors">
            Favorites
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
          ) : !isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-foreground/80">
                  <UserCircle size={20} />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full px-6 py-6 shadow-lg shadow-primary/20">
                  List Your Property
                </Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link href="/dashboard/list-new">
                <Button className="hidden sm:flex rounded-full px-6 py-6 shadow-lg shadow-primary/20">
                  List Your Property
                </Button>
              </Link>
              <UserButton />
            </>
          )}
          <button className="md:hidden p-2 text-foreground/80">
            <List size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
