"use client";

import Link from "next/link";
import { House, ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block mb-8">
              <div className="bg-primary/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
                <House size={64} className="text-primary" weight="fill" />
              </div>
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 bg-accent p-3 rounded-2xl shadow-lg"
              >
                <MagnifyingGlass size={24} color="white" weight="bold" />
              </motion.div>
            </div>

            <h1 className="text-5xl font-heading font-black text-foreground mb-4 tracking-tighter">
              404 <span className="text-primary">-</span> Lost?
            </h1>
            <p className="text-xl text-foreground/60 mb-10 leading-relaxed">
              Oops! It looks like this abode doesn't exist. Let's get you back to a warmer place.
            </p>

            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full py-7 text-lg rounded-2xl shadow-xl shadow-primary/20 gap-2">
                  <ArrowLeft weight="bold" /> Back to Marketplace
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full py-7 text-lg rounded-2xl text-foreground/60 hover:text-primary transition-colors">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 text-center text-foreground/20 text-sm">
        © {new Date().getFullYear()} Your Abode Rentals. All rights reserved.
      </footer>
    </div>
  );
}
