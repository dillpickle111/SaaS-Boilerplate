# Prepify - Ultimate FREE Digital SAT Question Bank

<p align="center">
  <a href="https://prepify.xyz"><img height="300" src="public/assets/images/nextjs-starter-banner.png?raw=true" alt="Prepify - SAT Question Bank"></a>
</p>

🚀 **Prepify** is a comprehensive Digital SAT question bank built with **Next.js 14**, **Tailwind CSS**, and **ShadCN UI**. This free, open-source platform provides students with access to thousands of high-quality SAT practice questions across Math, Reading, and Writing sections.

## 🎯 Project Overview

**Root Domain**: prepify.xyz (hosted on Framer for marketing/landing pages)
**Core App**: This repository powers the SaaS web application with user authentication, question bank, and practice sessions.

### Architecture

- **Marketing/Landing**: All public marketing content lives on Framer (prepify.xyz)
- **Core App**: This repo handles user authentication, question bank, and practice sessions
- **Navigation**: Framer site CTAs link to `/app` which redirects authenticated users to `/dashboard`
- **Design**: Clean, modular components following Notion/Apple design principles

## ✨ Features

### Core Functionality
- 📚 **Comprehensive Question Bank**: 1,200+ SAT questions across Math, Reading, and Writing
- 🎯 **Practice Sessions**: Multiple modes (Practice, Quiz, Timed) with progress tracking
- 📊 **Progress Analytics**: Detailed performance metrics and progress visualization
- 🔐 **User Authentication**: Secure login via Clerk with user profiles
- 💾 **Data Persistence**: Supabase database with Drizzle ORM for type-safe queries

### Technical Stack
- ⚡ **Next.js 14** with App Router
- 🔥 **TypeScript** for type safety
- 💎 **Tailwind CSS** + **ShadCN UI** for modern, accessible components
- 🔒 **Clerk** for authentication and user management
- 💽 **Supabase** + **Drizzle ORM** for database operations
- 🌐 **Internationalization** with next-intl
- 🧪 **Testing** with Vitest and Playwright
- 📱 **Responsive Design** optimized for all devices

### Question Categories
- **Math**: Algebra, geometry, and advanced math concepts
- **Reading**: Reading comprehension and analysis
- **Writing**: Grammar, usage, and writing mechanics

### Practice Modes
- **Practice Mode**: Learn at your own pace with detailed explanations
- **Quiz Mode**: Test knowledge with immediate feedback
- **Timed Mode**: Simulate real test conditions with time limits

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm

### Installation

```shell
git clone https://github.com/your-username/prepify.git
cd prepify
npm install
```

### Environment Setup

Create a `.env.local` file with your configuration:

```shell
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
DATABASE_URL=your_supabase_database_url

# Optional: Sentry for error monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Development

```shell
npm run dev
```

Open http://localhost:3000 to see the application.

### Database Setup

Generate and run database migrations:

```shell
npm run db:generate
npm run db:migrate
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalization
│   │   ├── (auth)/        # Protected routes
│   │   │   ├── app/       # Main app entry point
│   │   │   ├── dashboard/ # User dashboard
│   │   │   ├── questions/ # Question bank
│   │   │   └── practice/  # Practice sessions
│   │   └── (unauth)/      # Public routes
├── components/             # Reusable UI components
│   └── ui/                # ShadCN UI components
├── features/              # Feature-specific components
│   ├── questions/         # Question bank features
│   └── practice/          # Practice session features
├── libs/                  # Third-party configurations
├── models/                # Database schemas
└── utils/                 # Utility functions
```

## 🎨 Design Philosophy

- **Clean & Modern**: Notion/Apple-inspired design with focus on readability
- **Accessible**: WCAG compliant components with keyboard navigation
- **Responsive**: Optimized for desktop, tablet, and mobile devices
- **Performance**: Fast loading with optimized bundle sizes

## 🔧 Development

### Available Scripts

```shell
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run db:studio    # Open database studio
```

### Database Management

```shell
npm run db:generate  # Generate new migration
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) for the beautiful component library
- [Clerk](https://clerk.com/) for authentication
- [Supabase](https://supabase.com/) for the database
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database queries

## 📞 Support

- **Website**: [prepify.xyz](https://prepify.xyz)
- **Documentation**: [docs.prepify.xyz](https://docs.prepify.xyz)
- **Issues**: [GitHub Issues](https://github.com/your-username/prepify/issues)

---

Made with ❤️ for students preparing for the Digital SAT
