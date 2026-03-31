import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    propertyId: v.id("properties"),
    renterId: v.string(),
    renterName: v.string(),
    renterEmail: v.string(),
    message: v.string(),
    viewingDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "pending",
      lastMessageAt: Date.now(),
      readByOwner: false,
      readByRenter: true,
    });
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // 1. As a Renter: Count inquiries where readByRenter is false
    const renterUnread = await ctx.db
      .query("inquiries")
      .withIndex("by_renterId", (q) => q.eq("renterId", args.userId))
      .filter((q) => q.eq(q.field("readByRenter"), false))
      .collect();

    // 2. As an Owner: Count inquiries where readByOwner is false
    const myProperties = await ctx.db
      .query("properties")
      .filter((q) => q.eq(q.field("ownerId"), args.userId))
      .collect();
    const myPropertyIds = myProperties.map((p) => p._id);

    const allInquiries = await ctx.db.query("inquiries").collect();
    const ownerUnread = allInquiries.filter(i => 
      myPropertyIds.includes(i.propertyId as any) && i.readByOwner === false
    );

    return renterUnread.length + ownerUnread.length;
  },
});

export const listForRenter = query({
  args: { renterId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inquiries")
      .withIndex("by_renterId", (q) => q.eq("renterId", args.renterId))
      .collect();
  },
});

export const listAllForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // 1. Inquiries where user is the renter
    const asRenter = await ctx.db
      .query("inquiries")
      .withIndex("by_renterId", (q) => q.eq("renterId", args.userId))
      .collect();

    // 2. Inquiries where user is the owner
    const myProperties = await ctx.db
      .query("properties")
      .filter((q) => q.eq(q.field("ownerId"), args.userId))
      .collect();
    const myPropertyIds = myProperties.map((p) => p._id);

    const allInquiries = await ctx.db.query("inquiries").collect();
    const asOwner = allInquiries.filter(i => myPropertyIds.includes(i.propertyId as any));

    // Combine and sort by lastMessageAt
    const combined = [...asRenter, ...asOwner].filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
    
    return combined.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  },
});

export const listForProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inquiries")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const updateInquiryStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.union(v.literal("pending"), v.literal("replied"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const markAsRead = mutation({
  args: { id: v.id("inquiries"), userId: v.string() },
  handler: async (ctx, args) => {
    const inquiry = await ctx.db.get(args.id);
    if (!inquiry) return;

    if (inquiry.renterId === args.userId) {
      await ctx.db.patch(args.id, { readByRenter: true });
    }
    
    const property = await ctx.db.get(inquiry.propertyId);
    if (property?.ownerId === args.userId) {
      await ctx.db.patch(args.id, { readByOwner: true });
    }
  },
});
