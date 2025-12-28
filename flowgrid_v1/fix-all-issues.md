# 🔥 Fix All Issues - Complete Guide

## Current Problems

1. ✅ **Frontend working** - http://16.170.155.235 loads
2. ❌ **Backend failing** - Port 5000 timeout (signup/login broken)
3. ❌ **Jenkins failing** - Deploy to EC2 stage
4. ❌ **GitHub Actions failing** - SSH timeout

---

## Root Causes

### Issue 1: Backend Not Responding (Port 5000)
**Error**: `POST http://16.170.155.235:5000/api/auth/register net::ERR_CONNECTION_TIMED_OUT`

**Possible causes**:
- Backend container not running
- Port 5000 blocked in Security Group (you added it, but verify)
- Backend crashed due to MongoDB connection issue
- Wrong environment variables

### Issue 2: Jenkins & GitHub Actions Failing
**Error**: SSH timeout / connection refused

**Cause**: 
- Security Group rules added but not applied to instance
- Or CloudflareWARP blocking your local tests (but deployments from AWS should work)

---

## 🚀 Complete Fix (10 Minutes)

### Step 1: Verify Security Group is Attached (2 min)

1. Go to AWS Console → EC2 → Instances
2. Click your instance
3. Click **Actions** → **Security** → **Change security groups**
4. Make sure the security group with all the rules is **checked**
5. Click **Save**

### Step 2: SSH to EC2 and Check Containers (3 min)

```cmd
ssh -i your-key.pem ubuntu@16.170.155.235
```

Once connected, run:

```bash
cd /home/ubuntu/flowgrid

# Check container status
docker compose ps

# Check backend logs
docker compose logs backend --tail=50

# Check if .env file exists
cat .env
```

**Expected output**:
- 3 containers running (mongodb, backend, frontend)
- All showing "healthy" status

**If backend is not running or unhealthy**:

```bash
# Check what's wrong
docker compose logs backend

# Common issues and fixes:

# Issue: MongoDB connection failed
# Fix: Restart all services
docker compose down
docker compose up -d

# Issue: .env file missing
# Fix: Create it
cat > .env << 'EOF'
MONGO_USER=admin
MONGO_PASSWORD=FlowGrid2024SecurePassword!
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!
NODE_ENV=production
CORS_ORIGIN=http://16.170.155.235
EOF

# Then restart
docker compose down
docker compose up -d

# Issue: Port 5000 already in use
# Fix: Kill the process
sudo lsof -ti:5000 | xargs sudo kill -9
docker compose up -d
```

### Step 3: Test Backend from EC2 (1 min)

While still SSH'd into EC2:

```bash
# Test backend health endpoint
curl http://localhost:5000/health

# Should return: {"status":"ok"}

# Test from outside
curl http://16.170.155.235:5000/health
```

If localhost works but external doesn't, **port 5000 is blocked in Security Group**.

### Step 4: Verify Security Group Rules (2 min)

Go back to AWS Console → EC2 → Security Groups

Your security group should have these **exact** rules:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 9000 | 0.0.0.0/0 | Webhook (optional) |
| Custom TCP | TCP | 27017 | 0.0.0.0/0 or My IP | MongoDB |

**Important**: Make sure Source is `0.0.0.0/0` (not "Custom" with empty value)

### Step 5: Restart Jenkins (1 min)

```cmd
net stop jenkins
net start jenkins
```

### Step 6: Re-run Deployments (1 min)

**GitHub Actions**:
1. Go to: https://github.com/vikas-aneesh-reddy-k/flowgrid/actions
2. Click failed workflow
3. Click **Re-run all jobs**

**Jenkins**:
1. Go to: http://localhost:8080
2. Click your job
3. Click **Build Now**

---

## 🧪 Quick Diagnostic

Run this to diagnose all issues:

```cmd
.\diagnose-and-fix.bat
```

This will test:
- Frontend (port 80)
- Backend (port 5000)
- SSH connection
- Docker containers
- Backend logs

---

## 🔍 Detailed Troubleshooting

### Backend Not Responding

**Test from your computer**:
```cmd
curl http://16.170.155.235:5000/health
```

**If timeout**:
1. Port 5000 blocked in Security Group
2. Backend container not running
3. Backend crashed

**Fix**:
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@16.170.155.235

# Check containers
cd /home/ubuntu/flowgrid
docker compose ps

# If backend not running
docker compose up -d backend

# If backend unhealthy
docker compose logs backend
docker compose restart backend

# If still failing
docker compose down
docker compose up -d
```

### Jenkins Still Using Old Code

**Symptoms**: Still seeing `curl` to port 9000

**Fix**:
1. Restart Jenkins (forces reload)
2. Or delete workspace:
   - Go to Jenkins job
   - Click **Workspace**
   - Click **Wipe Out Current Workspace**
   - Click **Build Now**

### GitHub Actions SSH Timeout

**If still failing after Security Group fix**:

1. **Check GitHub Secrets**:
   - Go to: Repository → Settings → Secrets → Actions
   - Verify `EC2_HOST` = `16.170.155.235`
   - Verify `EC2_USERNAME` = `ubuntu`
   - Verify `EC2_SSH_KEY` has entire .pem file content

2. **Test SSH key format**:
   - Must include BEGIN/END lines
   - No extra spaces or characters
   - Use the exact same .pem file that works locally

3. **Check EC2 is running**:
   - AWS Console → EC2 → Instances
   - Instance state should be "Running"

### MongoDB Connection Issues

**Symptoms**: Backend logs show "MongoServerError" or "ECONNREFUSED"

**Fix**:
```bash
ssh -i your-key.pem ubuntu@16.170.155.235
cd /home/ubuntu/flowgrid

# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Restart MongoDB
docker compose restart mongodb

# Wait 10 seconds for MongoDB to start
sleep 10

# Restart backend
docker compose restart backend
```

### CORS Errors

**Symptoms**: Browser console shows CORS errors

**Fix**:
```bash
ssh -i your-key.pem ubuntu@16.170.155.235
cd /home/ubuntu/flowgrid

# Check CORS_ORIGIN in .env
cat .env | grep CORS_ORIGIN

# Should be: CORS_ORIGIN=http://16.170.155.235

# If wrong, fix it
nano .env
# Update CORS_ORIGIN=http://16.170.155.235
# Save: Ctrl+X, Y, Enter

# Restart backend
docker compose restart backend
```

---

## ✅ Verification Checklist

After fixes, verify everything works:

### Frontend
- [ ] Open: http://16.170.155.235
- [ ] Page loads without errors
- [ ] No console errors

### Backend
- [ ] Test: `curl http://16.170.155.235:5000/health`
- [ ] Returns: `{"status":"ok"}`
- [ ] No timeout

### Signup/Login
- [ ] Open: http://16.170.155.235
- [ ] Click "Sign Up"
- [ ] Fill form and submit
- [ ] Should create account successfully
- [ ] No "Failed to fetch" error

### Docker Containers
```bash
ssh -i your-key.pem ubuntu@16.170.155.235
cd /home/ubuntu/flowgrid
docker compose ps
```
- [ ] 3 containers running
- [ ] All show "healthy" status
- [ ] No "restarting" containers

### GitHub Actions
- [ ] Go to Actions tab
- [ ] Latest workflow shows green checkmark
- [ ] All stages passed

### Jenkins
- [ ] Latest build shows blue ball (success)
- [ ] All stages passed
- [ ] No errors in console output

---

## 🎯 Most Likely Issues

Based on your errors, here's what's probably wrong:

### 1. Backend Container Not Running (90% likely)
**Fix**: SSH to EC2 and run `docker compose up -d`

### 2. Port 5000 Blocked (80% likely)
**Fix**: Verify Security Group has port 5000 rule with source 0.0.0.0/0

### 3. MongoDB Not Connected (70% likely)
**Fix**: Restart containers: `docker compose down && docker compose up -d`

### 4. Wrong .env File (60% likely)
**Fix**: Check CORS_ORIGIN and MongoDB credentials in .env

---

## 🚨 Quick Fix Commands

If you just want to fix it fast, SSH to EC2 and run:

```bash
cd /home/ubuntu/flowgrid

# Nuclear option - restart everything
docker compose down
docker compose pull
docker compose up -d

# Wait 30 seconds
sleep 30

# Check status
docker compose ps

# Test backend
curl http://localhost:5000/health
```

Then test signup from your browser.

---

## 📞 Still Not Working?

Run the diagnostic script:
```cmd
.\diagnose-and-fix.bat
```

And send me the output. I'll tell you exactly what's wrong.

---

**TL;DR**:
1. SSH to EC2: `ssh -i your-key.pem ubuntu@16.170.155.235`
2. Restart containers: `cd /home/ubuntu/flowgrid && docker compose down && docker compose up -d`
3. Test backend: `curl http://16.170.155.235:5000/health`
4. Restart Jenkins: `net stop jenkins && net start jenkins`
5. Re-run deployments

Should fix everything! 🎉
