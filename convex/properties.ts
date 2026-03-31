import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    location: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    userId: v.optional(v.string()), // Add optional userId
  },
  handler: async (ctx, args) => {
    let properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Filter out properties owned by the current user
    if (args.userId) {
      properties = properties.filter(p => p.ownerId !== args.userId);
    }

    if (args.location) {
      const search = args.location.toLowerCase();
      properties = properties.filter(p => 
        p.location.toLowerCase().includes(search) || 
        p.title.toLowerCase().includes(search)
      );
    }

    if (args.minPrice !== undefined) {
      properties = properties.filter(p => p.price >= args.minPrice!);
    }

    if (args.maxPrice !== undefined) {
      properties = properties.filter(p => p.price <= args.maxPrice!);
    }

    if (args.bedrooms !== undefined) {
      properties = properties.filter(p => p.bedrooms === args.bedrooms);
    }

    if (args.amenities && args.amenities.length > 0) {
      properties = properties.filter(p => 
        args.amenities!.every(amenity => p.amenities.includes(amenity))
      );
    }

    return properties;
  },
});

export const listByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .filter((q) => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.string(),
    bedrooms: v.number(),
    amenities: v.array(v.string()),
    images: v.array(v.string()),
    ownerId: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("properties", {
      ...args,
      status: "available",
      isVerified: false,
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getPublicUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").order("desc").collect();
    
    // Manually join with users table based on ownerId (which is Clerk ID)
    return await Promise.all(
      properties.map(async (p) => {
        const owner = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", `https://smashing-raven-58.clerk.accounts.dev|${p.ownerId}`))
          .unique();
        return {
          ...p,
          ownerName: owner?.name || "Unknown Owner",
        };
      })
    );
  },
});

export const toggleVerification = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return;
    await ctx.db.patch(args.id, { isVerified: !property.isVerified });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("properties"),
    status: v.union(v.literal("available"), v.literal("rented")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return;
    
    // Delete associated images from storage if they are Convex URLs
    for (const imageUrl of property.images) {
      if (imageUrl.includes("convex.cloud") || imageUrl.includes("convex.site")) {
        const storageId = imageUrl.split("/").pop();
        if (storageId) {
          try {
            await ctx.storage.delete(storageId as any);
          } catch (e) {
            console.error("Failed to delete storage item:", e);
          }
        }
      }
    }
    
    await ctx.db.delete(args.id);
  },
});
