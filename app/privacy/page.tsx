import { Navbar } from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-heading font-black mb-8 text-foreground">Privacy Policy</h1>
        <div className="bg-white p-10 rounded-3xl shadow-xl space-y-6 text-foreground/70 leading-relaxed">
          <p>Your privacy is important to us. This policy explains how we handle your data...</p>
          <h2 className="text-xl font-bold text-foreground">1. Data Collection</h2>
          <p>We collect information you provide directly, such as when you create an account, list a property, or send an inquiry.</p>
          <h2 className="text-xl font-bold text-foreground">2. Usage of Data</h2>
          <p>Your data is used to facilitate the rental marketplace process, including property matching and secure communication between users.</p>
          <h2 className="text-xl font-bold text-foreground">3. Data Security</h2>
          <p>We use industry-standard security measures, including Clerk for authentication and Convex for secure data storage, to protect your information.</p>
          <p className="pt-10 text-sm font-medium">Last updated: March 31, 2026</p>
        </div>
      </main>
    </div>
  );
}
