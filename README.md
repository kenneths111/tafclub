# TAF Club - Calorie Tracker

A web application for tracking caloric intake and weight loss with your friends. Built with Next.js, Neon PostgreSQL, and a focus on making food logging as frictionless as possible.

## Features

- **Daily Food Logging** - Quick and easy food entry with no meal categorization required
- **Food Search** - Search the OpenFoodFacts database for nutritional information
- **Quick Add** - Re-log frequently eaten foods with a single tap
- **Weight Tracking** - Monitor your weight progress with interactive charts
- **Leaderboard** - See how you stack up against your friends
- **Group Challenges** - Create and join challenges to stay motivated together

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Food Data**: OpenFoodFacts API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Neon database (get one free at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd tafclub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A random secret (generated during setup)
   - `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for local dev)

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## Project Structure

```
tafclub/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (dashboard)/      # Main app pages
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── date-utils.ts     # Date helpers
└── prisma/
    └── schema.prisma     # Database schema
```

## License

MIT
