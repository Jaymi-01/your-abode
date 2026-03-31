import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.string(),
    bedrooms: v.number(),
    amenities: v.array(v.string()),
    images: v.array(v.string()),
    ownerId: v.string(), // For now, we'll use a simple string ID
    status: v.union(v.literal("available"), v.literal("rented")),
    isVerified: v.optional(v.boolean()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }).index("by_status", ["status"]),

  inquiries: defineTable({
    propertyId: v.id("properties"),
    renterName: v.string(),
    renterEmail: v.string(),
    message: v.string(),
    viewingDate: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("replied"), v.literal("archived")),
  }).index("by_propertyId", ["propertyId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("renter"), v.literal("owner")),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  favorites: defineTable({
    userId: v.string(),
    propertyId: v.id("properties"),
  }).index("by_user", ["userId"])
    .index("by_user_property", ["userId", "propertyId"]),
});
