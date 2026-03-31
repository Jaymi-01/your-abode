import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    propertyId: v.id("properties"),
    renterName: v.string(),
    renterEmail: v.string(),
    message: v.string(),
    viewingDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "pending",
    });
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
