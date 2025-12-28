# 🚨 URGENT: Fix Deployment Issues NOW

## Both Jenkins and GitHub Actions are failing!

### Problem 1: AWS Security Group Blocking SSH ❌
**Error**: `dial tcp ***:22: i/o timeout`

### Problem 2: Jenkins Using Old Code ❌
**Error**: `curl: (28) Failed to connect to port 9000`

---

## 🔥 Fix in 3 Steps (5 Minutes)

### Step 1: Fix AWS Security Group (CRITICAL - 2 minutes)

**This is blocking BOTH Jenkins and GitHub Actions!**

1. **Open AWS Console**: https://console.aws.amazon.com/ec2/
2. Click **Instances** → Select your FlowGrid instance
3. Click **Security** tab
4. Click the **Security Group** link (e.g., `sg-xxxxx`)
5. Click **Edit inbound rules**
6. Click **Add rule**:
   - Type: **SSH**
   - Port: **22**
   - Source: **0.0.0.0/0**
   - Description: SSH for deployments
7. Click **Save rules**

**Verify it worked**:
```cmd
powershell Test-NetConnection -ComputerName 16.170.155.235 -Port 22
```
Should show: `TcpTestSucceeded : True`

---

### Step 2: Fix Jenkins (2 minutes)

Jenkins is using old cached code. Two options:

**Option A: Restart Jenkins (Easiest)**
```cmd
# Stop Jenkins
net stop jenkins

# Start Jenkins
net start jenkins
```

**Option B: Update Jenkins Job**
1. Go to Jenkins: `http://localhost:8080`
2. Go to your `flowgrid-production` job
3. Click **Configure**
4. Scroll to **Pipeline** section
5. Click **Save** (this forces Jenkins to reload the Jenkinsfile)

---

### Step 3: Re-run Deployments (1 minute)

**GitHub Actions**:
1. Go to: https://github.com/vikas-aneesh-reddy-k/flowgrid/actions
2. Click the failed workflow
3. Click **Re-run all jobs**

**Jenkins**:
1. Go to: `http://localhost:8080`
2. Click your job
3. Click **Build Now**

---

## ✅ Verification

After fixing, both should succeed:

### GitHub Actions Should Show:
```
✓ Checkout code
✓ Build and push backend
✓ Build and push frontend
✓ Deploy to EC2  ← This should now work!
```

### Jenkins Should Show:
```
✓ Checkout SCM
✓ Install Dependencies
✓ Lint & Type Check
✓ Run Tests
✓ Build Docker Images
✓ Push to Docker Hub
✓ Deploy to EC2  ← This should now work!
✓ Health Check
```

---

## 🔍 Why This Happened

### GitHub Actions Failure
- AWS Security Group was blocking SSH (port 22)
- GitHub Actions couldn't connect to EC2
- **Fix**: Open port 22 in Security Group

### Jenkins Failure
- Jenkins was using OLD cached Jenkinsfile
- Old version tried to use webhook (port 9000) which doesn't exist
- New version uses SSH (port 22) which will work after Security Group fix
- **Fix**: Restart Jenkins to reload Jenkinsfile

---

## 🧪 Test Before Re-running

Run this to verify SSH works:
```cmd
deploy\test-ec2-connection.bat
```

Enter:
- EC2 IP: `16.170.155.235`
- PEM file path: `path\to\your-key.pem`

All 4 tests should pass!

---

## 📞 If Still Failing

### GitHub Actions Still Fails?

**Check GitHub Secrets**:
1. Go to: Repository → Settings → Secrets → Actions
2. Verify these exist:
   - `EC2_HOST` = `16.170.155.235`
   - `EC2_USERNAME` = `ubuntu`
   - `EC2_SSH_KEY` = Your entire .pem file content
   - `DOCKER_USERNAME` = `vikaskakarla`
   - `DOCKER_PASSWORD` = Your Docker Hub token
   - `VITE_API_URL` = `http://16.170.155.235:5000/api`

**Test SSH manually**:
```cmd
ssh -i your-key.pem ubuntu@16.170.155.235
```

### Jenkins Still Fails?

**If still showing curl/webhook error**:
1. Jenkins didn't reload the Jenkinsfile
2. Force reload:
   ```cmd
   # Restart Jenkins service
   net stop jenkins
   net start jenkins
   ```
3. Or delete workspace:
   - Go to Jenkins job
   - Click **Workspace**
   - Click **Wipe Out Current Workspace**
   - Click **Build Now**

**If showing SSH error**:
1. Check Jenkins credentials:
   - Go to: Manage Jenkins → Credentials
   - Verify `ec2-ssh-key` exists
   - Verify it has your entire .pem file content

2. Check Jenkins environment variables:
   - Go to: Manage Jenkins → System → Global properties
   - Verify:
     - `EC2_HOST` = `16.170.155.235`
     - `EC2_USERNAME` = `ubuntu`
     - `VITE_API_URL` = `http://16.170.155.235:5000/api`

---

## 🎯 Quick Summary

1. **Fix AWS Security Group** (open port 22) ← MOST IMPORTANT
2. **Restart Jenkins** (reload Jenkinsfile)
3. **Re-run both deployments**

**Time**: 5 minutes
**Result**: Both will deploy successfully! 🎉

---

## 📋 Security Group Rules You Need

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | 0.0.0.0/0 | For deployments |
| HTTP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |
| Custom TCP | 27017 | My IP | MongoDB (optional) |

---

**DO THIS NOW**: Fix Security Group first, then restart Jenkins, then re-run deployments!
