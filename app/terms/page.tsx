import { Navbar } from "@/components/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-heading font-black mb-8 text-foreground">Terms of Service</h1>
        <div className="bg-white p-10 rounded-3xl shadow-xl space-y-6 text-foreground/70 leading-relaxed">
          <p>Welcome to Your Abode. By using our platform, you agree to the following terms...</p>
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
          <h2 className="text-xl font-bold text-foreground">2. Marketplace Role</h2>
          <p>Your Abode is a peer-to-peer marketplace. We connect renters directly with property owners. We do not act as an agent and are not responsible for the condition of properties or the fulfillment of rental agreements.</p>
          <h2 className="text-xl font-bold text-foreground">3. User Conduct</h2>
          <p>Users must provide accurate information and engage in respectful communication through our messaging system.</p>
          <p className="pt-10 text-sm font-medium">Last updated: March 31, 2026</p>
        </div>
      </main>
    </div>
  );
}
