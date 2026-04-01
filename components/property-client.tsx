"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Bed, House, CheckCircle, ChatCircleDots, CurrencyNgn, ArrowLeft, CalendarBlank, Star } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertyClient({ property }: { property: any }) {
  const submitInquiry = useMutation(api.inquiries.submit);
  const { user } = useUser();
  const [inquirySent, setInquirySent] = useState(false);

  const isOwner = user?.id === property.ownerId;
  const reviews = useQuery(api.reviews.list, { propertyId: property._id });
  const submitReview = useMutation(api.reviews.submit);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to send an inquiry.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    try {
      await submitInquiry({
        propertyId: property._id,
        renterId: user.id,
        renterName: user.fullName || "Anonymous",
        renterEmail: user.primaryEmailAddress?.emailAddress || "",
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
                  src={property.images[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop"} 
                  alt={property.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="hidden md:grid grid-rows-2 gap-4 h-full">
                {property.images.slice(1, 3).map((img: string, i: number) => (
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
                  {(property.amenities.length > 0 ? property.amenities : ["Wi-Fi", "24/7 Power", "Security", "Parking", "Water"]).map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 text-foreground/80 font-medium">
                      <CheckCircle size={20} className="text-accent" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-16 pt-10 border-t border-border/50">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-heading font-black">Reviews ({reviews?.length || 0})</h2>
                  {reviews && reviews.length > 0 && (
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Star weight="fill" className="text-primary" />
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Review Form */}
                {user && !isOwner && !reviews?.find(r => r.authorId === user.id) && (
                  <div className="bg-secondary/20 p-6 rounded-3xl mb-10 border border-border/50">
                    <h3 className="font-bold mb-4">Leave a review</h3>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="text-primary hover:scale-110 transition-transform"
                        >
                          <Star size={24} weight={star <= reviewRating ? "fill" : "regular"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-4 rounded-2xl bg-white border-none outline-none focus:ring-2 ring-primary/20 transition-all resize-none text-sm"
                      rows={3}
                    />
                    <Button 
                      onClick={async () => {
                        if (!reviewComment) return;
                        setSubmittingReview(true);
                        try {
                          await submitReview({ propertyId: property._id, rating: reviewRating, comment: reviewComment });
                          setReviewComment("");
                        } catch (e) {
                          alert("Failed to submit review");
                        } finally {
                          setSubmittingReview(false);
                        }
                      }}
                      disabled={submittingReview || !reviewComment}
                      className="mt-4 px-8"
                    >
                      Post Review
                    </Button>
                  </div>
                )}

                <div className="space-y-6">
                  {reviews === undefined ? (
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                  ) : reviews.length === 0 ? (
                    <p className="text-foreground/40 italic">No reviews yet.</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="bg-white p-6 rounded-2xl border border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                              {review.authorName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{review.authorName}</p>
                              <p className="text-[10px] text-foreground/40 uppercase font-black">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} weight={i < review.rating ? "fill" : "regular"} className="text-primary" />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground/70 text-sm leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Inquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-2xl shadow-primary/10 border border-primary/5">
              {isOwner ? (
                <div className="text-center py-6">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <House size={40} className="text-primary" weight="fill" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-2">Your Listing</h3>
                  <p className="text-foreground/60 mb-8 italic">"You are the owner of this property. Manage it from your dashboard."</p>
                  <Link href="/dashboard">
                    <Button className="w-full py-6 text-lg gap-2 shadow-lg shadow-primary/20">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : inquirySent ? (
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
