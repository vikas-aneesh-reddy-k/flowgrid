# Deployment Checklist

Complete this checklist before deploying to AWS EC2.

## Prerequisites

### 1. AWS EC2 Instance Setup
- [ ] EC2 instance is running (Ubuntu 20.04 or 22.04 recommended)
- [ ] Security group allows inbound traffic:
  - [ ] Port 22 (SSH) from your IP
  - [ ] Port 80 (HTTP) from anywhere (0.0.0.0/0)
  - [ ] Port 443 (HTTPS) from anywhere (optional, for SSL)
- [ ] You have the SSH key file (.pem) downloaded
- [ ] SSH key has correct permissions: `chmod 400 flowgrid-key.pem`

### 2. GitHub Repository Setup
- [ ] Code is pushed to GitHub
- [ ] Repository is accessible (public or you have access)
- [ ] Main branch is named `main` (not `master`)

### 3. GitHub Secrets Configuration
Go to GitHub → Settings → Secrets and variables → Actions

- [ ] `AWS_EC2_HOST` - Your EC2 public IP address
- [ ] `AWS_EC2_USER` - SSH username (usually `ubuntu`)
- [ ] `AWS_SSH_KEY` - Complete content of your .pem file
- [ ] `MONGODB_URI` - MongoDB connection string

**Verify secrets are added:**
```
✅ AWS_EC2_HOST: 54.xxx.xxx.xxx
✅ AWS_EC2_USER: ubuntu
✅ AWS_SSH_KEY: -----BEGIN RSA PRIVATE KEY-----...
✅ MONGODB_URI: mongodb://localhost:27017/flowgrid
```

## Initial EC2 Setup (First Time Only)

### Step 1: Connect to EC2
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

### Step 2: Run Initial Setup
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Git
sudo apt-get install -y git curl

# Clone the repository
git clone https://github.com/YOUR_USERNAME/flowgrid.git
cd flowgrid

# Make setup script executable
chmod +x deploy-complete.sh

# Run the complete setup
./deploy-complete.sh
```

This will install:
- Node.js 20
- MongoDB 7.0
- Nginx
- PM2
- Your application

### Step 3: Verify Initial Setup
```bash
# Check services
sudo systemctl status mongod
sudo systemctl status nginx
pm2 status

# Test the application
curl http://localhost/health
curl http://localhost/api/health
```

Expected output:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Deployment Workflow

### Automatic Deployment (Recommended)

Every time you push to the `main` branch, GitHub Actions will:

1. ✅ Run tests (type checking, linting, unit tests)
2. ✅ Build frontend and backend
3. ✅ Deploy to EC2
4. ✅ Restart services
5. ✅ Verify deployment

**To deploy:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Monitor deployment:**
1. Go to GitHub → Actions tab
2. Click on the latest workflow run
3. Watch the logs in real-time

### Manual Deployment

If you need to deploy manually:

```bash
# SSH into EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# Navigate to app directory
cd ~/flowgrid

# Pull latest changes
git pull origin main

# Update backend
cd server
npm install
npm run build
pm2 restart flowgrid-backend

# Update frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/flowgrid/
sudo systemctl restart nginx
```

## Post-Deployment Verification

### 1. Check Services Status
```bash
# On EC2
sudo systemctl status mongod    # Should be "active (running)"
sudo systemctl status nginx     # Should be "active (running)"
pm2 status                      # Should show "online"
```

### 2. Test Application Endpoints

**Health Check:**
```bash
curl http://YOUR_EC2_IP/health
```

**API Health:**
```bash
curl http://YOUR_EC2_IP/api/health
```

**Frontend:**
Open browser: `http://YOUR_EC2_IP`

### 3. Test Login
1. Go to `http://YOUR_EC2_IP`
2. Login with demo credentials:
   - Email: `admin@flowgrid.com`
   - Password: `admin123`
3. Verify dashboard loads
4. Test navigation to different pages

### 4. Test API Endpoints
```bash
# Login
curl -X POST http://YOUR_EC2_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowgrid.com","password":"admin123"}'

# Get products (replace TOKEN with the token from login)
curl http://YOUR_EC2_IP/api/products \
  -H "Authorization: Bearer TOKEN"
```

### 5. Check Logs
```bash
# Backend logs
pm2 logs flowgrid-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Common Issues and Solutions

### Issue: GitHub Actions fails with "Permission denied"
**Solution:** Verify SSH key is correctly added to GitHub secrets with proper formatting

### Issue: MongoDB connection failed
**Solution:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Issue: Backend not starting
**Solution:**
```bash
# Check PM2 logs
pm2 logs flowgrid-backend

# Restart backend
pm2 restart flowgrid-backend

# Check environment variables
cd ~/flowgrid/server
cat .env
```

### Issue: Frontend shows "Cannot connect to API"
**Solution:**
```bash
# Check .env.production
cd ~/flowgrid
cat .env.production

# Should show: VITE_API_URL=http://YOUR_EC2_IP/api

# Rebuild frontend
npm run build
sudo cp -r dist/* /var/www/flowgrid/
```

### Issue: Nginx 502 Bad Gateway
**Solution:**
```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart services
pm2 restart flowgrid-backend
sudo systemctl restart nginx
```

## Monitoring and Maintenance

### Daily Checks
- [ ] Application is accessible
- [ ] All services are running
- [ ] No errors in logs

### Weekly Checks
- [ ] Review PM2 logs for errors
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -h`
- [ ] Review MongoDB database size

### Monthly Maintenance
- [ ] Update system packages: `sudo apt-get update && sudo apt-get upgrade`
- [ ] Update Node.js dependencies
- [ ] Review and rotate logs
- [ ] Backup MongoDB database

## Backup MongoDB

### Create Backup
```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
mongodump --db flowgrid --out ~/backups/flowgrid-$(date +%Y%m%d)

# Compress backup
tar -czf ~/backups/flowgrid-$(date +%Y%m%d).tar.gz ~/backups/flowgrid-$(date +%Y%m%d)
```

### Restore Backup
```bash
# Extract backup
tar -xzf ~/backups/flowgrid-20240101.tar.gz

# Restore database
mongorestore --db flowgrid ~/backups/flowgrid-20240101/flowgrid
```

## Rollback Procedure

If deployment fails:

```bash
# SSH into EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# Navigate to app
cd ~/flowgrid

# Rollback to previous commit
git log --oneline -5  # Find the commit hash
git reset --hard COMMIT_HASH

# Rebuild and restart
cd server
npm install
npm run build
pm2 restart flowgrid-backend

cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/flowgrid/
sudo systemctl restart nginx
```

## Security Recommendations

- [ ] Change default MongoDB port
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/HTTPS with Let's Encrypt
- [ ] Configure firewall (UFW)
- [ ] Set up automated backups
- [ ] Enable CloudWatch monitoring
- [ ] Set up log rotation
- [ ] Use environment-specific secrets

## Next Steps

After successful deployment:

1. **Set up HTTPS:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Set up monitoring:**
   - Configure CloudWatch
   - Set up uptime monitoring
   - Configure error alerting

3. **Optimize performance:**
   - Enable Nginx caching
   - Configure PM2 cluster mode
   - Optimize MongoDB indexes

4. **Set up CI/CD for staging:**
   - Create staging branch
   - Set up staging environment
   - Test before production

## Support

If you need help:
1. Check logs on EC2
2. Review GitHub Actions logs
3. Consult TROUBLESHOOTING.md
4. Check MongoDB connection
5. Verify all environment variables

---

**Last Updated:** $(date)
**Version:** 1.0.0
