"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-secondary/30 rounded-3xl animate-pulse flex items-center justify-center font-bold text-foreground/40">Loading Map...</div>
});
import { MagnifyingGlass, SlidersHorizontal, House as HouseIcon, MapTrifold, SquaresFour, NavigationArrow, CaretDown, MapPin } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [priceRange, setPriceRange] = useState<[number, number | undefined]>([0, undefined]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<{ north: number, south: number, east: number, west: number } | null>(null);

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
    
    let results = properties;

    // Filter by Map Bounds if in map view and bounds exist
    if (viewMode === "map" && mapBounds) {
      results = results.filter(p => 
        p.lat && p.lng && 
        p.lat <= mapBounds.north && 
        p.lat >= mapBounds.south && 
        p.lng <= mapBounds.east && 
        p.lng >= mapBounds.west
      );
    }

    if (!userLocation) return results;

    return results.filter(p => {
      if (!p.lat || !p.lng) return false;
      const distance = Math.sqrt(
        Math.pow(p.lat - userLocation.lat, 2) + 
        Math.pow(p.lng - userLocation.lng, 2)
      );
      return distance < 0.1; 
    });
  }, [properties, userLocation, mapBounds, viewMode]);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSearchQuery("Near Me");
      });
    }
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
                  <div className="flex-grow flex items-center gap-3 px-4 py-2 sm:py-3 w-full border-b md:border-b-0 md:border-r border-border/50 relative">
                    <MagnifyingGlass size={24} className="text-primary shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Lekki, Abuja, or VI?" 
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-foreground/40 font-medium text-sm sm:text-base"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 z-[100] overflow-hidden">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            className="w-full text-left p-4 hover:bg-secondary/30 transition-colors border-b border-border/50 last:border-none flex items-center gap-3"
                            onClick={() => {
                              setSearchQuery(s.display_name);
                              setShowSuggestions(false);
                              if (userLocation) setUserLocation(null);
                            }}
                          >
                            <MapPin size={18} className="text-primary/40" />
                            <span className="text-sm font-medium truncate">{s.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                      className="overflow-hidden border-t border-border/50"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Price Range</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              placeholder="Min" 
                              className="w-full p-3 rounded-xl bg-secondary/30 border-none outline-none text-sm"
                              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            />
                            <span className="text-foreground/20">-</span>
                            <input 
                              type="number" 
                              placeholder="Max" 
                              className="w-full p-3 rounded-xl bg-secondary/30 border-none outline-none text-sm"
                              onChange={(e) => setPriceRange([priceRange[0], e.target.value ? Number(e.target.value) : undefined])}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Bedrooms</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, "5+"].map((n) => (
                              <button 
                                key={n}
                                onClick={() => setBedrooms(n === "5+" ? 5 : Number(n))}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                  bedrooms === (n === "5+" ? 5 : Number(n)) ? "bg-primary text-white" : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Amenities</label>
                          <div className="flex flex-wrap gap-2">
                            {["Wi-Fi", "24/7 Power", "Security", "Gym", "Pool"].map((a) => (
                              <button 
                                key={a}
                                onClick={() => {
                                  if (selectedAmenities.includes(a)) {
                                    setSelectedAmenities(selectedAmenities.filter(item => item !== a));
                                  } else {
                                    setSelectedAmenities([...selectedAmenities, a]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                                  selectedAmenities.includes(a) ? "border-accent bg-accent/5 text-accent" : "border-transparent bg-secondary/30 text-foreground/60"
                                }`}
                              >
                                {a}
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

        {/* Property Grid Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-black text-foreground mb-2 flex items-center gap-3">
                  <HouseIcon size={36} className="text-primary" weight="fill" />
                  Available Stays
                </h2>
                <p className="text-foreground/60 font-medium">
                  {filteredProperties?.length || 0} properties found in this area
                </p>
              </div>

              <div className="flex bg-secondary/30 p-1 rounded-2xl">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === "grid" ? "bg-white text-primary shadow-lg" : "text-foreground/40 hover:text-foreground/60"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "map" ? (
              <MapView 
                properties={filteredProperties} 
                onBoundsChange={(bounds) => setMapBounds(bounds)} 
              />
            ) : (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  <AnimatePresence>
                    {filteredProperties.map((property) => (
                      <motion.div
                        key={property._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PropertyCard property={property as any} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredProperties.length === 0 && (
                  <div className="text-center py-20 bg-secondary/10 rounded-[40px] border-2 border-dashed border-border/50">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <MagnifyingGlass size={40} className="text-primary/20" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-foreground mb-2">No matches found</h3>
                    <p className="text-foreground/40 max-w-md mx-auto">
                      Try adjusting your filters or searching in a different area.
                    </p>
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
          <p className="text-background/60 mb-8">© 2026 Your Abode Rentals. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-sm font-medium text-background/40">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
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
