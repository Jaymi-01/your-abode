"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, ShieldCheck, House, MapPin, CalendarBlank } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function OwnerProfilePage() {
  const params = useParams();
  const clerkId = params.clerkId as string;

  const owner = useQuery(api.users.getByClerkId, { clerkId });
  const properties = useQuery(api.properties.listByOwner, { ownerId: clerkId });

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-primary/5 border border-primary/5 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
                {owner?.imageUrl ? (
                  <Image src={owner.imageUrl} alt={owner.name} fill className="object-cover" />
                ) : (
                  <UserCircle size={80} weight="fill" />
                )}
              </div>
              {owner?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg border-4 border-white z-20">
                  <ShieldCheck size={24} weight="fill" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl font-heading font-black text-foreground">
                  {owner === undefined ? <Skeleton className="h-10 w-48" /> : owner?.name || "Owner Profile"}
                </h1>
                {owner?.isVerified && (
                  <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck weight="fill" />
                    Verified Partner
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-foreground/60 font-medium">
                <div className="flex items-center gap-2">
                  <House size={20} className="text-primary" />
                  <span>{properties?.length || 0} Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarBlank size={20} className="text-primary" />
                  <span>Joined March 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owner's Properties */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-black flex items-center gap-3">
              <House size={32} className="text-primary" weight="fill" />
              Properties by this owner
            </h2>
          </div>

          {properties === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-3xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-border/50">
              <House size={64} className="mx-auto text-primary/20 mb-4" />
              <p className="text-xl font-heading font-bold text-foreground/40">No active listings at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {properties.map((property) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard property={property as any} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
