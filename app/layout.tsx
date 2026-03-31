import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Abode | Warm & Cozy Rentals",
  description: "Find your perfect warmest stay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${plusJakartaSans.variable} ${outfit.variable} antialiased font-body`}
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
