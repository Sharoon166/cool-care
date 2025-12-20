# Cool Care

A modern business management application built with SvelteKit for managing customers, invoices, and payments with a beautiful, responsive interface.

## About

Cool Care is a full-stack web application built to help small businesses streamline their operations. Originally created as a personal project to help my dad manage his business more efficiently, it provides an intuitive dashboard for tracking revenue, managing customer relationships, creating and tracking invoices, and processing payments. Built with modern web technologies, it offers a fast, secure, and user-friendly experience that makes business management accessible to everyone.

## Features

- **Dashboard Analytics** - Real-time overview of business metrics, revenue charts, recent activity, and top customers
- **Customer Management** - Complete CRUD operations for customer records with detailed contact information
- **Invoice System** - Create, edit, and track invoices with multiple line items and automatic calculations
- **Payment Tracking** - Record and monitor payments linked to invoices with status management
- **User Authentication** - Secure authentication system with session management using Better Auth
- **Responsive Design** - Mobile-first UI that works seamlessly across all devices
- **Command Palette** - Quick navigation and actions with keyboard shortcuts
- **Data Visualization** - Interactive charts and graphs for business insights using LayerChart

## Tech Stack

### Frontend

- **SvelteKit** - Full-stack framework with SSR and routing
- **Svelte 5** - Latest version with runes and enhanced reactivity
- **TailwindCSS 4** - Utility-first CSS framework
- **Bits UI** - Accessible component primitives
- **LayerChart** - Data visualization with D3
- **Lucide Icons** - Beautiful icon library
- **Svelte Sonner** - Toast notifications

### Backend

- **Better Auth** - Modern authentication library
- **Drizzle ORM** - Type-safe database toolkit
- **Neon Database** - Serverless PostgreSQL
- **Zod** - Schema validation
- **Superforms** - Enhanced form handling

### Development Tools

- **TypeScript** - Type safety across the stack
- **Vite** - Fast build tool and dev server
- **ESLint & Prettier** - Code quality and formatting
- **Drizzle Kit** - Database migrations and management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository

```sh
git clone <repository-url>
cd cool-care
```

2. Install dependencies

```sh
npm install
```

3. Set up environment variables

```sh
cp .env.example .env
```

Edit `.env` and add your database URL and other required variables.

4. Run database migrations

```sh
npm run db:push
```

5. Create an admin user (optional)

```sh
npm run create-admin
```

### Development

Start the development server:

```sh
npm run dev
```

Open your browser at `http://localhost:5173`

### Building for Production

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Database Management

- **Push schema changes**: `npm run db:push`
- **Generate migrations**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **Open Drizzle Studio**: `npm run db:studio`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run create-admin` - Create an admin user
- `npm run clear-users` - Clear all users from database

## Project Structure

```
cool-care/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   └── server/
│   │       └── db/         # Database schema and config
│   ├── routes/             # SvelteKit routes
│   │   ├── (app)/          # Protected app routes
│   │   └── (auth)/         # Authentication routes
│   ├── app.html            # HTML template
│   └── hooks.server.ts     # Server hooks
├── static/                 # Static assets
├── drizzle/                # Database migrations
└── scripts/                # Utility scripts
```

## Deployment

This project is configured for deployment on Vercel using the `@sveltejs/adapter-vercel`. Simply connect your repository to Vercel and it will automatically deploy.

## License

This project was built with love for family business needs. Feel free to use and adapt for your own projects.
