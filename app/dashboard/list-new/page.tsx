"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { House, MapPin, CurrencyNgn, Bed, Image as ImageIcon, CheckCircle, UploadSimple, Spinner } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LocationPicker } from "@/components/location-picker";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(100000, "Price must be at least 100,000 NGN"),
  location: z.string().min(3, "Location is required"),
  bedrooms: z.number().min(1),
  amenities: z.array(z.string()),
  images: z.array(z.string()).min(1, "At least one image is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListNewProperty() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();
  
  const createProperty = useMutation(api.properties.create);
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedrooms: 1,
      amenities: [],
      images: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      await createProperty({
        ...data,
        ownerId: user.id,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create property:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of Array.from(files)) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        const publicUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
        uploadedUrls.push(publicUrl);
      }
      setValue("images", [...watch("images"), ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12 flex justify-between items-center relative">
            <div className="absolute h-0.5 bg-border w-full top-1/2 -z-10" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= s ? "bg-primary text-white" : "bg-white border-2 border-border text-foreground/40"
                }`}
              >
                {step > s ? <CheckCircle weight="fill" /> : s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-heading font-black text-foreground mb-8">Basic Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      <House size={18} /> Property Title
                    </label>
                    <input 
                      {...register("title")}
                      placeholder="e.g. Luxury Studio in Lekki"
                      className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all"
                    />
                    {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      <MapPin size={18} /> Location Address
                    </label>
                    <input 
                      {...register("location")}
                      placeholder="e.g. Lekki Phase 1, Lagos"
                      className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all"
                    />
                    {errors.location && <p className="text-destructive text-xs">{errors.location.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      Pin on Map (Optional)
                    </label>
                    <LocationPicker 
                      onLocationSelect={(lat, lng) => {
                        setValue("lat", lat);
                        setValue("lng", lng);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      <CurrencyNgn size={18} /> Annual Rent (₦)
                    </label>
                    <input 
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="e.g. 2500000"
                      className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all"
                    />
                    {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
                  </div>

                  <Button type="button" onClick={nextStep} className="w-full py-6 text-lg">Next Step</Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-heading font-black text-foreground mb-8">Property Details</h2>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      <Bed size={18} /> Number of Bedrooms
                    </label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setValue("bedrooms", n)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all ${
                            watch("bedrooms") === n ? "bg-primary text-white" : "bg-secondary/30 text-foreground/60"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-foreground/60 flex items-center gap-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Wi-Fi", "24/7 Power", "Security", "Parking", "Water", "Gym", "Pool"].map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            const current = watch("amenities");
                            setValue("amenities", current.includes(amenity) ? current.filter(a => a !== amenity) : [...current, amenity]);
                          }}
                          className={`p-3 rounded-xl text-sm font-medium border-2 transition-all text-left flex items-center justify-between ${
                            watch("amenities").includes(amenity)
                              ? "border-accent bg-accent/5 text-accent"
                              : "border-secondary bg-secondary/30 text-foreground/60"
                          }`}
                        >
                          {amenity}
                          {watch("amenities").includes(amenity) && <CheckCircle weight="fill" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60">Description</label>
                    <textarea 
                      {...register("description")}
                      rows={4}
                      placeholder="Tell us about the property..."
                      className="w-full p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all resize-none"
                    />
                    {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="w-1/2 py-6">Back</Button>
                    <Button type="button" onClick={nextStep} className="w-1/2 py-6">Next Step</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-heading font-black text-foreground mb-8">Photos & Finish</h2>

                  <div className="space-y-4">
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                        uploading ? "border-primary/20 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Spinner size={48} className="text-primary animate-spin" />
                          <p className="font-bold text-primary">Uploading your photos...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <UploadSimple size={32} weight="bold" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-foreground">Click to upload photos</p>
                            <p className="text-xs text-foreground/40 mt-1">PNG, JPG or JPEG (Max 5MB each)</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {watch("images").map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary/50 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setValue("images", watch("images").filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >×</button>
                        </div>
                      ))}
                    </div>
                    {errors.images && <p className="text-destructive text-xs text-center">{errors.images.message}</p>}
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="w-1/2 py-6" disabled={uploading}>Back</Button>
                    <Button type="submit" className="w-1/2 py-6 bg-accent hover:bg-accent/90" disabled={uploading}>Publish Listing</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </main>
    </div>
  );
}
