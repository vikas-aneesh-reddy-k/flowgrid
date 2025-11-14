# 🔧 Quick Troubleshooting Guide

## Common Issues and Solutions

### 1. Can't SSH into EC2

**Error:** `Permission denied (publickey)` or `Connection refused`

**Solutions:**
```bash
# Fix permissions
chmod 400 your-key.pem

# Verify you're using the right user
ssh -i your-key.pem ubuntu@YOUR_EC2_IP  # NOT ec2-user or root

# Check Security Group allows SSH
# AWS Console → EC2 → Security Groups → Inbound Rules
# Should have: SSH (22) from 0.0.0.0/0 or your IP
```

### 2. GitHub Actions Deployment Fails

**Error:** `Host key verification failed` or `Permission denied`

**Solutions:**
- Verify GitHub secrets are correct:
  - `AWS_EC2_HOST` - Just the IP, no http:// or trailing slash
  - `AWS_EC2_USER` - Should be `ubuntu`
  - `AWS_SSH_KEY` - Entire .pem file including BEGIN/END lines

- Check Security Group allows SSH from anywhere (0.0.0.0/0)

### 3. Can't Access Website

**Error:** Browser shows "This site can't be reached"

**Solutions:**
```bash
# SSH into EC2 and check:

# 1. Check Nginx
sudo systemctl status nginx
sudo systemctl restart nginx

# 2. Check firewall
sudo ufw status
# Should show: 80/tcp ALLOW

# 3. Check Security Group
# AWS Console → EC2 → Security Groups
# Should have: HTTP (80) from 0.0.0.0/0

# 4. Test locally on EC2
curl http://localhost
```

### 4. Backend API Not Working

**Error:** API calls fail or return 502/504

**Solutions:**
```bash
# SSH into EC2 and check:

# 1. Check PM2 status
pm2 status
pm2 logs flowgrid-backend --lines 50

# 2. Check MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# 3. Check environment variables
cat ~/flowgrid/server/.env

# 4. Restart backend
pm2 restart flowgrid-backend

# 5. Check if port 5000 is listening
sudo netstat -tlnp | grep 5000
```

### 5. MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
```bash
# 1. Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 2. Check status
sudo systemctl status mongod

# 3. Check logs
sudo journalctl -u mongod -n 50

# 4. Verify connection string
cat ~/flowgrid/server/.env
# Should be: MONGODB_URI=mongodb://localhost:27017/flowgrid
```

### 6. Build Fails

**Error:** `npm run build` fails during deployment

**Solutions:**
```bash
# SSH into EC2 and try manually:

cd ~/flowgrid

# Update dependencies
npm ci
cd server && npm ci && cd ..

# Try building
npm run build
cd server && npm run build && cd ..

# Check for errors in output
```

### 7. Out of Memory

**Error:** `JavaScript heap out of memory`

**Solutions:**
```bash
# Increase Node.js memory (temporary)
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# Or upgrade to t2.small instance (1GB → 2GB RAM)
```

### 8. Nginx 502 Bad Gateway

**Error:** Website shows "502 Bad Gateway"

**Solutions:**
```bash
# Backend is not running or crashed

# 1. Check PM2
pm2 status
pm2 logs flowgrid-backend

# 2. Restart backend
pm2 restart flowgrid-backend

# 3. Check if backend is listening
curl http://localhost:5000/api

# 4. Check Nginx config
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Changes Not Showing

**Error:** Pushed changes but website looks the same

**Solutions:**
```bash
# 1. Check GitHub Actions completed successfully
# GitHub → Actions tab → Should be green ✅

# 2. SSH into EC2 and verify
cd ~/flowgrid
git log -1  # Should show your latest commit

# 3. Clear browser cache
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# 4. Check build was deployed
ls -la /var/www/flowgrid/
```

### 10. GitHub Secrets Not Working

**Error:** Deployment skips or fails with secret errors

**Solutions:**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Verify all 3 secrets exist:
   - AWS_EC2_HOST
   - AWS_EC2_USER
   - AWS_SSH_KEY
3. Re-create secrets if needed (delete and add again)
4. Make sure no extra spaces or newlines

## Quick Diagnostic Commands

Run these on EC2 to check everything:

```bash
# System status
echo "=== System Info ==="
uname -a
df -h

# Services status
echo "=== Services ==="
pm2 status
sudo systemctl status nginx --no-pager
sudo systemctl status mongod --no-pager

# Network
echo "=== Network ==="
sudo netstat -tlnp | grep -E '(80|5000|27017)'

# Application
echo "=== Application ==="
cd ~/flowgrid && git log -1 --oneline
ls -la /var/www/flowgrid/ | head -5

# Logs
echo "=== Recent Logs ==="
pm2 logs flowgrid-backend --lines 10 --nostream
```

## Still Having Issues?

1. **Check detailed logs:**
   ```bash
   pm2 logs flowgrid-backend --lines 100
   sudo tail -100 /var/log/nginx/error.log
   sudo journalctl -u mongod -n 100
   ```

2. **Review documentation:**
   - [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
   - [aws-quick-setup.md](./aws-quick-setup.md)

3. **Start fresh:**
   - Terminate EC2 instance
   - Launch new instance
   - Run setup script again

## Emergency Recovery

If everything is broken:

```bash
# SSH into EC2

# 1. Stop everything
pm2 stop all
sudo systemctl stop nginx

# 2. Clean and redeploy
cd ~/flowgrid
git fetch origin
git reset --hard origin/main
git pull origin main

# 3. Rebuild
npm ci
cd server && npm ci && cd ..
npm run build
cd server && npm run build && cd ..

# 4. Restart services
pm2 restart flowgrid-backend
sudo systemctl start nginx

# 5. Check status
pm2 status
sudo systemctl status nginx
```

---

**Most issues are solved by checking logs and restarting services!**
