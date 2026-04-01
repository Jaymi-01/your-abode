import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .order("desc")
      .collect();
  },
});

export const submit = mutation({
  args: {
    propertyId: v.id("properties"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject || identity.tokenIdentifier.split("|")[1];

    // Optional: Check if user has already reviewed this property
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .filter((q) => q.eq(q.field("authorId"), userId))
      .unique();

    if (existing) throw new Error("You have already reviewed this property");

    return await ctx.db.insert("reviews", {
      propertyId: args.propertyId,
      authorId: userId,
      authorName: identity.name || "Anonymous",
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });
  },
});
