# Mama Fresh - Consumer & Coordinator Frontend

The frontend for the Mama Fresh platform, built with **Next.js 15**, **React 19**, and **Tailwind CSS**. This application serves as the storefront for customers and the mobile-optimized logistics portal for town coordinators.

## 🚀 Key Features

- **Dynamic Storefront**: Village-sourced products, curated packages, and themed collections.
- **Smart Checkout**: Zone-based delivery fees, referral code integration, and carbon savings tracking.
- **Impact Dashboard**: Real-time transparency on rural income and environmental savings.
- **Coordinator Portal**: A pin-protected interface for logistics managers to manage batches, assign vendors, and rebalance stock based on availability.
- **Progressive Web App (PWA)**: Designed for low-bandwidth mobile use in rural and urban areas.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- Backend service running at `http://localhost:8000`

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd mama-fresh-react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Running Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📁 Project Structure

- `src/app/`: Next.js App Router (Cart, Shop, Impact, Coordinator Portal).
- `src/components/`: Reusable UI components (ProductGrid, PackageGrid, Layout).
- `src/context/`: Global state management for Cart and User preferences.
- `src/types/`: TypeScript interfaces for the backend models.

## 🔗 Logistics Workflow
1. **Customer**: Places order via the storefront.
2. **System**: Assigns order to a town batch.
3. **Coordinator**: Logs in to `/coordinator` to verify vendor availability and trigger dispatches.

---
*Built for the Acumen Academy Green RISE Fellowship 2026.*
