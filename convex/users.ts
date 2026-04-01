import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Insert or update the user in a Convex table then return the document ID.
 *
 * The `tokenIdentifier` is the definitive way to identify a user.
 */
export const store = mutation({
  args: {
    role: v.union(v.literal("renter"), v.literal("owner")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    // Check if we've already stored this user.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this user before but name, email, or image has changed, update them.
      if (user.name !== identity.name || user.email !== identity.email || user.imageUrl !== args.imageUrl) {
        await ctx.db.patch(user._id, {
          name: identity.name ?? "Anonymous",
          email: identity.email ?? "unknown@email.com",
          imageUrl: args.imageUrl,
        });
      }
      return user.role; // Return the existing role
    }

    // If it's a new user, create them.
    await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "unknown@email.com",
      imageUrl: args.imageUrl,
      tokenIdentifier: identity.tokenIdentifier,
      role: args.role,
    });
    return args.role;
  },
});

export const updateRole = mutation({
  args: { role: v.union(v.literal("renter"), v.literal("owner")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user) {
      await ctx.db.patch(user._id, { role: args.role });
    }
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const toggleVerification = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return;
    await ctx.db.patch(args.id, { isVerified: !user.isVerified });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", `https://smashing-raven-58.clerk.accounts.dev|${args.clerkId}`))
      .unique();
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});
