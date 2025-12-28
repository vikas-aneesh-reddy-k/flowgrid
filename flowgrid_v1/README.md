# FlowGrid ERP System

A modern, full-stack ERP system built with React, TypeScript, Node.js, Express, and MongoDB.

## 🚀 Quick Deploy to AWS EC2

**Deploy in 10 minutes!** See [Quick Start Guide](deploy/QUICK_START.md)

## 📋 Features

- **Authentication**: Secure login with JWT
- **Dashboard**: Real-time analytics and insights
- **Employee Management**: Complete CRUD operations
- **Responsive Design**: Works on all devices
- **Modern UI**: Built with shadcn/ui components
- **Type-Safe**: Full TypeScript support
- **Dockerized**: Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- React Query

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Helmet (Security)
- CORS

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Nginx (Reverse Proxy)
- AWS EC2

## 📦 Project Structure

```
flowgrid/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── server/                # Backend source
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
│   └── Dockerfile         # Backend Docker image
├── deploy/                # Deployment scripts
│   ├── QUICK_START.md     # 10-minute deploy guide
│   ├── README.md          # Full deployment docs
│   ├── setup-ec2.sh       # EC2 setup script
│   └── test-deployment.sh # Deployment test script
├── docker/                # Docker configs
│   ├── nginx.conf         # Nginx configuration
│   └── mongo-init.js      # MongoDB initialization
├── .github/workflows/     # CI/CD pipelines
│   └── deploy.yml         # Auto-deploy on push
├── docker-compose.yml     # Multi-container setup
├── Dockerfile.frontend    # Frontend Docker image
└── .env.production        # Production env template

## 🚀 Deployment

### Option 1: Quick Deploy (Recommended)
Follow the [Quick Start Guide](deploy/QUICK_START.md) for automated deployment to AWS EC2.

### Option 2: Manual Deployment
See the [Full Deployment Guide](deploy/README.md) for detailed instructions.

### Option 3: Local Development
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start MongoDB
docker compose up mongodb -d

# Start backend (in one terminal)
cd server
npm run dev

# Start frontend (in another terminal)
npm run dev
```

Visit `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/flowgrid?authSource=admin
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# API tests
npm run test:api

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health
- `GET /health` - Health check endpoint

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- Input validation
- MongoDB injection prevention

## 📊 MongoDB Connection

**Local Development:**
```
mongodb://admin:password@localhost:27017/flowgrid?authSource=admin
```

**Production (EC2):**
```
mongodb://admin:PASSWORD@YOUR_EC2_IP:27017/flowgrid?authSource=admin
```

Use MongoDB Compass to connect and manage your database.

## 🔄 CI/CD Pipeline

Automatic deployment on push to `main`:
1. Build Docker images
2. Push to Docker Hub
3. Deploy to EC2
4. Restart services

See [GitHub Actions](.github/workflows/deploy.yml) for details.

## 🐛 Troubleshooting

### Check service status
```bash
docker compose ps
```

### View logs
```bash
docker compose logs -f [service-name]
```

### Restart services
```bash
docker compose restart
```

### Test deployment
```bash
./deploy/test-deployment.sh
```

## 📚 Documentation

- [Quick Start Guide](deploy/QUICK_START.md) - Deploy in 10 minutes
- [Full Deployment Guide](deploy/README.md) - Detailed deployment instructions
- [API Documentation](#api-documentation) - API endpoints reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Deployed on [AWS EC2](https://aws.amazon.com/ec2/)

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [deployment logs](deploy/README.md#troubleshooting)
3. Open an issue on GitHub

---

**Ready to deploy?** Start with the [Quick Start Guide](deploy/QUICK_START.md)! 🚀
