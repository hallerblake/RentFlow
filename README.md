# RentFlow

Modern rental property management application built with Next.js, TypeScript, and Prisma.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Deployment**: Vercel (ready)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL database configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env file is already configured with your Neon database
```

3. Generate Prisma Client:
```bash
npm run db:generate
```

4. Push database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
rentflow/
├── app/                # Next.js app directory
├── lib/                # Utility functions and shared code
├── prisma/             # Database schema and migrations
├── instructions/       # Project specifications and requirements
└── public/             # Static assets
```

## Database

This project uses Neon PostgreSQL. The database connection is configured in `.env`.

To view and manage your database:
```bash
npm run db:studio
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
