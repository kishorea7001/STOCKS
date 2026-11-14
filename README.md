# STOCKS
An Agent that helps vendors and shopkeepers keep records of their stocks.

## Tech Stack
- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database & ORM**: SQLite with Prisma ORM
- **AI Integration**: Gemini / OpenAI for voice and multimodal parsing

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.example .env.local
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
