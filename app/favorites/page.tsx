"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart, House, ChatCircleDots, UserCircle, MapPin, CalendarBlank, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function InquiryItem({ inquiry }: { inquiry: any }) {
  const property = useQuery(api.properties.getById, { id: inquiry.propertyId });

  if (!property) return null;

  return (
    <Link href={`/dashboard/inbox/${inquiry._id}`}>
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-border/50 hover:shadow-lg transition-all flex flex-col md:flex-row gap-4 md:gap-6 items-center group relative">
        <div className="w-full md:w-32 h-32 md:h-24 rounded-2xl overflow-hidden shrink-0 relative">
          <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-lg md:text-xl group-hover:text-primary transition-colors truncate pr-2">{property.title}</h3>
            <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
              inquiry.status === "pending" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
            }`}>
              {inquiry.status}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-foreground/40 font-medium">
            <div className="flex items-center gap-1"><MapPin size={16} /> {property.location}</div>
            {inquiry.viewingDate && <div className="flex items-center gap-1"><CalendarBlank size={16} /> Viewing: {inquiry.viewingDate}</div>}
          </div>
        </div>
        <CaretRight size={24} className="hidden md:block text-foreground/20 group-hover:text-primary transition-colors" weight="bold" />
      </div>
    </Link>
  );
}

export default function FavoritesPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<"favorites" | "inbox">("inbox");
  
  const favorites = useQuery(api.favorites.list, { userId: user?.id || "" });
  const inquiries = useQuery(api.inquiries.listAllForUser, { userId: user?.id || "" });

  if (!isLoaded) return <div className="min-h-screen bg-[#FFFBEB] animate-pulse" />;

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground flex items-center gap-4">
            {activeTab === "favorites" ? (
              <Heart size={48} className="text-primary hidden sm:block" weight="fill" />
            ) : (
              <ChatCircleDots size={48} className="text-primary hidden sm:block" weight="fill" />
            )}
            {activeTab === "favorites" ? "Your Wishlist" : "Your Inbox"}
          </h1>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border/50 self-start">
            <button 
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "inbox" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <ChatCircleDots weight="bold" /> Inbox
            </button>
            <button 
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "favorites" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <Heart weight="bold" /> Favorites
            </button>
          </div>
        </div>

        {!user ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-primary/5">
            <UserCircle size={64} className="mx-auto text-primary/20 mb-4" />
            <h2 className="text-2xl font-heading font-black mb-4">Sign in to view this page</h2>
            <Link href="/">
              <Button className="rounded-full px-8">Back to Marketplace</Button>
            </Link>
          </div>
        ) : activeTab === "favorites" ? (
          favorites === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-primary/5">
              <House size={64} className="mx-auto text-primary/20 mb-4" />
              <h2 className="text-2xl font-heading font-black mb-4">Your wishlist is empty</h2>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                You haven't saved any properties yet.
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
          )
        ) : (
          <div className="space-y-4 max-w-4xl">
            {inquiries === undefined ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
            ) : inquiries.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-primary/5">
                <ChatCircleDots size={64} className="mx-auto text-primary/20 mb-4" />
                <h2 className="text-2xl font-heading font-black mb-4">No conversations yet</h2>
                <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                  When you send an inquiry about a property, it will appear here.
                </p>
                <Link href="/">
                  <Button className="rounded-full px-8">Find a home</Button>
                </Link>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <InquiryItem key={inquiry._id} inquiry={inquiry} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
