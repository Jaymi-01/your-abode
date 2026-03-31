"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle, ShieldCheck, MapPin, UserCircle, House } from "@phosphor-icons/react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function AdminPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"properties" | "users">("properties");
  
  const allProperties = useQuery(api.properties.listAll);
  const togglePropertyVerification = useMutation(api.properties.toggleVerification);
  
  const allUsers = useQuery(api.users.listAll);
  const toggleUserVerification = useMutation(api.users.toggleVerification);

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-border/50">
          <ShieldCheck size={64} className="mx-auto text-primary/20 mb-6" weight="fill" />
          <h1 className="text-3xl font-heading font-black text-foreground mb-4">Access Denied</h1>
          <p className="text-foreground/60 mb-8 leading-relaxed">This area is reserved for Your Abode administrators. If you believe you should have access, please contact support.</p>
          <Button onClick={() => window.location.href = "/"} className="w-full">Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-black text-foreground mb-2 flex items-center gap-4">
              <ShieldCheck size={48} className="text-accent" weight="fill" />
              Admin Panel
            </h1>
            <p className="text-foreground/60">Verify properties and users to maintain trust in the marketplace.</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border/50">
            <button 
              onClick={() => setActiveTab("properties")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "properties" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <House weight="bold" /> Properties
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "users" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <UserCircle weight="bold" /> Users
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "properties" ? (
              <table className="w-full text-left min-w-[800px]">
              <thead className="bg-secondary/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Owner Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allProperties === undefined ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-12 bg-secondary/30 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : allProperties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground/40 font-bold">No properties to verify.</td>
                  </tr>
                ) : (
                  allProperties.map((p: any) => (
                    <tr key={p._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                            <Image src={p.images[0]} alt="" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{p.title}</p>
                            <p className="text-xs text-foreground/40 flex items-center gap-1">
                              <MapPin size={12} /> {p.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground/80">{p.ownerName}</span>
                          <span className="text-[10px] font-medium text-foreground/30 font-mono tracking-tighter truncate max-w-[120px]">{p.ownerId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          p.status === "available" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.isVerified ? (
                          <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                            <CheckCircle weight="fill" /> Verified
                          </div>
                        ) : (
                          <div className="text-foreground/30 text-sm font-medium italic">Pending</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant={p.isVerified ? "outline" : "default"}
                          className={`rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-tighter ${
                            p.isVerified ? "border-accent/30 text-accent hover:bg-accent/5" : "bg-accent hover:bg-accent/90 text-white"
                          }`}
                          onClick={() => togglePropertyVerification({ id: p._id })}
                        >
                          {p.isVerified ? "Revoke" : "Verify House"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-secondary/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allUsers === undefined ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8">
                        <div className="h-12 bg-secondary/30 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-foreground/40 font-bold">No users found.</td>
                  </tr>
                ) : (
                  allUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase tracking-tighter">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-tight">{u.name}</p>
                            <p className="text-xs text-foreground/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                          u.role === "owner" ? "bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/40"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.isVerified ? (
                          <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                            <CheckCircle weight="fill" /> Verified
                          </div>
                        ) : (
                          <div className="text-foreground/30 text-sm font-medium italic">Unverified</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant={u.isVerified ? "outline" : "default"}
                          className={`rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-tighter ${
                            u.isVerified ? "border-accent/30 text-accent hover:bg-accent/5" : "bg-accent hover:bg-accent/90 text-white"
                          }`}
                          onClick={() => toggleUserVerification({ id: u._id })}
                        >
                          {u.isVerified ? "Revoke" : "Verify User"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
