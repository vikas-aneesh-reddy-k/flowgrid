# Detailed Troubleshooting Guide

## 🔍 Common Issues and Solutions

### 1. Jenkins Build Fails

#### Issue: "Permission denied" when building Docker images

**Symptoms:**
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

#### Issue: Jenkins can't connect to GitHub

**Symptoms:**
```
Failed to connect to repository
```

**Solution:**
1. Check GitHub webhook URL: `http://YOUR_EC2_IP:8080/github-webhook/`
2. Verify webhook is active in GitHub settings
3. Check Jenkins GitHub plugin is installed
4. Test webhook delivery in GitHub

---

### 2. Docker Build Issues

#### Issue: Frontend build fails

**Symptoms:**
```
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

**Solution:**
```bash
# Check if VITE_API_URL is set correctly
docker build --build-arg VITE_API_URL=http://YOUR_EC2_IP/api -f Dockerfile.frontend .

# Check for syntax errors in code
npm run build

# Clear Docker cache
docker builder prune -a
```

#### Issue: Backend build fails

**Symptoms:**
```
TypeScript compilation errors
```

**Solution:**
```bash
# Check TypeScript errors locally
cd server
npm install
npm run build

# Fix any TypeScript errors
# Then rebuild Docker image
docker build -t flowgrid-backend -f server/Dockerfile ./server
```

---

### 3. Database Connection Issues

#### Issue: Backend can't connect to MongoDB

**Symptoms:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solution:**
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs flowgrid-mongodb

# Verify connection string
docker exec -it flowgrid-backend env | grep MONGODB_URI

# Test MongoDB connection
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Restart MongoDB
docker-compose restart mongodb

# Check network connectivity
docker network inspect flowgrid_flowgrid-network
```

#### Issue: MongoDB authentication failed

**Symptoms:**
```
MongoServerError: Authentication failed
```

**Solution:**
```bash
# Check credentials in .env file
cat /home/ubuntu/flowgrid/.env

# Recreate MongoDB with correct credentials
docker-compose down -v
docker-compose up -d mongodb

# Wait for MongoDB to initialize
sleep 10

# Test connection
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

---

### 4. API Not Working

#### Issue: 404 on API endpoints

**Symptoms:**
```
GET http://YOUR_EC2_IP/api/health 404 Not Found
```

**Solution:**
```bash
# Check if backend is running
docker ps | grep backend

# Check backend logs
docker logs flowgrid-backend -f

# Test backend directly
curl http://localhost:5000/api/health

# Check nginx proxy configuration
docker exec -it flowgrid-frontend cat /etc/nginx/conf.d/default.conf

# Restart frontend to reload nginx
docker-compose restart frontend
```

#### Issue: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Check CORS_ORIGIN in backend
docker exec -it flowgrid-backend env | grep CORS_ORIGIN

# Update .env file
cd /home/ubuntu/flowgrid
nano .env
# Set: CORS_ORIGIN=*

# Restart backend
docker-compose restart backend

# Or update in code (server/src/index.ts)
# Set origin: '*' in CORS configuration
```

---

### 5. Frontend Not Loading

#### Issue: White screen or blank page

**Symptoms:**
- Browser shows blank page
- Console shows errors

**Solution:**
```bash
# Check frontend logs
docker logs flowgrid-frontend

# Check if nginx is serving files
docker exec -it flowgrid-frontend ls -la /usr/share/nginx/html

# Rebuild frontend
docker-compose up --build -d frontend

# Check nginx configuration
docker exec -it flowgrid-frontend nginx -t

# Restart nginx
docker-compose restart frontend
```

#### Issue: API calls failing from frontend

**Symptoms:**
```
Network Error or Failed to fetch
```

**Solution:**
```bash
# Check VITE_API_URL during build
# Should be: http://YOUR_EC2_IP/api

# Rebuild with correct API URL
docker build --build-arg VITE_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api -f Dockerfile.frontend -t flowgrid-frontend .

# Or update docker-compose.yml
nano docker-compose.yml
# Update VITE_API_URL in frontend service

# Rebuild
docker-compose up --build -d frontend
```

---

### 6. Deployment Issues

#### Issue: SSH connection fails from Jenkins

**Symptoms:**
```
Permission denied (publickey)
```

**Solution:**
1. Verify EC2 SSH key in Jenkins credentials
2. Check key format (should be PEM format)
3. Test SSH manually:
```bash
ssh -i /path/to/key ubuntu@YOUR_EC2_IP
```
4. Check EC2 security group allows SSH from Jenkins

#### Issue: Docker Compose fails on EC2

**Symptoms:**
```
docker-compose: command not found
```

**Solution:**
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

---

### 7. Performance Issues

#### Issue: Application is slow

**Solution:**
```bash
# Check resource usage
docker stats

# Check EC2 instance type
# Upgrade if needed: t2.micro → t2.medium

# Check MongoDB indexes
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
use flowgrid
db.products.getIndexes()
db.orders.getIndexes()

# Add indexes if missing
db.products.createIndex({ sku: 1 })
db.orders.createIndex({ orderNumber: 1 })
```

#### Issue: Out of memory

**Symptoms:**
```
Container keeps restarting
OOMKilled in docker ps
```

**Solution:**
```bash
# Check memory usage
free -h
docker stats

# Add memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
  mongodb:
    mem_limit: 1g

# Restart with limits
docker-compose up -d
```

---

### 8. Security Issues

#### Issue: MongoDB exposed to public

**Solution:**
```bash
# Check if MongoDB port is exposed
netstat -tulpn | grep 27017

# Remove port mapping from docker-compose.yml
# Comment out or remove:
# ports:
#   - "27017:27017"

# Restart
docker-compose up -d
```

#### Issue: Jenkins exposed to public

**Solution:**
```bash
# Update EC2 security group
# Restrict port 8080 to your IP only

# Or use nginx reverse proxy with authentication
```

---

### 9. Data Loss Issues

#### Issue: Database data lost after restart

**Solution:**
```bash
# Check if volume is created
docker volume ls | grep mongodb

# Verify volume mount in docker-compose.yml
volumes:
  - mongodb_data:/data/db

# Backup database
docker exec flowgrid-mongodb mongodump --out /backup -u admin -p admin123 --authenticationDatabase admin

# Copy backup from container
docker cp flowgrid-mongodb:/backup ./mongodb-backup
```

---

### 10. Network Issues

#### Issue: Containers can't communicate

**Symptoms:**
```
Backend can't reach MongoDB
Frontend can't reach Backend
```

**Solution:**
```bash
# Check network
docker network ls
docker network inspect flowgrid_flowgrid-network

# Verify all containers are on same network
docker ps --format "table {{.Names}}\t{{.Networks}}"

# Recreate network
docker-compose down
docker-compose up -d

# Test connectivity
docker exec -it flowgrid-backend ping mongodb
docker exec -it flowgrid-backend curl http://backend:5000/api/health
```

---

## 🔧 Diagnostic Commands

### Check Everything
```bash
#!/bin/bash

echo "=== System Info ==="
uname -a
free -h
df -h

echo -e "\n=== Docker Info ==="
docker --version
docker-compose --version
docker ps

echo -e "\n=== Container Logs ==="
docker logs flowgrid-backend --tail 50
docker logs flowgrid-frontend --tail 50
docker logs flowgrid-mongodb --tail 50

echo -e "\n=== Network Info ==="
docker network ls
docker network inspect flowgrid_flowgrid-network

echo -e "\n=== Health Checks ==="
curl -f http://localhost:5000/api/health || echo "Backend health check failed"
curl -f http://localhost/health || echo "Frontend health check failed"

echo -e "\n=== Resource Usage ==="
docker stats --no-stream
```

### Reset Everything
```bash
#!/bin/bash

echo "⚠️  This will delete all containers and data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    cd /home/ubuntu/flowgrid
    
    # Stop and remove everything
    docker-compose down -v
    
    # Remove images
    docker rmi $(docker images -q flowgrid-*)
    
    # Clean up
    docker system prune -a -f
    
    # Rebuild and start
    docker-compose up --build -d
    
    echo "✅ Reset complete!"
fi
```

---

## 📞 Getting Help

### Collect Debug Information
```bash
# Create debug report
cat > debug-report.txt << EOF
Date: $(date)
EC2 IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

=== Docker Containers ===
$(docker ps -a)

=== Docker Images ===
$(docker images)

=== Backend Logs ===
$(docker logs flowgrid-backend --tail 100)

=== Frontend Logs ===
$(docker logs flowgrid-frontend --tail 100)

=== MongoDB Logs ===
$(docker logs flowgrid-mongodb --tail 100)

=== Environment ===
$(docker exec flowgrid-backend env | grep -v PASSWORD | grep -v SECRET)

=== Network ===
$(docker network inspect flowgrid_flowgrid-network)
EOF

cat debug-report.txt
```

### Test Checklist
- [ ] EC2 instance is running
- [ ] Security groups allow traffic
- [ ] Docker is installed and running
- [ ] Docker Compose is installed
- [ ] All containers are running
- [ ] MongoDB is accessible
- [ ] Backend health check passes
- [ ] Frontend is accessible
- [ ] API endpoints work
- [ ] Database has data
- [ ] Jenkins can connect to EC2
- [ ] GitHub webhook is configured

---

## 🎯 Quick Fixes

### Restart Everything
```bash
cd /home/ubuntu/flowgrid
docker-compose restart
```

### Rebuild Everything
```bash
cd /home/ubuntu/flowgrid
docker-compose down
docker-compose up --build -d
```

### Check Logs
```bash
docker-compose logs -f
```

### Clean and Restart
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d
```
