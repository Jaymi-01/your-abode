"use client";

import Image from "next/image";
import { House, Bed, MapPin, CheckCircle, Heart } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface PropertyCardProps {
  property: {
    _id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: number;
    images: string[];
    status: string;
    isVerified?: boolean;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useUser();
  const toggleFavorite = useMutation(api.favorites.toggle);
  const isFavorited = useQuery(api.favorites.isFavorite, {
    userId: user?.id || "",
    propertyId: property._id as any,
  });

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await toggleFavorite({
      userId: user.id,
      propertyId: property._id as any,
    });
  };

  return (
    <Link href={`/property/${property._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 h-full cursor-pointer relative"
      >
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={property.images[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          <button 
            onClick={handleFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
              isFavorited ? "bg-primary text-white" : "bg-white/80 text-foreground/40 hover:text-primary"
            }`}
          >
            <Heart size={20} weight={isFavorited ? "fill" : "bold"} />
          </button>

          {property.isVerified && (
            <div className="absolute top-4 left-4">
              <div className="bg-accent/90 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
                <CheckCircle weight="fill" size={14} />
                Verified Home
              </div>
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm">
            <p className="text-primary font-bold text-lg">
              ₦{property.price.toLocaleString()}<span className="text-xs font-normal text-foreground/60">/yr</span>
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col h-[calc(100%-16rem)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-foreground/60 text-sm mb-4">
            <MapPin size={16} />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-foreground/70">
                <Bed size={20} className="text-primary" />
                <span className="font-medium">{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground/70">
                <House size={20} className="text-primary" />
                <span className="font-medium text-xs">Entire Home</span>
              </div>
            </div>
            
            <span className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              Details
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
