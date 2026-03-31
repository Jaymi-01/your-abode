"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { House, ChatCircleDots, Plus, MapPin, CurrencyNgn, Bed, CheckCircle, Trash, ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

function PropertyItem({ p, updateStatus, removeProperty }: { p: any, updateStatus: any, removeProperty: any }) {
  const inquiries = useQuery(api.inquiries.listForProperty, { propertyId: p._id });
  const pendingCount = inquiries?.filter(i => i.status === "pending").length || 0;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      await removeProperty({ id: p._id });
    }
  };

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-border/50 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
      {pendingCount > 0 && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg animate-pulse z-10">
          {pendingCount} NEW {pendingCount === 1 ? "INQUIRY" : "INQUIRIES"}
        </div>
      )}
      <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
        <Image src={p.images[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop"} alt="" fill className="object-cover" />
      </div>
      <div className="flex-grow py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-xl">{p.title}</h3>
            {p.isVerified && <ShieldCheck size={18} className="text-accent" weight="fill" />}
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            p.status === "available" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          }`}>
            {p.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
          <div className="flex items-center gap-1"><MapPin size={16} /> {p.location}</div>
          <div className="flex items-center gap-1"><CurrencyNgn size={16} /> ₦{p.price.toLocaleString()}/yr</div>
          <div className="flex items-center gap-1"><Bed size={16} /> {p.bedrooms} Beds</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Link href={`/property/${p._id}`}>
              <Button variant="ghost" size="sm" className="text-xs">View Listing</Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-[10px] font-bold uppercase tracking-wider h-8 rounded-full ${
                p.status === "available" 
                  ? "border-primary/20 text-primary hover:bg-primary/5" 
                  : "border-accent/20 text-accent hover:bg-accent/5"
              }`}
              onClick={async () => {
                const newStatus = p.status === "available" ? "rented" : "available";
                await updateStatus({ id: p._id, status: newStatus });
              }}
            >
              Mark as {p.status === "available" ? "Rented" : "Available"}
            </Button>
          </div>
          <button 
            onClick={handleDelete}
            className="p-2 text-destructive/40 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/5"
            title="Delete Listing"
          >
            <Trash size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const properties = useQuery(api.properties.listByOwner, { ownerId: user?.id || "" });
  const updateStatus = useMutation(api.properties.updateStatus);
  const removeProperty = useMutation(api.properties.remove);

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-heading font-black text-foreground">
                Welcome back, {user?.firstName || "Owner"}
              </h1>
              {isAdmin && (
                <Link href="/admin">
                  <span className="bg-foreground text-background px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:bg-primary transition-colors">
                    Admin Panel
                  </span>
                </Link>
              )}
            </div>
            <p className="text-foreground/60">Manage your properties and respond to potential renters.</p>
          </div>
          <Link href="/dashboard/list-new">
            <Button className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/20 gap-2">
              <Plus weight="bold" /> List New Property
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-black flex items-center gap-2">
                <House size={28} className="text-primary" /> Your Listings
              </h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                {properties?.length || 0} Total
              </span>
            </div>

            {properties === undefined ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-border/50">
                <House size={64} className="mx-auto text-primary/20 mb-4" />
                <p className="text-xl font-heading font-bold text-foreground/40 mb-6">No properties listed yet.</p>
                <Link href="/dashboard/list-new">
                  <Button variant="outline">Create your first listing</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((p) => (
                  <PropertyItem key={p._id} p={p} updateStatus={updateStatus} removeProperty={removeProperty} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats / Recent Activity */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <ChatCircleDots size={48} weight="fill" className="mb-4 opacity-50" />
              <h3 className="text-2xl font-heading font-black mb-2">Manage Leads</h3>
              <p className="text-primary-foreground/70 mb-6 text-sm">You have new inquiries waiting for your response.</p>
              <Link href="/dashboard/leads">
                <Button className="w-full bg-white text-primary hover:bg-white/90">View All Inquiries</Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-border/50">
              <h3 className="font-heading font-black text-xl mb-6">Listing Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-foreground/70">
                  <CheckCircle size={20} className="text-accent shrink-0" weight="fill" />
                  High-quality photos increase inquiries by 40%.
                </li>
                <li className="flex gap-3 text-sm text-foreground/70">
                  <CheckCircle size={20} className="text-accent shrink-0" weight="fill" />
                  Detailed descriptions help renters decide faster.
                </li>
                <li className="flex gap-3 text-sm text-foreground/70">
                  <CheckCircle size={20} className="text-accent shrink-0" weight="fill" />
                  Verify your property to build immediate trust.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
