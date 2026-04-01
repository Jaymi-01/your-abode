import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    senderId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const inquiry = await ctx.db.get(args.id || args.inquiryId);
    if (!inquiry) throw new Error("Inquiry not found");

    const property = await ctx.db.get(inquiry.propertyId);
    
    // Only renter or owner can send messages
    const isRenter = inquiry.renterId === identity.subject || identity.tokenIdentifier.endsWith(inquiry.renterId!);
    const isOwner = property?.ownerId === identity.subject || identity.tokenIdentifier.endsWith(property?.ownerId!);

    if (!isRenter && !isOwner) {
      throw new Error("Not authorized to participate in this conversation");
    }

    await ctx.db.insert("messages", {
      inquiryId: args.inquiryId,
      senderId: args.senderId,
      text: args.text,
      createdAt: Date.now(),
    });

    // If owner sends: unread for renter
    // If renter sends: unread for owner
    await ctx.db.patch(args.inquiryId, { 
      status: isOwner ? "replied" : "pending",
      lastMessageAt: Date.now(),
      readByOwner: isOwner,
      readByRenter: !isOwner
    });
  },
});

export const list = query({
  args: { inquiryId: v.id("inquiries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_inquiry", (q) => q.eq("inquiryId", args.inquiryId))
      .order("asc")
      .collect();
  },
});
