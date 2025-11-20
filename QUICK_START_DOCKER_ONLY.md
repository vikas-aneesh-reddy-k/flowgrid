# ⚡ SUPER QUICK START - Docker Only (30 Minutes)

## 🎯 What You'll Do

1. Install Docker on EC2 (5 min)
2. Add GitHub secrets (10 min)
3. Push code (1 min)
4. Done! (auto-deploys in 2-3 min)

---

## 📋 Prerequisites

- ✅ AWS EC2 instance (t3.micro is fine!)
- ✅ SSH key (.pem file)
- ✅ GitHub repository
- ✅ 30 minutes

---

## 🚀 STEP-BY-STEP

### STEP 1: Install Docker on EC2 (5 minutes)

```bash
# 1. SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# 2. Run these commands (copy-paste all at once):
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && \
sudo usermod -aG docker ubuntu && \
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
mkdir -p /home/ubuntu/flowgrid && \
echo "✅ Docker installed! Now logout and login again."

# 3. Logout
exit

# 4. Login again
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# 5. Verify
docker --version
docker-compose --version

# 6. Get your EC2 IP
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

**Write down your EC2 IP:** ___________________

---

### STEP 2: Add GitHub Secrets (10 minutes)

#### 2.1 Generate JWT Secret (Local Computer)

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output.

#### 2.2 Get SSH Key Content

Open your .pem file in Notepad and copy ALL content.

#### 2.3 Add to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret" for each:

| Secret Name | Value |
|-------------|-------|
| `EC2_HOST` | Your EC2 IP (e.g., 54.123.45.67) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Your entire .pem file content |
| `REPO_URL` | `https://github.com/YOUR_USERNAME/YOUR_REPO.git` |
| `MONGO_PASSWORD` | `admin123` |
| `JWT_SECRET` | Generated secret from PowerShell |

---

### STEP 3: Deploy! (1 minute)

```bash
# On your local computer:
git add .
git commit -m "Deploy with Docker"
git push origin main
```

**That's it!** GitHub Actions will deploy automatically.

---

### STEP 4: Watch & Verify (3 minutes)

#### 4.1 Watch Deployment
1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click on the running workflow
3. Watch it deploy (2-3 minutes)

#### 4.2 Check Containers
```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Check containers
docker ps
```

You should see:
- flowgrid-frontend
- flowgrid-backend
- flowgrid-mongodb

#### 4.3 Test Application
Open browser: `http://YOUR_EC2_IP`

Test API: `http://YOUR_EC2_IP/api/health`

---

## 🎉 DONE!

### You Now Have:
- ✅ Frontend (React + Nginx)
- ✅ Backend (Node.js + Express + ALL APIs)
- ✅ Database (MongoDB with persistence)
- ✅ Auto-deployment (2-3 min on every push)

---

## 🔧 Quick Commands

### Check Status
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
docker ps
docker logs flowgrid-backend -f
```

### Restart
```bash
cd /home/ubuntu/flowgrid
docker-compose restart
```

### Seed Database
```bash
docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"
```

---

## 🐛 If Something Goes Wrong

### Check GitHub Actions
1. Go to Actions tab
2. Click on failed workflow
3. Read the error

### Check Docker Logs
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker-compose logs -f
```

### Restart Everything
```bash
docker-compose down
docker-compose up -d --build
```

---

## ✅ Backend & Database Integration

### All APIs Working:
- `/api/auth` - Login/Register
- `/api/products` - Products CRUD
- `/api/customers` - Customers CRUD
- `/api/orders` - Orders CRUD
- `/api/employees` - Employees CRUD
- `/api/dashboard` - Dashboard data
- `/api/health` - Health check

### Database:
- MongoDB 7.0
- Persistent storage
- Auto-initialization
- Seed data available

---

## 🎯 Test Auto-Deployment

```bash
# Make a change
echo "// Test" >> README.md

# Push
git add .
git commit -m "Test auto-deploy"
git push origin main

# Watch it deploy in GitHub Actions!
```

---

**That's it! Simplest deployment ever! 🚀**

Total time: 30 minutes
Cost: ~$7.50/month
Complexity: Minimal
