"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Bed, House, CheckCircle, ChatCircleDots, CurrencyNgn, ArrowLeft, CalendarBlank } from "@phosphor-icons/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function PropertyDetails() {
  const { id } = useParams();
  const property = useQuery(api.properties.getById, { id: id as any });
  const submitInquiry = useMutation(api.inquiries.submit);
  const { user } = useUser();
  const [inquirySent, setInquirySent] = useState(false);

  if (property === undefined) return <div className="min-h-screen bg-[#FFFBEB] animate-pulse" />;
  if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found.</div>;

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await submitInquiry({
        propertyId: property._id,
        renterName: user?.fullName || (formData.get("name") as string),
        renterEmail: user?.primaryEmailAddress?.emailAddress || (formData.get("email") as string),
        message: formData.get("message") as string,
        viewingDate: formData.get("viewingDate") as string || undefined,
      });
      setInquirySent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="relative col-span-2 md:col-span-1 h-full rounded-3xl overflow-hidden shadow-lg">
                <Image 
                  src={property.images[0]} 
                  alt={property.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="hidden md:grid grid-rows-2 gap-4 h-full">
                {property.images.slice(1, 3).map((img, i) => (
                  <div key={i} className="relative h-full rounded-3xl overflow-hidden shadow-md">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
                {!property.images[1] && (
                   <div className="relative h-full rounded-3xl overflow-hidden bg-secondary/30 flex items-center justify-center">
                    <House size={48} className="text-primary/20" />
                  </div>
                )}
                {!property.images[2] && (
                   <div className="relative h-full rounded-3xl overflow-hidden bg-secondary/30 flex items-center justify-center">
                    <House size={48} className="text-primary/20" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground">
                  {property.title}
                </h1>
                {property.isVerified && (
                  <div className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <CheckCircle weight="fill" />
                    Verified House
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-foreground/60 mb-8">
                <MapPin size={24} className="text-primary" />
                <span className="text-lg font-medium">{property.location}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border/50">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Bedrooms</p>
                  <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                    <Bed size={24} className="text-primary" />
                    {property.bedrooms} Beds
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Type</p>
                  <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                    <House size={24} className="text-primary" />
                    Entire Home
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Price</p>
                  <div className="flex items-center gap-2 text-primary font-black text-2xl">
                    <CurrencyNgn size={28} />
                    ₦{property.price.toLocaleString()}/yr
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-heading font-black mb-4">About this home</h2>
                <p className="text-foreground/70 leading-relaxed text-lg whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-heading font-black mb-6">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(property.amenities.length > 0 ? property.amenities : ["Wi-Fi", "24/7 Power", "Security", "Parking", "Water"]).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 text-foreground/80 font-medium">
                      <CheckCircle size={20} className="text-accent" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Inquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-2xl shadow-primary/10 border border-primary/5">
              {inquirySent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-accent/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-accent" weight="fill" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-2">Message Sent!</h3>
                  <p className="text-foreground/60 mb-8">The owner will get back to you shortly via email.</p>
                  <Button onClick={() => setInquirySent(false)} variant="outline" className="w-full">Send another message</Button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-heading font-black mb-2">Interested?</h3>
                  <p className="text-foreground/60 mb-8 italic">"Request a viewing or ask a question."</p>
                  
                  <form onSubmit={handleInquiry} className="space-y-4">
                    {!user && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground/40 ml-2">Full Name</label>
                          <input 
                            name="name"
                            required 
                            className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground/40 ml-2">Email Address</label>
                          <input 
                            name="email"
                            type="email" 
                            required 
                            className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all" 
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/40 ml-2">Preferred Viewing Date (Optional)</label>
                      <div className="relative">
                        <CalendarBlank size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                        <input 
                          name="viewingDate"
                          type="date" 
                          className="w-full pl-12 p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all text-foreground/60" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/40 ml-2">Your Message</label>
                      <textarea 
                        name="message"
                        rows={5} 
                        placeholder="I'm interested in this property. When can I come for a viewing?"
                        required 
                        className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all resize-none" 
                      />
                    </div>
                    <Button type="submit" className="w-full py-6 text-lg gap-2 shadow-lg shadow-primary/20">
                      <ChatCircleDots size={24} weight="fill" />
                      Send Inquiry
                    </Button>
                  </form>
                  <p className="text-center text-xs text-foreground/40 mt-6">
                    You'll receive a response within 24 hours.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
