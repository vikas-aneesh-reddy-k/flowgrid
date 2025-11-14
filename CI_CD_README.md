# FlowGrid ERP - CI/CD Pipeline

## 🎯 Overview

Complete CI/CD pipeline using Jenkins, Docker, and AWS EC2 (Free Tier).

**Pipeline Flow:**
```
Git Push → Jenkins → Tests → Build → Docker → Deploy → Verify
```

---

## 📁 CI/CD Files Created

### Docker Files
- `Dockerfile.frontend` - React app containerization
- `Dockerfile.backend` - Node.js API containerization
- `docker-compose.yml` - Production orchestration
- `docker-compose.test.yml` - Testing environment
- `.dockerignore` - Exclude unnecessary files
- `nginx.conf` - Frontend web server config

### Jenkins Files
- `Jenkinsfile` - Complete pipeline definition
- `deploy.sh` - Deployment script for EC2

### Testing Files
- `jest.config.js` - API test configuration
- `vitest.config.ts` - Unit test configuration
- `server/tests/api.test.js` - API integration tests
- `server/tests/setup.js` - Test environment setup
- `src/tests/setup.ts` - React test setup
- `src/utils/formatCurrency.test.ts` - Sample unit test

### Configuration
- `.env.example` - Environment variables template
- `server/src/routes/healthRoutes.ts` - Health check endpoint

### Documentation
- `CI_CD_SETUP_GUIDE.md` - Complete setup instructions
- `CI_CD_QUICK_START.md` - 5-minute quick start
- `TESTING_STRATEGY.md` - Testing approach explained
- `CI_CD_README.md` - This file

---

## 🧪 Testing Strategy

### 3-Layer Testing Pyramid

1. **Unit Tests** (Vitest) - Fast, component-level
2. **API Integration Tests** (Jest/Supertest) - Backend validation
3. **E2E Tests** (Playwright) - Full user workflows

**Why this approach?**
- Combines black-box (E2E) and white-box (unit) testing
- Fast feedback with unit tests
- Comprehensive coverage with all layers
- Optimized for CI/CD pipelines

---

## 🚀 Quick Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run test:all        # Run all tests
```

### Testing
```bash
npm run test:unit       # Unit tests (fast)
npm run test:api        # API tests (medium)
npm run test:e2e        # E2E tests (slow)
npm run test:ci         # CI-optimized (unit + API)
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f backend    # View logs
docker-compose down               # Stop services
```

---

## 📊 Pipeline Stages

1. **Checkout** - Pull latest code
2. **Install** - Dependencies (frontend + backend)
3. **Lint & Type Check** - Code quality
4. **Unit Tests** - Fast component tests
5. **API Tests** - Backend integration
6. **Build** - Compile application
7. **E2E Tests** - Full workflow validation
8. **Docker Build** - Create images
9. **Push** - Upload to Docker Hub
10. **Deploy** - Deploy to EC2
11. **Smoke Tests** - Verify production

---

## 💰 Cost (AWS Free Tier)

**Free for 12 months:**
- EC2 t2.micro: 750 hours/month
- 30 GB EBS storage
- 15 GB data transfer

**After free tier:** ~$11-13/month

---

## 📚 Documentation

- **Quick Start:** `CI_CD_QUICK_START.md`
- **Full Setup:** `CI_CD_SETUP_GUIDE.md`
- **Testing:** `TESTING_STRATEGY.md`

---

## ✅ What's Included

- ✅ Automated testing (3 layers)
- ✅ Docker containerization
- ✅ Jenkins CI/CD pipeline
- ✅ AWS EC2 deployment
- ✅ Health checks
- ✅ Automated rollback on failure
- ✅ Test reports
- ✅ Zero-downtime deployment

---

## 🎯 Next Steps

1. Follow `CI_CD_QUICK_START.md` for setup
2. Configure AWS EC2 instance
3. Setup Jenkins
4. Push code to trigger pipeline
5. Monitor deployment

**Ready to deploy!** 🚀
