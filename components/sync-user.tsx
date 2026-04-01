"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function SyncUser() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (isClerkLoaded && user && isAuthenticated) {
      console.log("Syncing user to Convex:", user.primaryEmailAddress?.emailAddress);
      
      const isAdmin = user.primaryEmailAddress?.emailAddress === "admin@yourabode.com";
      const role = isAdmin ? "owner" : "renter";
      
      storeUser({ role, imageUrl: user.imageUrl }).then(() => console.log("User synced successfully"))
        .catch((err) => console.error("Failed to sync user:", err));
    }
  }, [isClerkLoaded, user, isAuthenticated, storeUser]);

  return null;
}
