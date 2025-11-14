# FlowGrid ERP System

A modern Enterprise Resource Planning (ERP) system built with React, TypeScript, Node.js, and MongoDB.

Website Link :- https://vikas-aneesh-reddy-k.github.io/flowgrid/

## Features

- 📊 **Dashboard** - Real-time analytics and KPIs
- 💼 **Sales Management** - Customer and order tracking
- 📦 **Inventory Management** - Product and stock control
- 👥 **HR Management** - Employee and payroll management
- 💰 **Finance** - Revenue tracking and financial reports
- 📈 **Analytics** - Advanced data visualization with charts

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Query
- Recharts

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB

### Installation

```bash
# Clone repository
git clone https://github.com/vikas-aneesh-reddy-k/flowgrid.git
cd flowgrid

# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment files
cp .env.example .env
cp server/.env.example server/.env

# Start MongoDB (if not running)
mongod

# Seed database
cd server && npm run seed && cd ..

# Start backend (Terminal 1)
cd server && npm run dev

# Start frontend (Terminal 2)
npm run dev
```

Open http://localhost:8081

### Demo Credentials
- **Email:** admin@flowgrid.com
- **Password:** admin123

## Project Structure

```
flowgrid/
├── src/                  # Frontend React app
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # Context providers
│   └── lib/            # Utilities & API client
├── server/             # Backend Express API
│   └── src/
│       ├── controllers/  # Request handlers
│       ├── models/       # MongoDB schemas
│       ├── routes/       # API routes
│       ├── middleware/   # Auth & validation
│       └── scripts/      # Database seeding
└── public/             # Static assets
```

## Scripts

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
```

**Backend:**
```bash
npm run dev      # Development server
npm run build    # Compile TypeScript
npm start        # Production server
npm run seed     # Seed database
```

## Deployment

### AWS EC2 Deployment (Recommended for Production)

This project includes automatic deployment to AWS EC2 with GitHub Actions.

**Quick Setup:**
1. Launch an Ubuntu EC2 instance on AWS
2. Run the setup script on your EC2 instance
3. Add GitHub secrets (AWS_EC2_HOST, AWS_EC2_USER, AWS_SSH_KEY)
4. Push to main branch - automatic deployment!

📖 **[Complete AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)**

### GitHub Pages (Static Demo)

The project also supports deployment to GitHub Pages for static demos:
- Automatic builds on push to main
- Deployed via GitHub Actions

## License

MIT

## Author

Vikas Aneesh Reddy K
