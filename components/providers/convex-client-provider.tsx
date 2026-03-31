"use client";

import { ReactNode, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // By creating everything in a single state object, we ensure they are 
  // discarded and recreated together if React calls the initializer multiple times in Dev.
  const [{ convex, queryClient }] = useState(() => {
    const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexQueryClient = new ConvexQueryClient(convexClient);
    
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
          staleTime: Infinity,
        },
      },
    });

    convexQueryClient.connect(qc);
    
    return { convex: convexClient, queryClient: qc };
  });

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
}
