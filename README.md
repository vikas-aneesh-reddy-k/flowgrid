# FlowGrid ERP System

[![Deploy to AWS EC2](https://github.com/YOUR_USERNAME/flowgrid/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/flowgrid/actions/workflows/deploy.yml)

> **Complete CI/CD Automation:** Every commit to `main` automatically tests and deploys to AWS EC2 with MongoDB integration.

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

## 🚀 CI/CD Deployment

### Automated Deployment to AWS EC2

This project features **complete CI/CD automation**. Every commit to `main` triggers:

1. ✅ **Automated Testing** - Type checking, linting, unit tests
2. ✅ **Build Process** - Frontend and backend compilation
3. ✅ **AWS Deployment** - Automatic deployment to EC2
4. ✅ **Service Restart** - PM2, Nginx, MongoDB updates
5. ✅ **Health Verification** - Post-deployment checks

### Quick Setup (5 Steps)

**Step 1: Prepare GitHub Secrets**
```bash
# Windows
setup-github-secrets.bat

# Mac/Linux
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh
```

**Step 2: Add Secrets to GitHub**
Go to: Settings → Secrets and variables → Actions

Add these 4 secrets:
- `AWS_EC2_HOST` - Your EC2 public IP
- `AWS_EC2_USER` - SSH username (usually `ubuntu`)
- `AWS_SSH_KEY` - Your .pem file content
- `MONGODB_URI` - MongoDB connection string

**Step 3: Initial EC2 Setup**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
git clone https://github.com/YOUR_USERNAME/flowgrid.git
cd flowgrid
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**Step 4: Verify Setup**
```bash
# On your local machine
chmod +x verify-deployment.sh
./verify-deployment.sh YOUR_EC2_IP
```

**Step 5: Test Automated Deployment**
```bash
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

Watch deployment at: GitHub → Actions tab

### 📚 Documentation

- **[CI/CD Setup Guide](./CI_CD_SETUP_GUIDE.md)** - Complete automation setup
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)** - Secrets configuration
- **[AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)** - AWS-specific instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### What Gets Automated

Every push to `main` automatically:
- ✅ Runs all tests
- ✅ Builds frontend (React + Vite)
- ✅ Builds backend (Node.js + TypeScript)
- ✅ Deploys to EC2
- ✅ Updates MongoDB database
- ✅ Restarts all services (PM2, Nginx)
- ✅ Verifies deployment health

### Monitoring

**View Deployment Status:**
- GitHub Actions tab shows all deployments
- Green ✅ = Success
- Red ❌ = Failed
- Yellow 🟡 = In Progress

**Check Logs on EC2:**
```bash
pm2 logs flowgrid-backend          # Backend logs
sudo tail -f /var/log/nginx/access.log  # Nginx logs
sudo systemctl status mongod        # MongoDB status
```

### Manual Operations

**Rollback to Previous Version:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
cd ~/flowgrid
git log --oneline -10
git reset --hard COMMIT_HASH
# Rebuild and restart services
```

**Restart Services:**
```bash
pm2 restart flowgrid-backend
sudo systemctl restart nginx
sudo systemctl restart mongod
```

**Update Environment Variables:**
```bash
cd ~/flowgrid/server
nano .env
pm2 restart flowgrid-backend
```

### GitHub Pages (Static Demo)

The project also supports deployment to GitHub Pages for static demos:
- Automatic builds on push to main
- Deployed via GitHub Actions
- Demo: https://vikas-aneesh-reddy-k.github.io/flowgrid/

## License

MIT

## Author

Vikas Aneesh Reddy K
