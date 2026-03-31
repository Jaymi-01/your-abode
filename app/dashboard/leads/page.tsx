"use client";

import { Navbar } from "@/components/navbar";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatCircleDots, UserCircle, ArrowLeft, CalendarBlank, Archive, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LeadsDashboard() {
  const { user } = useUser();
  const properties = useQuery(api.properties.listByOwner, { ownerId: user?.id || "" });

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-heading font-black text-foreground mb-12 flex items-center gap-4">
          <ChatCircleDots size={48} className="text-primary" weight="fill" />
          Manage Your Leads
        </h1>

        <div className="space-y-12">
          {properties === undefined ? (
            <div className="h-64 bg-white rounded-3xl animate-pulse" />
          ) : properties.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center">
              <p className="text-xl text-foreground/40 font-bold font-heading">You don't have any properties to manage leads for.</p>
            </div>
          ) : (
            properties.map((property) => (
              <PropertyInquiries key={property._id} property={property} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function PropertyInquiries({ property }: { property: any }) {
  const inquiries = useQuery(api.inquiries.listForProperty, { propertyId: property._id });
  const updateStatus = useMutation(api.inquiries.updateInquiryStatus);

  if (inquiries === undefined) return <div className="h-32 bg-white/50 rounded-3xl animate-pulse" />;
  
  // Filter out archived ones for the main view
  const activeInquiries = inquiries.filter(i => i.status !== "archived");
  
  if (activeInquiries.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-0.5 flex-grow bg-border/50" />
        <h2 className="text-xl font-heading font-black text-foreground/60 px-4">
          {property.title}
        </h2>
        <div className="h-0.5 flex-grow bg-border/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeInquiries.map((inquiry) => (
          <div key={inquiry._id} className={`bg-white p-6 rounded-3xl shadow-sm border border-border/50 flex flex-col hover:shadow-md transition-all ${
            inquiry.status === "replied" ? "opacity-75" : ""
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserCircle size={32} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{inquiry.renterName}</h3>
                  <p className="text-xs text-foreground/60">{inquiry.renterEmail}</p>
                </div>
              </div>
              {inquiry.status === "replied" && (
                <div className="bg-accent/10 text-accent p-1.5 rounded-full" title="Replied">
                  <CheckCircle size={20} weight="fill" />
                </div>
              )}
            </div>

            <div className="bg-secondary/30 p-4 rounded-2xl flex-grow mb-4">
              <p className="text-sm text-foreground/80 italic">"{inquiry.message}"</p>
            </div>

            {inquiry.viewingDate && (
              <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                <CalendarBlank size={20} className="text-primary" weight="fill" />
                <div className="text-xs">
                  <p className="font-bold text-primary uppercase tracking-tighter">Requested Viewing</p>
                  <p className="font-medium text-foreground/70">{new Date(inquiry.viewingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-bold uppercase tracking-widest shrink-0">
                <CalendarBlank size={16} />
                Just Now
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full px-4 h-9 gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => updateStatus({ id: inquiry._id, status: "replied" })}
                  disabled={inquiry.status === "replied"}
                >
                  {inquiry.status === "replied" ? "Replied" : "Mark Replied"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-full p-2 h-9 w-9 text-foreground/40 hover:text-destructive hover:bg-destructive/5"
                  onClick={() => updateStatus({ id: inquiry._id, status: "archived" })}
                >
                  <Archive size={20} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
