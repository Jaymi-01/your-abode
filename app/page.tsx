"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-secondary/30 rounded-3xl animate-pulse flex items-center justify-center font-bold text-foreground/40">Loading Map...</div>
});
import { MagnifyingGlass, SlidersHorizontal, House as HouseIcon, MapTrifold, SquaresFour, NavigationArrow, CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [priceRange, setPriceRange] = useState<[number, number | undefined]>([0, undefined]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  const properties = useQuery(api.properties.list, {
    location: searchQuery === "Near Me" ? undefined : (searchQuery || undefined),
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    bedrooms: bedrooms,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    userId: user?.id,
  });

  const filteredProperties = useMemo(() => {
    if (!properties) return undefined;
    if (!userLocation) return properties;

    return properties.filter(p => {
      if (!p.lat || !p.lng) return false;
      const distance = Math.sqrt(
        Math.pow(p.lat - userLocation.lat, 2) + 
        Math.pow(p.lng - userLocation.lng, 2)
      );
      return distance < 0.1; // ~10km radius
    });
  }, [properties, userLocation]);

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setSearchQuery("Near Me");
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden bg-[#FFFBEB]">
          <div className="absolute top-0 right-0 -z-10 w-full md:w-1/2 h-full bg-primary/5 rounded-bl-none md:rounded-bl-[200px]" />
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-foreground mb-6 leading-[1.1]">
                  Tired of <span className="text-primary italic">Agent Wahala</span> <br className="hidden md:block" />
                  & Greedy Landlords?
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-foreground/70 mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto md:mx-0">
                  No exorbitant fees, no stress. We've got you covered with 
                  warmest stays designed for comfort and peace of mind. 
                  Find your perfect home without the extra "charges."
                </p>
              </motion.div>

              {/* Search & Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-2 rounded-3xl shadow-2xl shadow-primary/10 border border-primary/10 max-w-2xl mx-auto md:mx-0"
              >
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <div className="flex-grow flex items-center gap-3 px-4 py-2 sm:py-3 w-full border-b md:border-b-0 md:border-r border-border/50">
                    <MagnifyingGlass size={24} className="text-primary shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Lekki, Abuja, or VI?" 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (userLocation) setUserLocation(null);
                      }}
                      className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-foreground/40 font-medium text-sm sm:text-base"
                    />
                    <button 
                      onClick={handleNearMe}
                      className={`p-2 rounded-xl transition-all shrink-0 ${userLocation ? "bg-primary text-white" : "text-foreground/40 hover:bg-secondary/50"}`}
                      title="Find near me"
                    >
                      <NavigationArrow size={20} weight={userLocation ? "fill" : "bold"} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center gap-3 px-4 py-3 w-full md:w-auto hover:bg-secondary/50 rounded-2xl transition-colors shrink-0"
                  >
                    <SlidersHorizontal size={24} className="text-foreground/60" />
                    <span className="text-foreground/60 font-medium whitespace-nowrap">Filters</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/50 px-4"
                    >
                      <div className="py-6 space-y-6">
                        <div className="space-y-4">
                          <p className="font-bold text-sm text-foreground/60">Annual Rent Range</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Any", range: [0, undefined] },
                              { label: "Under ₦1M", range: [0, 1000000] },
                              { label: "₦1M - ₦5M", range: [1000000, 5000000] },
                              { label: "₦5M - ₦15M", range: [5000000, 15000000] },
                              { label: "₦15M+", range: [15000000, undefined] },
                            ].map((btn) => (
                              <button
                                key={btn.label}
                                onClick={() => setPriceRange(btn.range as [number, number | undefined])}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  JSON.stringify(priceRange) === JSON.stringify(btn.range)
                                    ? "bg-primary text-white"
                                    : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="font-bold text-sm text-foreground/60">Bedrooms</p>
                          <div className="flex flex-wrap gap-2">
                            {[undefined, 1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num === undefined ? "any" : num}
                                onClick={() => setBedrooms(num)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                  bedrooms === num
                                    ? "bg-primary text-white"
                                    : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                                }`}
                              >
                                {num === undefined ? "Any" : num + (num === 5 ? "+" : "")}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="font-bold text-sm text-foreground/60">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {["Wi-Fi", "24/7 Power", "Security", "Parking", "Water", "Gym", "Pool"].map((amenity) => (
                              <button
                                key={amenity}
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  selectedAmenities.includes(amenity)
                                    ? "bg-accent text-white"
                                    : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                                }`}
                              >
                                {amenity}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Property Grid/Map Area */}
        <section className="py-20 bg-secondary/30 min-h-[600px]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-4xl font-heading font-black text-foreground mb-4">
                  Explore <span className="text-accent">Featured</span> Stays
                </h2>
                <p className="text-foreground/60 max-w-md">
                  {filteredProperties?.length === 0 
                    ? "No properties found matching your search." 
                    : "Hand-picked properties that embody the Your Abode spirit."}
                </p>
              </div>

              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border/50 self-start">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === "grid" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
                  }`}
                >
                  <SquaresFour weight="bold" /> Grid
                </button>
                <button 
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === "map" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
                  }`}
                >
                  <MapTrifold weight="bold" /> Map
                </button>
              </div>
            </div>

            {filteredProperties === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white h-[400px] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : viewMode === "map" ? (
              <MapView properties={filteredProperties} />
            ) : (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredProperties?.length === 0 && (
                  <div className="text-center py-20">
                    <HouseIcon size={64} className="mx-auto text-primary/20 mb-4" />
                    <p className="text-xl font-heading font-bold text-foreground/40">Nothing to show here yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* FAQ Section with Accordion */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-4">
                Got <span className="text-primary">Questions?</span>
              </h2>
              <p className="text-foreground/60 text-lg">Everything you need to know about Your Abode.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Is there any agency fee involved?",
                  a: "Absolutely not. Your Abode is built to eliminate predatory agency fees. You only pay the rent and any legal/agreement fees clearly stated by the owner."
                },
                {
                  q: "How do I verify a property before paying?",
                  a: "We recommend using our built-in inquiry system to chat with owners and schedule a physical viewing. Look for the 'Verified' badge on listings which means our team has vetted the property."
                },
                {
                  q: "Can I list my own property?",
                  a: "Yes! Click the 'List Your Property' button. You'll need to create an account, provide property details, and upload clear photos. Once listed, you can manage inquiries from your dashboard."
                },
                {
                  q: "What happens after I send an inquiry?",
                  a: "The owner receives a notification and can reply to you directly through our secure messaging system. You'll see a notification in your Inbox when they respond."
                }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl font-heading font-black mb-4">
            Your <span className="text-primary">Abode</span>
          </p>
          <p className="text-background/60">© 2026 Your Abode Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-secondary/20 rounded-3xl overflow-hidden border border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-lg font-bold text-foreground">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-primary"
        >
          <CaretDown size={24} weight="bold" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-8 pb-8 text-foreground/60 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
