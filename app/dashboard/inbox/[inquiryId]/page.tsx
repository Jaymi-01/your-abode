"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaperPlaneRight, ArrowLeft, UserCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "@/lib/format-time";

export function ChatPage() {
  const { inquiryId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const messages = useQuery(api.messages.list, { inquiryId: inquiryId as any });
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.inquiries.markAsRead);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inquiryId && user) {
      markAsRead({ id: inquiryId as any, userId: user.id });
    }
  }, [inquiryId, user, markAsRead]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    await sendMessage({
      inquiryId: inquiryId as any,
      senderId: user.id,
      text: inputText,
    });
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary mb-6 transition-colors self-start"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-border/50 flex-grow flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border/50 bg-white z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserCircle size={32} weight="fill" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl text-foreground">Conversation</h2>
              <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest">Inquiry Thread</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#FFFBEB]/30">
            {messages === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-12 w-48 rounded-2xl bg-secondary/20 animate-pulse ${i % 2 === 0 ? "ml-auto" : ""}`} />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <PaperPlaneRight size={48} weight="thin" className="mb-4" />
                <p className="font-bold text-lg">No messages yet.</p>
                <p className="text-sm">Start the conversation below.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm ${
                    msg.senderId === user?.id 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-foreground rounded-tl-none border border-border/50"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${
                      msg.senderId === user?.id ? "text-white/60 text-right" : "text-foreground/30"
                    }`}>
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-border/50 flex gap-4">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-4 rounded-2xl bg-secondary/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all"
            />
            <Button type="submit" className="rounded-2xl w-14 h-14 p-0 shadow-lg shadow-primary/20 shrink-0">
              <PaperPlaneRight size={24} weight="fill" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
