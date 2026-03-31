import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: { userId: v.string(), propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_property", (q) => 
        q.eq("userId", args.userId).eq("propertyId", args.propertyId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("favorites", {
        userId: args.userId,
        propertyId: args.propertyId,
      });
      return true;
    }
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const properties = await Promise.all(
      favorites.map((f) => ctx.db.get(f.propertyId))
    );

    return properties.filter((p) => p !== null);
  },
});

export const isFavorite = query({
  args: { userId: v.string(), propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_property", (q) => 
        q.eq("userId", args.userId).eq("propertyId", args.propertyId)
      )
      .unique();
    return !!favorite;
  },
});
