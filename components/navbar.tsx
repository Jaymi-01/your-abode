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
            className="md:hidden p-2 text-foreground/80 hover:bg-secondary/50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <List size={28} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-border/50">
                <span className="font-heading font-black text-xl tracking-tighter text-foreground">
                  Menu
                </span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-foreground/40 hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all"
                >
                  <X size={24} weight="bold" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-2 mb-4">Explore</p>
                  <Link 
                    href="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-primary/5 hover:text-primary transition-all font-bold group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      <House size={20} weight="bold" />
                    </div>
                    Marketplace
                  </Link>
                </div>

                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-2 mb-4">Your Account</p>
                  {isSignedIn ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-primary/5 hover:text-primary transition-all font-bold group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          <Layout size={20} weight="bold" />
                        </div>
                        Dashboard
                      </Link>
                      <Link 
                        href="/favorites" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-primary/5 hover:text-primary transition-all font-bold group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          <ChatCircleDots size={20} weight="bold" />
                        </div>
                        Inbox & Activity
                      </Link>
                      <Link 
                        href="/dashboard/list-new" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all font-bold"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <Plus size={20} weight="bold" />
                        </div>
                        List New Property
                      </Link>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full py-7 rounded-2xl text-lg font-bold">
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="w-full py-7 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                          Join Your Abode
                        </Button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest border-t border-border/50">
                © 2026 Your Abode Rentals
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
