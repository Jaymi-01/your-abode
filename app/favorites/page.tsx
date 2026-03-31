"use client";

import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart, House } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { user, isLoaded } = useUser();
  const favorites = useQuery(api.favorites.list, { userId: user?.id || "" });

  if (!isLoaded) return <div className="min-h-screen bg-[#FFFBEB] animate-pulse" />;

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-heading font-black text-foreground mb-12 flex items-center gap-4">
          <Heart size={48} className="text-primary" weight="fill" />
          Your Wishlist
        </h1>

        {!user ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-primary/5">
            <UserCircle size={64} className="mx-auto text-primary/20 mb-4" />
            <h2 className="text-2xl font-heading font-black mb-4">Sign in to save properties</h2>
            <p className="text-foreground/60 mb-8 max-w-md mx-auto">
              Keep track of the homes you love by adding them to your favorites.
            </p>
            <Link href="/">
              <Button className="rounded-full px-8">Back to Marketplace</Button>
            </Link>
          </div>
        ) : favorites === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-primary/5">
            <House size={64} className="mx-auto text-primary/20 mb-4" />
            <h2 className="text-2xl font-heading font-black mb-4">Your wishlist is empty</h2>
            <p className="text-foreground/60 mb-8 max-w-md mx-auto">
              You haven't saved any properties yet. Start exploring the marketplace!
            </p>
            <Link href="/">
              <Button className="rounded-full px-8">Explore Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {favorites.map((property) => (
              <PropertyCard key={property!._id} property={property as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { UserCircle } from "@phosphor-icons/react";
