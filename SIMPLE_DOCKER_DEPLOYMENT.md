# 🚀 Simple Docker Deployment (No Jenkins!)

## ⚡ Super Fast Setup - 30 Minutes Total

This uses **GitHub Actions + Docker** only. Much simpler than Jenkins!

---

## ✅ What You Get

- ✅ **Full backend integration** - Express API working
- ✅ **Full database integration** - MongoDB with persistent data
- ✅ **Auto-deployment** - Push to GitHub → Live in 2-3 minutes
- ✅ **All APIs working** - Products, Orders, Customers, etc.
- ✅ **No Jenkins** - Simpler, faster, less memory

---

## 🎯 Quick Setup (30 Minutes)

### STEP 1: Prepare Your EC2 (10 minutes)

#### 1.1 SSH to Your t3.micro
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

#### 1.2 Install Docker (One Command!)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

SSH back in:
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

#### 1.3 Create Deployment Directory
```bash
# Create directory
mkdir -p /home/ubuntu/flowgrid
cd /home/ubuntu/flowgrid

# Get your EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Your EC2 IP: $EC2_IP"
```

**Write down your IP:** ___________________

---

### STEP 2: Configure GitHub Secrets (10 minutes)

#### 2.1 Generate JWT Secret
On your **local computer**, open PowerShell:
```powershell
# Generate random secret
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output.

#### 2.2 Get Your SSH Key Content
```powershell
# Open your key file
notepad your-key.pem
```

Copy ALL content (including BEGIN and END lines).

#### 2.3 Add Secrets to GitHub
1. Go to your GitHub repository
2. Click **Settings**
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add these secrets one by one:

| Name | Value |
|------|-------|
| **EC2_HOST** | Your EC2 IP address |
| **EC2_USER** | `ubuntu` |
| **EC2_SSH_KEY** | Your entire .pem file content |
| **REPO_URL** | `https://github.com/YOUR_USERNAME/YOUR_REPO.git` |
| **MONGO_PASSWORD** | `admin123` (or your choice) |
| **JWT_SECRET** | The generated secret from PowerShell |

**Important:** Click "Add secret" after each one!

---

### STEP 3: First Deployment (5 minutes)

#### 3.1 Push Your Code
On your **local computer**:
```bash
# Make sure all files are committed
git add .
git commit -m "Setup Docker deployment"
git push origin main
```

#### 3.2 Watch Deployment
1. Go to your GitHub repository
2. Click **Actions** tab
3. You'll see "Deploy to EC2 with Docker" running
4. Click on it to watch progress

**This takes 2-3 minutes!**

#### 3.3 Verify Deployment
SSH to EC2:
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Check containers
docker ps

# You should see 3 containers:
# - flowgrid-frontend
# - flowgrid-backend  
# - flowgrid-mongodb
```

---

### STEP 4: Test Your Application (5 minutes)

#### 4.1 Open Your Application
```
http://YOUR_EC2_IP
```

You should see your FlowGrid app!

#### 4.2 Test API
```
http://YOUR_EC2_IP/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### 4.3 Seed Database
```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Seed database
docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"
```

---

## 🎉 DONE! That's It!

### What You Have:
- ✅ Frontend running (React + Nginx)
- ✅ Backend running (Node.js + Express)
- ✅ Database running (MongoDB)
- ✅ All APIs working
- ✅ Auto-deployment on git push

### Test Auto-Deployment:
```bash
# Make a change
echo "// Test" >> src/App.tsx

# Push
git add .
git commit -m "Test deployment"
git push origin main

# Watch GitHub Actions deploy automatically!
```

---

## 📊 Your Access Points

- **Application:** `http://YOUR_EC2_IP`
- **API:** `http://YOUR_EC2_IP/api`
- **Health:** `http://YOUR_EC2_IP/api/health`
- **GitHub Actions:** Your repo → Actions tab

---

## 🔧 Useful Commands

### Check Status
```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Check containers
docker ps

# Check logs
docker logs flowgrid-backend -f
docker logs flowgrid-frontend -f
docker logs flowgrid-mongodb -f

# Check health
curl http://localhost/api/health
```

### Restart Services
```bash
cd /home/ubuntu/flowgrid
docker-compose restart
```

### Manual Deployment
```bash
cd /home/ubuntu/flowgrid
git pull origin main
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Deployment Failed?
1. Check GitHub Actions logs
2. SSH to EC2 and check: `docker-compose logs -f`
3. Restart: `docker-compose restart`

### Containers Not Starting?
```bash
# Check logs
docker-compose logs -f

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database Connection Failed?
```bash
# Check MongoDB
docker logs flowgrid-mongodb

# Restart
docker-compose restart mongodb
```

---

## 💡 Why This Is Better for You

### vs Jenkins:
- ✅ **Faster setup:** 30 min vs 1.5 hours
- ✅ **Less memory:** No Jenkins = more RAM for your app
- ✅ **Simpler:** Just Docker, no extra services
- ✅ **Free:** GitHub Actions is free for public repos
- ✅ **Easier to debug:** Logs in GitHub UI

### Perfect for t3.micro:
- ✅ Uses less memory
- ✅ Faster deployments
- ✅ No Jenkins overhead
- ✅ More resources for your app

---

## 🎯 Complete Backend & Database Integration

### Backend APIs Working:
- ✅ `/api/auth` - Authentication
- ✅ `/api/products` - Products CRUD
- ✅ `/api/customers` - Customers CRUD
- ✅ `/api/orders` - Orders CRUD
- ✅ `/api/employees` - Employees CRUD
- ✅ `/api/dashboard` - Dashboard stats
- ✅ `/api/health` - Health check

### Database Features:
- ✅ MongoDB 7.0
- ✅ Persistent storage (data survives restarts)
- ✅ Automatic initialization
- ✅ Indexes created
- ✅ Seed data script included

### Frontend Features:
- ✅ React application
- ✅ Nginx web server
- ✅ Reverse proxy to backend
- ✅ Static file serving
- ✅ Gzip compression

---

## 📈 Deployment Flow

```
You: git push origin main
    ↓
GitHub: Triggers workflow
    ↓
GitHub Actions: SSH to EC2
    ↓
EC2: Pull latest code
    ↓
EC2: Build Docker images
    ↓
EC2: Start containers
    ↓
EC2: Run health check
    ↓
✅ LIVE!
```

**Time: 2-3 minutes**

---

## 🔐 Security

- ✅ Secrets stored in GitHub (encrypted)
- ✅ SSH key authentication
- ✅ MongoDB not exposed publicly
- ✅ JWT authentication
- ✅ CORS configured
- ✅ Security headers (Helmet.js)

---

## 💰 Cost

- **EC2 t3.micro:** ~$7.50/month
- **GitHub Actions:** Free (2000 min/month)
- **Docker:** Free

**Total: ~$7.50/month**

---

## 🚀 Next Steps (Optional)

1. Change MongoDB password
2. Setup HTTPS with Let's Encrypt
3. Configure domain name
4. Setup automated backups

---

## ✅ Success Checklist

- [ ] Docker installed on EC2
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] All 3 containers running
- [ ] Frontend accessible
- [ ] API responding
- [ ] Database connected
- [ ] Auto-deployment working

---

**This is the fastest, simplest way to deploy with full backend and database integration!** 🎉

No Jenkins, no complexity, just Docker and GitHub Actions!
