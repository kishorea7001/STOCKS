# TalkStock
**Smart Inventory, Powered by Voice**

An AI-powered voice inventory management system for vendors and shopkeepers, supporting multilingual and colloquial speech (English, Hindi, Hinglish).

---

## Tech Stack
- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS & Modern Glassmorphism UI
- **Database & ORM**: SQLite with Prisma ORM
- **AI Integration**: Multimodal Gemini 2.5 Flash with structured JSON extraction & catalog grounding

---

## Features
- **Hold / Tap to Speak**: Natural voice recording via browser `MediaRecorder` API with soundwave visualization.
- **AI Review Card**: Preview proposed inventory transactions (`SALE` / `RESTOCK`) with stock projections before committing.
- **Stock Guards**: Automatic alerts and 1-click capping when requested sales exceed available stock.
- **Atomic Transactions**: Strict `db.$transaction` execution ensuring all-or-nothing ledger integrity.
- **Live Overview Dashboard**: Dynamic trend charts, low-stock warnings, and immutable activity audit logs.
- **Reset Demo Data**: Instant 1-click database reset between presentations and live demonstrations.

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY to .env.local
   ```

3. **Run database migration and seed**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser.
