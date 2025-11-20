# 🚀 FlowGrid - Automated Docker + Jenkins Deployment

Complete CI/CD pipeline for automatic deployment from GitHub to AWS EC2 using Docker and Jenkins.

## ✨ What You Get

✅ **Automatic Deployment** - Push to GitHub, auto-deploy to AWS
✅ **Docker Containerization** - Frontend, Backend, and Database in containers
✅ **Jenkins CI/CD** - Automated build, test, and deployment pipeline
✅ **Live Database** - MongoDB with persistent data
✅ **Zero Downtime** - Rolling updates without service interruption
✅ **Health Monitoring** - Automatic health checks and rollback
✅ **Production Ready** - Nginx, security headers, CORS configured

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **JENKINS_DOCKER_DEPLOYMENT_GUIDE.md** | Complete step-by-step setup guide |
| **QUICK_SETUP_COMMANDS.md** | Copy-paste commands for quick setup |
| **ARCHITECTURE.md** | System architecture and data flow diagrams |
| **TROUBLESHOOTING_DETAILED.md** | Solutions for common issues |

---

## 🎯 Quick Start (5 Steps)

### 1. Launch EC2 Instance
- Ubuntu 22.04 LTS
- t2.medium or larger
- Open ports: 22, 80, 443, 8080, 5000

### 2. Run Setup Script on EC2
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Run this one command
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup-ec2-complete.sh | bash
```

### 3. Configure Jenkins
```bash
# Get Jenkins password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Open Jenkins
http://YOUR_EC2_IP:8080
```

### 4. Add Credentials in Jenkins
- Docker Hub username/password
- EC2 SSH key
- MongoDB URI
- JWT secret

### 5. Push to GitHub
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Done!** Your app is live at `http://YOUR_EC2_IP`

---

## 🏗️ Architecture

```
GitHub Push → Jenkins → Docker Build → Docker Hub → EC2 Deploy → Live App
```

### Container Structure
```
┌─────────────────────────────────────────┐
│           AWS EC2 Instance              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Frontend (Nginx)               │   │
│  │  Port: 80                       │   │
│  └─────────────────────────────────┘   │
│                 │                       │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │  Backend (Node.js)              │   │
│  │  Port: 5000                     │   │
│  └─────────────────────────────────┘   │
│                 │                       │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │  MongoDB                        │   │
│  │  Port: 27017 (internal)         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 📦 What's Included

### Docker Files
- `Dockerfile` - Combined frontend + backend
- `Dockerfile.frontend` - Frontend only
- `server/Dockerfile` - Backend only
- `docker-compose.yml` - Multi-container orchestration
- `nginx-docker.conf` - Nginx configuration
- `mongo-init.js` - Database initialization

### CI/CD Files
- `Jenkinsfile` - Complete pipeline definition
- `.dockerignore` - Optimize Docker builds
- `.github/workflows/deploy.yml` - GitHub Actions (alternative)

### Documentation
- Complete setup guides
- Troubleshooting documentation
- Architecture diagrams
- Quick reference commands

---

## 🔄 Deployment Workflow

### What Happens When You Push Code

1. **GitHub Webhook** triggers Jenkins
2. **Jenkins Checkout** pulls latest code
3. **Build Stage** creates Docker images
4. **Test Stage** runs automated tests
5. **Push Stage** uploads to Docker Hub
6. **Deploy Stage** updates EC2 containers
7. **Health Check** verifies deployment
8. **Notification** confirms success/failure

### Timeline
```
Git Push → 30 seconds → Build Complete → 1 minute → Deployed
```

---

## 🛠️ Local Development

### Run Locally with Docker
```bash
# Clone repository
git clone YOUR_REPO_URL
cd YOUR_REPO

# Create .env file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access application
http://localhost
```

### Run Without Docker
```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:7.0

# Start Backend
cd server
npm install
npm run dev

# Start Frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=your-secure-password
MONGODB_URI=mongodb://admin:password@mongodb:27017/flowgrid?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Application
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*

# Frontend
VITE_API_URL=http://YOUR_EC2_IP/api
```

### Where to Set Them

1. **EC2**: `/home/ubuntu/flowgrid/.env`
2. **Jenkins**: Manage Jenkins → Credentials
3. **Local**: `.env` file in project root

---

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://YOUR_EC2_IP/api/health

# Test API
curl http://YOUR_EC2_IP/api/products

# Test frontend
curl http://YOUR_EC2_IP
```

### Automated Testing
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

---

## 📊 Monitoring

### Check Container Status
```bash
# All containers
docker ps

# Specific logs
docker logs flowgrid-backend -f
docker logs flowgrid-frontend -f
docker logs flowgrid-mongodb -f

# Resource usage
docker stats
```

### Check Application Health
```bash
# Backend health
curl http://YOUR_EC2_IP/api/health

# Frontend health
curl http://YOUR_EC2_IP/health

# Database status
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Jenkins Monitoring
- Build history: `http://YOUR_EC2_IP:8080/job/FlowGrid-Deploy/`
- Console output: Click on build number → Console Output
- Build trends: View graphs on job page

---

## 🔧 Common Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart service
docker-compose restart backend

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build -d

# Clean up
docker system prune -f
```

### Database Commands
```bash
# Connect to MongoDB
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Backup database
docker exec flowgrid-mongodb mongodump --out /backup -u admin -p admin123 --authenticationDatabase admin

# Restore database
docker exec flowgrid-mongodb mongorestore /backup -u admin -p admin123 --authenticationDatabase admin

# Seed database
docker exec -it flowgrid-backend node dist/scripts/seed.js
```

### Jenkins Commands
```bash
# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Check Jenkins status
sudo systemctl status jenkins
```

---

## 🚨 Troubleshooting

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Containers not starting | `docker-compose down && docker-compose up -d` |
| API not responding | `docker logs flowgrid-backend` |
| Database connection failed | Check MONGODB_URI in .env |
| Frontend blank page | Rebuild with correct VITE_API_URL |
| Jenkins build fails | Check Jenkins logs and credentials |

### Detailed Troubleshooting
See **TROUBLESHOOTING_DETAILED.md** for comprehensive solutions.

---

## 🔒 Security Checklist

- [ ] Change default MongoDB password
- [ ] Generate strong JWT secret
- [ ] Restrict Jenkins access to your IP
- [ ] Use HTTPS with SSL certificate
- [ ] Keep Docker images updated
- [ ] Regular security audits
- [ ] Backup database regularly
- [ ] Monitor access logs

---

## 📈 Scaling

### Horizontal Scaling
```bash
# Add more EC2 instances
# Use AWS Load Balancer
# Point all instances to shared MongoDB
```

### Vertical Scaling
```bash
# Upgrade EC2 instance type
# t2.medium → t2.large → t2.xlarge
```

### Database Scaling
```bash
# Use MongoDB Atlas (managed)
# Or setup MongoDB replica set
```

---

## 🎓 Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 💡 Tips

1. **Use t2.medium or larger** for EC2 (Jenkins needs resources)
2. **Enable CloudWatch** for better monitoring
3. **Setup automated backups** for database
4. **Use environment-specific configs** for dev/staging/prod
5. **Monitor Docker Hub** for image size optimization
6. **Setup alerts** for failed deployments
7. **Keep documentation updated** with your changes

---

## 🤝 Support

### Getting Help
1. Check **TROUBLESHOOTING_DETAILED.md**
2. Review Jenkins console output
3. Check Docker logs
4. Verify environment variables
5. Test each component individually

### Debug Information
```bash
# Generate debug report
./generate-debug-report.sh

# Share the output when asking for help
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Jenkins builds complete without errors
- ✅ All Docker containers are running
- ✅ Health checks return 200 OK
- ✅ Frontend loads in browser
- ✅ API endpoints respond correctly
- ✅ Database contains data
- ✅ Auto-deployment works on git push

---

## 🚀 Next Steps

After successful deployment:
1. Setup domain name and SSL
2. Configure automated backups
3. Setup monitoring and alerts
4. Implement staging environment
5. Add more automated tests
6. Optimize Docker images
7. Setup log aggregation

---

**Happy Deploying! 🎊**

For detailed instructions, see **JENKINS_DOCKER_DEPLOYMENT_GUIDE.md**
