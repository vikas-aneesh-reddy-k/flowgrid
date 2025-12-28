# 🔧 Quick Command Reference

Essential commands for managing your FlowGrid deployment.

## 📋 Local Development

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start development servers
npm run dev              # Frontend (port 5173)
cd server && npm run dev # Backend (port 5000)

# Build for production
npm run build            # Frontend
cd server && npm run build # Backend

# Run tests
npm run test:unit        # Unit tests
npm run test:api         # API tests
npm run test:e2e         # E2E tests
```

## 🐳 Docker Commands

### Local Testing
```bash
# Test backend build
docker build -t flowgrid-backend:test -f server/Dockerfile ./server

# Test frontend build
docker build -t flowgrid-frontend:test -f Dockerfile.frontend .

# Test docker-compose
docker compose config

# Start all services locally
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build
```

### Docker Compose Management
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# Restart specific service
docker compose restart backend

# View status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Execute command in container
docker compose exec backend sh
docker compose exec mongodb mongosh

# Remove everything (including volumes)
docker compose down -v
```

## 🖥️ EC2 Management

### Connect to EC2
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Copy file to EC2
scp -i your-key.pem file.txt ubuntu@YOUR_EC2_IP:/home/ubuntu/

# Copy directory to EC2
scp -i your-key.pem -r folder/ ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

### On EC2 Instance
```bash
# Navigate to app directory
cd /home/ubuntu/flowgrid

# Pull latest images
docker compose pull

# Deploy latest version
docker compose down && docker compose up -d

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Check disk space
df -h

# Check memory usage
free -h

# Check Docker stats
docker stats

# Clean up old images
docker image prune -af

# Clean up everything
docker system prune -af
```

## 🔍 Debugging Commands

### Check Service Health
```bash
# Backend health
curl http://localhost:5000/health

# Frontend
curl http://localhost/

# MongoDB
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### View Detailed Logs
```bash
# Last 100 lines
docker compose logs --tail=100 backend

# Follow logs with timestamps
docker compose logs -f --timestamps backend

# All logs since 10 minutes ago
docker compose logs --since 10m
```

### Inspect Containers
```bash
# Container details
docker inspect flowgrid-backend-1

# Container processes
docker compose top backend

# Container resource usage
docker stats flowgrid-backend-1
```

### Network Debugging
```bash
# Test backend from frontend container
docker compose exec frontend wget -O- http://backend:5000/health

# Test MongoDB from backend container
docker compose exec backend sh -c 'echo "db.adminCommand(\"ping\")" | mongosh $MONGODB_URI'

# Check network
docker network ls
docker network inspect flowgrid_app-network
```

## 🗄️ MongoDB Commands

### Connect to MongoDB
```bash
# From EC2
docker compose exec mongodb mongosh -u admin -p FlowGrid2024SecurePassword! --authenticationDatabase admin

# From MongoDB Compass
mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_IP:27017/flowgrid?authSource=admin
```

### MongoDB Operations
```bash
# Inside mongosh
use flowgrid                    # Switch to database
show collections                # List collections
db.users.find()                 # View users
db.users.countDocuments()       # Count users
db.employees.find().pretty()    # View employees (formatted)

# Backup database
docker compose exec mongodb mongodump -u admin -p PASSWORD --authenticationDatabase admin -d flowgrid -o /backup

# Restore database
docker compose exec mongodb mongorestore -u admin -p PASSWORD --authenticationDatabase admin -d flowgrid /backup/flowgrid
```

## 🔄 Git & Deployment

### Deploy New Version
```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Push to trigger deployment
git push origin main

# Watch deployment
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### Manual Deployment
```bash
# Build and push images manually
docker build -t vikaskakarla/flowgrid-backend:latest -f server/Dockerfile ./server
docker build -t vikaskakarla/flowgrid-frontend:latest -f Dockerfile.frontend .
docker push vikaskakarla/flowgrid-backend:latest
docker push vikaskakarla/flowgrid-frontend:latest

# On EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose pull
docker compose up -d
```

## 🧪 Testing Commands

### Run Tests Locally
```bash
# Unit tests
npm run test:unit

# API tests
npm run test:api

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Test with coverage
npm run test:unit -- --coverage
```

### Test Deployment
```bash
# On EC2
cd /home/ubuntu/flowgrid
chmod +x test-deployment.sh
./test-deployment.sh

# On local machine
# Windows
deploy\test-local.bat

# Mac/Linux
chmod +x deploy/test-local.sh
./deploy/test-local.sh
```

## 🔒 Security Commands

### Update Passwords
```bash
# On EC2
cd /home/ubuntu/flowgrid
nano .env
# Update MONGO_PASSWORD and JWT_SECRET
# Save and restart
docker compose restart
```

### View Environment Variables
```bash
# View .env file
cat .env

# View container environment
docker compose exec backend env
```

## 📊 Monitoring Commands

### System Resources
```bash
# CPU and memory usage
docker stats

# Disk usage
docker system df

# Container logs size
docker compose logs backend 2>&1 | wc -l
```

### Application Metrics
```bash
# Request count (from logs)
docker compose logs backend | grep "GET\|POST\|PUT\|DELETE" | wc -l

# Error count
docker compose logs backend | grep -i "error" | wc -l

# Recent errors
docker compose logs backend | grep -i "error" | tail -20
```

## 🆘 Emergency Commands

### Quick Restart
```bash
docker compose restart
```

### Full Reset
```bash
docker compose down
docker compose up -d
```

### Nuclear Option (Reset Everything)
```bash
# WARNING: This deletes all data!
docker compose down -v
docker system prune -af
docker compose up -d
```

### Rollback to Previous Version
```bash
# Pull specific version
docker pull vikaskakarla/flowgrid-backend:COMMIT_SHA
docker pull vikaskakarla/flowgrid-frontend:COMMIT_SHA

# Update docker-compose.yml to use specific tags
# Then restart
docker compose up -d
```

## 📝 Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# FlowGrid aliases
alias fg-ssh='ssh -i ~/your-key.pem ubuntu@YOUR_EC2_IP'
alias fg-logs='docker compose logs -f'
alias fg-status='docker compose ps'
alias fg-restart='docker compose restart'
alias fg-deploy='docker compose pull && docker compose up -d'
alias fg-clean='docker image prune -af'
```

## 🔗 Quick Links

- **Frontend**: http://YOUR_EC2_IP
- **Backend**: http://YOUR_EC2_IP:5000/health
- **GitHub Actions**: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- **Docker Hub**: https://hub.docker.com/u/vikaskakarla

---

**Pro Tip**: Bookmark this page for quick reference! 📌
