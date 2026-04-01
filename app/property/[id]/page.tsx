import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { PropertyClient } from "@/components/property-client";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchQuery(api.properties.getById, { id: id as any });

  if (!property) {
    return {
      title: "Property Not Found | Your Abode",
    };
  }

  return {
    title: `${property.title} | Your Abode`,
    description: `Rent this ${property.bedrooms} bedroom property in ${property.location} for ₦${property.price.toLocaleString()}/yr. No agency fees.`,
    openGraph: {
      title: property.title,
      description: property.description,
      images: [property.images[0]],
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description: property.description,
      images: [property.images[0]],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await fetchQuery(api.properties.getById, { id: id as any });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <h1 className="text-2xl font-heading font-black">Property not found.</h1>
      </div>
    );
  }

  return <PropertyClient property={property} />;
}
