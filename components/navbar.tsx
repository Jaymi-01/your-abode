"use client";

import { useState } from "react";
import Link from "next/link";
import { House, List, X, UserCircle, ChatCircleDots, Heart, Layout, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="font-medium text-foreground/80 hover:text-primary transition-colors">
            Marketplace
          </Link>
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="font-medium text-foreground/80 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/favorites" className="font-medium text-foreground/80 hover:text-primary transition-colors">
                Inbox
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
          ) : !isSignedIn ? (
            <div className="hidden sm:flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="ghost" className="items-center gap-2 text-foreground/80">
                  <UserCircle size={20} />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full px-6 py-6 shadow-lg shadow-primary/20">
                  List Your Property
                </Button>
              </SignUpButton>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard/list-new" className="hidden sm:block">
                <Button className="rounded-full px-6 py-6 shadow-lg shadow-primary/20">
                  List Your Property
                </Button>
              </Link>
              <UserButton />
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground/80 hover:bg-secondary/50 rounded-xl transition-colors z-[80]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={28} weight="bold" />
            ) : (
              <List size={28} weight="bold" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[60] md:hidden"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-20 left-4 right-4 bg-white z-[70] md:hidden shadow-2xl rounded-3xl border border-border/50 overflow-hidden flex flex-col p-2"
            >
              <div className="flex flex-col gap-1">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-all font-bold group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <House size={20} weight="bold" />
                  </div>
                  Marketplace
                </Link>

                {isSignedIn && (
                  <>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-all font-bold group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <Layout size={20} weight="bold" />
                      </div>
                      Dashboard
                    </Link>
                    <Link 
                      href="/favorites" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-all font-bold group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChatCircleDots size={20} weight="bold" />
                      </div>
                      Inbox & Activity
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-2 p-2 pt-4 border-t border-border/50">
                {isSignedIn ? (
                  <Link 
                    href="/dashboard/list-new" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all font-bold text-lg"
                  >
                    <Plus size={20} weight="bold" />
                    List Property
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="w-full py-6 rounded-2xl font-bold">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Join
                      </Button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
