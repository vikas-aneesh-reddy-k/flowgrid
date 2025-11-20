# 📸 Visual Setup Guide - Step by Step

## 🎯 Overview

This guide shows you exactly what to do with screenshots and examples.

---

## Part 1: AWS EC2 Setup

### Step 1: Launch EC2 Instance

**AWS Console → EC2 → Launch Instance**

```
┌─────────────────────────────────────────┐
│  Launch an instance                     │
├─────────────────────────────────────────┤
│  Name: flowgrid-production              │
│                                         │
│  Application and OS Images:             │
│  ☑ Ubuntu Server 22.04 LTS              │
│                                         │
│  Instance type:                         │
│  ☑ t2.medium (Recommended)              │
│                                         │
│  Key pair:                              │
│  ☑ Create new key pair                  │
│    Name: flowgrid-key                   │
│    Type: RSA                            │
│    Format: .pem                         │
│                                         │
│  Network settings:                      │
│  ☑ Allow SSH from: My IP                │
│  ☑ Allow HTTP from: Anywhere            │
│  ☑ Allow HTTPS from: Anywhere           │
│                                         │
│  Configure storage:                     │
│  ☑ 20 GB gp3                            │
│                                         │
│  [Launch instance]                      │
└─────────────────────────────────────────┘
```

### Step 2: Configure Security Group

**EC2 → Security Groups → Edit inbound rules**

```
┌──────────────────────────────────────────────────────────┐
│  Inbound rules                                           │
├──────────────────────────────────────────────────────────┤
│  Type          Port    Source          Description       │
├──────────────────────────────────────────────────────────┤
│  SSH           22      My IP           SSH access        │
│  HTTP          80      0.0.0.0/0       Frontend          │
│  HTTPS         443     0.0.0.0/0       Frontend SSL      │
│  Custom TCP    8080    My IP           Jenkins           │
│  Custom TCP    5000    0.0.0.0/0       Backend API       │
└──────────────────────────────────────────────────────────┘
```

### Step 3: Connect to EC2

**Windows PowerShell:**
```powershell
# Navigate to key location
cd C:\Users\YourName\Downloads

# Set permissions
icacls "flowgrid-key.pem" /inheritance:r
icacls "flowgrid-key.pem" /grant:r "%username%:R"

# Connect
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

**You should see:**
```
Welcome to Ubuntu 22.04.3 LTS
ubuntu@ip-172-31-xx-xx:~$
```

---

## Part 2: Install Everything

### Step 1: Run Setup Script

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup-ec2-complete.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**Expected output:**
```
🚀 Starting FlowGrid EC2 Setup...
==================================
✅ System updated
✅ Docker installed
✅ Docker Compose installed
✅ Java installed
✅ Jenkins installed
✅ Jenkins started
✅ Environment file created
==================================
✅ Setup Complete!
==================================

Jenkins URL: http://YOUR_EC2_IP:8080
Initial Password: abc123def456...
```

### Step 2: Verify Installation

```bash
# Check Docker
docker --version
# Output: Docker version 24.0.x

# Check Docker Compose
docker-compose --version
# Output: Docker Compose version v2.x.x

# Check Jenkins
sudo systemctl status jenkins
# Output: ● jenkins.service - Jenkins
#         Active: active (running)
```

---

## Part 3: Configure Jenkins

### Step 1: Access Jenkins

**Open browser:** `http://YOUR_EC2_IP:8080`

```
┌─────────────────────────────────────────┐
│  Unlock Jenkins                         │
├─────────────────────────────────────────┤
│  To ensure Jenkins is securely set up   │
│  by the administrator, a password has   │
│  been written to the log.               │
│                                         │
│  Administrator password:                │
│  ┌─────────────────────────────────┐   │
│  │ [paste password here]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Continue]                             │
└─────────────────────────────────────────┘
```

**Get password:**
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 2: Install Plugins

```
┌─────────────────────────────────────────┐
│  Customize Jenkins                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │  Install suggested plugins        │ │
│  │  (Recommended)                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Select plugins to install        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Click:** "Install suggested plugins"

**Wait for installation:**
```
Getting Started
Installing plugins...
☑ Git plugin
☑ Pipeline
☑ Docker Pipeline
☑ GitHub Integration
[Progress bar: ████████████████ 100%]
```

### Step 3: Create Admin User

```
┌─────────────────────────────────────────┐
│  Create First Admin User                │
├─────────────────────────────────────────┤
│  Username:    [admin]                   │
│  Password:    [your-password]           │
│  Confirm:     [your-password]           │
│  Full name:   [Your Name]               │
│  Email:       [your@email.com]          │
│                                         │
│  [Save and Continue]                    │
└─────────────────────────────────────────┘
```

### Step 4: Add Credentials

**Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

#### Docker Hub Credentials
```
┌─────────────────────────────────────────┐
│  Add Credentials                        │
├─────────────────────────────────────────┤
│  Kind: Username with password           │
│  Scope: Global                          │
│  Username: [your-dockerhub-username]    │
│  Password: [your-dockerhub-password]    │
│  ID: dockerhub-credentials              │
│  Description: Docker Hub Credentials    │
│                                         │
│  [Create]                               │
└─────────────────────────────────────────┘
```

#### EC2 SSH Key
```
┌─────────────────────────────────────────┐
│  Add Credentials                        │
├─────────────────────────────────────────┤
│  Kind: SSH Username with private key    │
│  Scope: Global                          │
│  ID: ec2-ssh-key                        │
│  Username: ubuntu                       │
│  Private Key: ☑ Enter directly          │
│  ┌─────────────────────────────────┐   │
│  │ -----BEGIN RSA PRIVATE KEY----- │   │
│  │ [paste your flowgrid-key.pem]   │   │
│  │ -----END RSA PRIVATE KEY-----   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Create]                               │
└─────────────────────────────────────────┘
```

#### MongoDB URI
```
┌─────────────────────────────────────────┐
│  Add Credentials                        │
├─────────────────────────────────────────┤
│  Kind: Secret text                      │
│  Scope: Global                          │
│  Secret: mongodb://admin:admin123@      │
│          mongodb:27017/flowgrid?        │
│          authSource=admin               │
│  ID: mongodb-uri                        │
│  Description: MongoDB Connection        │
│                                         │
│  [Create]                               │
└─────────────────────────────────────────┘
```

#### JWT Secret
```
┌─────────────────────────────────────────┐
│  Add Credentials                        │
├─────────────────────────────────────────┤
│  Kind: Secret text                      │
│  Scope: Global                          │
│  Secret: [generate with:                │
│           openssl rand -base64 32]      │
│  ID: jwt-secret                         │
│  Description: JWT Secret Key            │
│                                         │
│  [Create]                               │
└─────────────────────────────────────────┘
```

### Step 5: Configure Environment Variables

**Manage Jenkins → System → Global properties**

```
┌─────────────────────────────────────────┐
│  Global properties                      │
├─────────────────────────────────────────┤
│  ☑ Environment variables                │
│                                         │
│  Name                  Value            │
│  ─────────────────────────────────────  │
│  DOCKER_HUB_USERNAME   [your-username]  │
│  EC2_HOST              [your-ec2-ip]    │
│  EC2_USER              ubuntu           │
│                                         │
│  [Save]                                 │
└─────────────────────────────────────────┘
```

---

## Part 4: Create Jenkins Pipeline

### Step 1: Create New Job

**Dashboard → New Item**

```
┌─────────────────────────────────────────┐
│  Enter an item name                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ FlowGrid-Deploy                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ○ Freestyle project                    │
│  ● Pipeline                             │
│  ○ Multi-configuration project          │
│                                         │
│  [OK]                                   │
└─────────────────────────────────────────┘
```

### Step 2: Configure Pipeline

**General:**
```
Description: FlowGrid Automated Deployment
```

**Build Triggers:**
```
☑ GitHub hook trigger for GITScm polling
```

**Pipeline:**
```
┌─────────────────────────────────────────┐
│  Pipeline                               │
├─────────────────────────────────────────┤
│  Definition: Pipeline script from SCM   │
│  SCM: Git                               │
│  Repository URL:                        │
│  ┌─────────────────────────────────┐   │
│  │ https://github.com/YOUR_USER/   │   │
│  │ YOUR_REPO.git                   │   │
│  └─────────────────────────────────┘   │
│  Credentials: [Add if private repo]     │
│  Branch: */main                         │
│  Script Path: Jenkinsfile               │
│                                         │
│  [Save]                                 │
└─────────────────────────────────────────┘
```

---

## Part 5: GitHub Configuration

### Step 1: Add Webhook

**GitHub → Your Repository → Settings → Webhooks → Add webhook**

```
┌─────────────────────────────────────────┐
│  Add webhook                            │
├─────────────────────────────────────────┤
│  Payload URL:                           │
│  ┌─────────────────────────────────┐   │
│  │ http://YOUR_EC2_IP:8080/        │   │
│  │ github-webhook/                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Content type:                          │
│  ☑ application/json                     │
│                                         │
│  Which events?                          │
│  ● Just the push event                  │
│                                         │
│  ☑ Active                               │
│                                         │
│  [Add webhook]                          │
└─────────────────────────────────────────┘
```

**Verify webhook:**
```
✓ Last delivery was successful
  Response: 200 OK
```

---

## Part 6: First Deployment

### Step 1: Prepare EC2

```bash
# SSH to EC2
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_IP

# Create deployment directory
mkdir -p /home/ubuntu/flowgrid
cd /home/ubuntu/flowgrid

# Create .env file
nano .env
```

**Paste this:**
```env
MONGO_USER=admin
MONGO_PASSWORD=admin123
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/flowgrid?authSource=admin
JWT_SECRET=your-generated-jwt-secret
CORS_ORIGIN=*
VITE_API_URL=http://YOUR_EC2_IP/api
```

### Step 2: Trigger Deployment

**Local machine:**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

**Jenkins will automatically:**
```
Stage 1: Checkout ✓
Stage 2: Build Docker Images ✓
Stage 3: Run Tests ✓
Stage 4: Push to Docker Hub ✓
Stage 5: Deploy to EC2 ✓
Stage 6: Health Check ✓
```

### Step 3: Monitor Build

**Jenkins Dashboard:**
```
┌─────────────────────────────────────────┐
│  FlowGrid-Deploy                        │
├─────────────────────────────────────────┤
│  #1  ████████████████ SUCCESS          │
│      Started by GitHub push             │
│      Duration: 3 min 45 sec             │
│                                         │
│  Console Output:                        │
│  ✅ Deployment successful!              │
│  🌐 Application URL:                    │
│     http://YOUR_EC2_IP                  │
└─────────────────────────────────────────┘
```

---

## Part 7: Verify Deployment

### Step 1: Check Containers

```bash
# SSH to EC2
ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_IP

# Check containers
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                    STATUS
abc123def456   flowgrid-frontend:latest Up 2 minutes
def456ghi789   flowgrid-backend:latest  Up 2 minutes
ghi789jkl012   mongo:7.0                Up 2 minutes
```

### Step 2: Test Application

**Open browser:**
```
Frontend: http://YOUR_EC2_IP
API: http://YOUR_EC2_IP/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45,
  "timestamp": "2024-11-20T10:30:00.000Z"
}
```

### Step 3: Seed Database

```bash
# SSH to EC2
docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"
```

**Expected output:**
```
🌱 Seeding database...
✅ Created admin user
✅ Created 10 products
✅ Created 5 customers
✅ Created 8 orders
✅ Created 3 employees
✅ Database seeded successfully!
```

---

## 🎉 Success!

Your application is now live and will automatically deploy on every git push!

### Access Points:
- **Frontend:** `http://YOUR_EC2_IP`
- **API:** `http://YOUR_EC2_IP/api`
- **Jenkins:** `http://YOUR_EC2_IP:8080`

### Test Auto-Deployment:
```bash
# Make a change
echo "// Test change" >> src/App.tsx

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push origin main

# Watch Jenkins build automatically!
```

---

## 📊 Monitoring Dashboard

**Jenkins Build Status:**
```
┌─────────────────────────────────────────┐
│  Build History                          │
├─────────────────────────────────────────┤
│  #5  ✓ SUCCESS  2 min ago              │
│  #4  ✓ SUCCESS  1 hour ago             │
│  #3  ✓ SUCCESS  2 hours ago            │
│  #2  ✓ SUCCESS  1 day ago              │
│  #1  ✓ SUCCESS  2 days ago             │
└─────────────────────────────────────────┘
```

**Docker Status:**
```
┌─────────────────────────────────────────┐
│  Container Status                       │
├─────────────────────────────────────────┤
│  flowgrid-frontend   ✓ Running         │
│  flowgrid-backend    ✓ Running         │
│  flowgrid-mongodb    ✓ Running         │
└─────────────────────────────────────────┘
```

---

## 🔧 Quick Commands Reference

```bash
# View logs
docker logs flowgrid-backend -f

# Restart service
docker-compose restart backend

# Check health
curl http://localhost/api/health

# View all containers
docker ps

# Clean up
docker system prune -f
```

---

**Congratulations! Your CI/CD pipeline is complete! 🚀**
