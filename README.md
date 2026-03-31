# Your Abode – Peer-to-Peer Rental Marketplace

**Your Abode** is a modern, transparent rental marketplace designed to eliminate predatory agency fees and "Agent Wahala" by connecting renters directly with property owners.

## 🚀 Live Demo
[Your Vercel Deployment URL here]

## ✨ Key Features
- **Direct Owner-Renter Messaging:** Built-in secure chat system for inquiries and negotiation.
- **Verification System:** Multi-level verification for both users and property listings to build marketplace trust.
- **Interactive Map Search:** Find homes easily using a Leaflet-powered map interface.
- **Responsive Multi-step Listing:** A smooth, validated flow for owners to list their properties.
- **Admin Dashboard:** Full moderation tools for verifying listings and managing users.
- **Modern UI/UX:** Fully responsive design with smooth animations and a premium "Warm" aesthetic.

## 🛠️ Tech Stack
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Database & Backend:** [Convex](https://www.convex.dev/) (Real-time database and serverless functions)
- **Authentication:** [Clerk](https://clerk.com/) (Secure user management and role-based access)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Phosphor Icons](https://phosphoricons.com/)
- **Maps:** [React Leaflet](https://react-leaflet.js.org/)

## 📸 Screenshots
*(Add your screenshots here)*

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-abode.git
   cd your-abode
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file and add your Clerk and Convex keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   NEXT_PUBLIC_CONVEX_URL=...
   ```

4. **Run the development server:**
   ```bash
   npx convex dev
   # In a new terminal
   pnpm dev
   ```

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
