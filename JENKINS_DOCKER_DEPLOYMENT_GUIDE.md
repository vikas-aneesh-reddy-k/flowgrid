# Complete Jenkins + Docker CI/CD Deployment Guide

This guide will help you set up automatic deployment from GitHub to AWS EC2 using Jenkins and Docker.

## 🎯 What This Setup Does

When you commit to GitHub:
1. Jenkins automatically detects the change
2. Builds Docker images for frontend and backend
3. Runs tests
4. Pushes images to Docker Hub
5. Deploys to AWS EC2
6. Connects to live MongoDB database
7. Everything runs in Docker containers

---

## 📋 Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or later)
- Docker Hub account
- GitHub repository
- Domain name (optional)

---

## Part 1: AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Instance type: **t2.medium** (minimum for Jenkins)
4. Configure Security Group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (8080) - Your IP (Jenkins)
   - Custom TCP (5000) - Anywhere (Backend API)
5. Create/download key pair (e.g., `flowgrid-key.pem`)
6. Launch instance

### Step 2: Connect to EC2

```bash
# Windows (PowerShell)
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Make key secure (if needed)
icacls "flowgrid-key.pem" /inheritance:r
icacls "flowgrid-key.pem" /grant:r "%username%:R"
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

### Step 4: Install Jenkins on EC2

```bash
# Reconnect to EC2
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Install Java
sudo apt install -y openjdk-17-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Add Jenkins to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 5: Configure Jenkins

1. Open browser: `http://YOUR_EC2_PUBLIC_IP:8080`
2. Enter initial admin password
3. Install suggested plugins
4. Create admin user
5. Set Jenkins URL: `http://YOUR_EC2_PUBLIC_IP:8080`

### Step 6: Install Jenkins Plugins

Go to: **Manage Jenkins** → **Plugins** → **Available plugins**

Install these plugins:
- Docker Pipeline
- GitHub Integration
- SSH Agent
- Credentials Binding
- Pipeline
- Git

Click **Install** and restart Jenkins.

---

## Part 2: Docker Hub Setup

### Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com
2. Sign up for free account
3. Verify email

### Step 2: Create Repositories

1. Click **Create Repository**
2. Create two repositories:
   - `flowgrid-frontend` (Public)
   - `flowgrid-backend` (Public)

---

## Part 3: Jenkins Configuration

### Step 1: Add Credentials in Jenkins

Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

#### Add Docker Hub Credentials
1. Click **Add Credentials**
2. Kind: **Username with password**
3. Username: Your Docker Hub username
4. Password: Your Docker Hub password
5. ID: `dockerhub-credentials`
6. Description: Docker Hub Credentials
7. Click **Create**

#### Add EC2 SSH Key
1. Click **Add Credentials**
2. Kind: **SSH Username with private key**
3. ID: `ec2-ssh-key`
4. Username: `ubuntu`
5. Private Key: **Enter directly**
6. Paste content of your `flowgrid-key.pem` file
7. Click **Create**

#### Add MongoDB URI
1. Click **Add Credentials**
2. Kind: **Secret text**
3. Secret: `mongodb://admin:admin123@mongodb:27017/flowgrid?authSource=admin`
4. ID: `mongodb-uri`
5. Click **Create**

#### Add JWT Secret
1. Click **Add Credentials**
2. Kind: **Secret text**
3. Secret: Generate random string (e.g., `openssl rand -base64 32`)
4. ID: `jwt-secret`
5. Click **Create**

### Step 2: Configure Environment Variables

Go to: **Manage Jenkins** → **System** → **Global properties**

Check **Environment variables** and add:
- Name: `DOCKER_HUB_USERNAME`, Value: Your Docker Hub username
- Name: `EC2_HOST`, Value: Your EC2 public IP
- Name: `EC2_USER`, Value: `ubuntu`

Click **Save**.

### Step 3: Create Jenkins Pipeline Job

1. Click **New Item**
2. Enter name: `FlowGrid-Deploy`
3. Select **Pipeline**
4. Click **OK**

#### Configure Pipeline

**General:**
- Description: FlowGrid Auto Deployment

**Build Triggers:**
- Check **GitHub hook trigger for GITScm polling**

**Pipeline:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: Your GitHub repo URL
- Credentials: Add GitHub credentials if private
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **Save**.

---

## Part 4: GitHub Setup

### Step 1: Add GitHub Webhook

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://YOUR_EC2_PUBLIC_IP:8080/github-webhook/`
4. Content type: `application/json`
5. Events: **Just the push event**
6. Active: ✓
7. Click **Add webhook**

### Step 2: Prepare EC2 for Deployment

SSH to EC2 and create deployment directory:

```bash
# Create deployment directory
mkdir -p /home/ubuntu/flowgrid
cd /home/ubuntu/flowgrid

# Create .env file
cat > .env << 'EOF'
MONGO_USER=admin
MONGO_PASSWORD=admin123
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/flowgrid?authSource=admin
JWT_SECRET=your-generated-jwt-secret-here
CORS_ORIGIN=*
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP/api
EOF

# Replace YOUR_EC2_PUBLIC_IP with actual IP
sed -i "s/YOUR_EC2_PUBLIC_IP/$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/g" .env
```

---

## Part 5: Test Deployment

### Step 1: Make a Test Commit

```bash
# In your local project
git add .
git commit -m "Test Jenkins deployment"
git push origin main
```

### Step 2: Monitor Jenkins

1. Go to Jenkins: `http://YOUR_EC2_PUBLIC_IP:8080`
2. Click on **FlowGrid-Deploy** job
3. Watch the build progress
4. Check console output for any errors

### Step 3: Verify Deployment

```bash
# Check if containers are running
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
docker ps

# Should see:
# - flowgrid-mongodb
# - flowgrid-backend
# - flowgrid-frontend

# Check logs
docker logs flowgrid-backend
docker logs flowgrid-frontend

# Test API
curl http://YOUR_EC2_PUBLIC_IP/api/health

# Test frontend
curl http://YOUR_EC2_PUBLIC_IP
```

### Step 4: Access Application

Open browser: `http://YOUR_EC2_PUBLIC_IP`

---

## Part 6: Database Setup

### Step 1: Seed Database

```bash
# SSH to EC2
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Run seed script in backend container
docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"
```

### Step 2: Verify Database

```bash
# Connect to MongoDB
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# In MongoDB shell
use flowgrid
show collections
db.users.find()
db.products.find()
exit
```

---

## 🔧 Troubleshooting

### Jenkins Build Fails

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Check Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Docker Build Fails

```bash
# Check Docker logs
docker logs flowgrid-backend
docker logs flowgrid-frontend

# Rebuild manually
cd /home/ubuntu/flowgrid
docker-compose down
docker-compose up --build -d
```

### Database Connection Issues

```bash
# Check MongoDB logs
docker logs flowgrid-mongodb

# Verify connection string
docker exec -it flowgrid-backend env | grep MONGODB_URI

# Test connection
docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### API Not Working

```bash
# Check backend logs
docker logs flowgrid-backend -f

# Check if backend is running
curl http://localhost:5000/api/health

# Check nginx proxy
docker exec -it flowgrid-frontend cat /etc/nginx/conf.d/default.conf
```

---

## 🚀 Deployment Workflow

Every time you push to GitHub:

1. **GitHub** → Webhook triggers Jenkins
2. **Jenkins** → Pulls latest code
3. **Jenkins** → Builds Docker images
4. **Jenkins** → Runs tests
5. **Jenkins** → Pushes to Docker Hub
6. **Jenkins** → SSH to EC2
7. **EC2** → Pulls latest images
8. **EC2** → Stops old containers
9. **EC2** → Starts new containers
10. **EC2** → Runs health checks
11. **Done!** → Application is live

---

## 📊 Monitoring

### Check Application Status

```bash
# All containers
docker ps

# Specific logs
docker logs flowgrid-backend -f
docker logs flowgrid-frontend -f
docker logs flowgrid-mongodb -f

# Resource usage
docker stats

# Health checks
curl http://YOUR_EC2_PUBLIC_IP/api/health
curl http://YOUR_EC2_PUBLIC_IP/health
```

### Jenkins Build History

- Go to Jenkins dashboard
- Click on job name
- View build history
- Check console output for each build

---

## 🔒 Security Best Practices

1. **Change default passwords** in `.env` file
2. **Use HTTPS** with SSL certificate (Let's Encrypt)
3. **Restrict Jenkins access** to your IP only
4. **Use private Docker repositories** for production
5. **Enable EC2 firewall** rules properly
6. **Rotate JWT secrets** regularly
7. **Use AWS Secrets Manager** for sensitive data

---

## 🎉 Success Checklist

- [ ] EC2 instance running
- [ ] Docker installed on EC2
- [ ] Jenkins installed and configured
- [ ] Docker Hub repositories created
- [ ] Jenkins credentials added
- [ ] GitHub webhook configured
- [ ] First deployment successful
- [ ] Application accessible via browser
- [ ] API endpoints working
- [ ] Database connected and seeded
- [ ] Auto-deployment working on git push

---

## 📞 Need Help?

If you encounter issues:
1. Check Jenkins console output
2. Check Docker logs
3. Verify all credentials are correct
4. Ensure security groups allow traffic
5. Check `.env` file configuration

Your application should now automatically deploy to AWS EC2 whenever you push to GitHub! 🚀
