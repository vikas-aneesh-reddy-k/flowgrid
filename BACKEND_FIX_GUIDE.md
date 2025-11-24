# 🔧 Backend Issues Fix Guide

## Current Issues:
1. ❌ Frontend not updating on EC2
2. ❌ Login/Signup not working
3. ❌ MongoDB not receiving data
4. ❌ Backend API not accessible

## Root Cause:
The backend container is either:
- Not starting properly
- Not connecting to MongoDB
- Not accessible from the frontend
- Port 5000 is blocked by EC2 security group

---

## 🚀 Complete Fix - Step by Step

### Step 1: Open Backend Port in EC2 Security Group

1. **Go to AWS Console** → EC2 → Instances
2. Click on your instance
3. Click on **Security** tab
4. Click on the **Security Group** link
5. Click **Edit inbound rules**
6. Click **Add rule**:
   - **Type**: Custom TCP
   - **Port range**: 5000
   - **Source**: 0.0.0.0/0 (or your IP for security)
   - **Description**: Backend API
7. Click **Save rules**

### Step 2: Run the Fix Script

```bash
# Make script executable
chmod +x scripts/fix-ec2-deployment.sh

# Run the fix
./scripts/fix-ec2-deployment.sh
```

### Step 3: Verify Deployment

```bash
# SSH to EC2
ssh -i flowgrid-key.pem ubuntu@13.62.224.81

# Check all containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend --tail=50

# Check MongoDB logs
docker-compose logs mongodb --tail=30

# Check if backend is responding
curl http://localhost:5000/health

# Check MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Step 4: Test the Application

1. **Frontend**: http://13.62.224.81
2. **Try to sign up** - should work now
3. **Try to login** - should work now
4. **Check MongoDB**:
   ```bash
   ssh -i flowgrid-key.pem ubuntu@13.62.224.81
   docker-compose exec mongodb mongosh -u admin -p FlowGrid2024SecurePassword!
   use flowgrid
   db.users.find()
   ```

---

## 🔍 Troubleshooting

### If Backend Still Not Working:

```bash
# SSH to EC2
ssh -i flowgrid-key.pem ubuntu@13.62.224.81

# Restart everything
docker-compose down
docker-compose up -d

# Watch logs in real-time
docker-compose logs -f backend
```

### If MongoDB Connection Fails:

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.version()"
```

### If Frontend Not Updating:

```bash
# Force pull latest images
docker-compose pull
docker-compose up -d --force-recreate

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## 📝 Environment Variables Check

Make sure `.env` file on EC2 has correct values:

```bash
ssh -i flowgrid-key.pem ubuntu@13.62.224.81
cat .env
```

Should contain:
```env
MONGO_USER=admin
MONGO_PASSWORD=FlowGrid2024SecurePassword!
MONGODB_URI=mongodb://admin:FlowGrid2024SecurePassword!@mongodb:27017/flowgrid?authSource=admin
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://13.62.224.81
```

---

## ✅ Success Checklist

- [ ] EC2 Security Group allows port 5000
- [ ] All containers running (`docker-compose ps` shows "Up")
- [ ] Backend responds to health check
- [ ] MongoDB is accessible
- [ ] Frontend loads at http://13.62.224.81
- [ ] Can sign up new user
- [ ] Can login with credentials
- [ ] User appears in MongoDB

---

## 🆘 Quick Commands

```bash
# Restart everything
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose restart"

# View all logs
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose logs --tail=100"

# Check what's using port 5000
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "sudo netstat -tlnp | grep 5000"

# Force recreate containers
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose up -d --force-recreate"
```

---

## 🎯 Expected Result

After following these steps:
- ✅ Frontend updates automatically on code push
- ✅ Users can sign up and login
- ✅ Data is saved to MongoDB
- ✅ All API calls work properly
- ✅ Website works exactly like localhost
