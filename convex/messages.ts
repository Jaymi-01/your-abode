import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    inquiryId: v.id("inquiries"),
    senderId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      inquiryId: args.inquiryId,
      senderId: args.senderId,
      text: args.text,
      createdAt: Date.now(),
    });

    const inquiry = await ctx.db.get(args.inquiryId);
    if (!inquiry) return;

    const property = await ctx.db.get(inquiry.propertyId);
    const isOwner = property?.ownerId === args.senderId;

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
