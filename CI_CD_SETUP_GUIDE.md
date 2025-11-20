# CI/CD Setup Guide - Complete Automation

This guide will help you set up complete CI/CD automation for your FlowGrid ERP application. After setup, every commit to the `main` branch will automatically test and deploy to AWS EC2.

## 🎯 What This Setup Does

When you push code to GitHub:
1. ✅ Runs automated tests (type checking, linting, unit tests)
2. ✅ Builds frontend and backend
3. ✅ Deploys to AWS EC2
4. ✅ Updates MongoDB database
5. ✅ Restarts all services
6. ✅ Verifies deployment health

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ AWS EC2 instance running (Ubuntu 20.04/22.04)
- ✅ GitHub repository with your code
- ✅ SSH key (.pem file) for EC2 access
- ✅ EC2 security group configured (ports 22, 80, 443)

## 🚀 Quick Setup (5 Steps)

### Step 1: Prepare GitHub Secrets

Run the setup helper script:

**On Windows:**
```bash
setup-github-secrets.bat
```

**On Mac/Linux:**
```bash
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh
```

This will guide you through collecting:
- AWS_EC2_HOST (your EC2 IP)
- AWS_EC2_USER (usually `ubuntu`)
- AWS_SSH_KEY (your .pem file content)
- MONGODB_URI (MongoDB connection string)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the 4 secrets from Step 1

**Verify all secrets are added:**
```
✅ AWS_EC2_HOST
✅ AWS_EC2_USER
✅ AWS_SSH_KEY
✅ MONGODB_URI
```

### Step 3: Initial EC2 Setup

SSH into your EC2 instance:
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

Run the complete setup script:
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/flowgrid.git
cd flowgrid

# Make script executable
chmod +x deploy-complete.sh

# Run initial setup (installs everything)
./deploy-complete.sh
```

This installs:
- Node.js 20
- MongoDB 7.0
- Nginx web server
- PM2 process manager
- Your application

**Wait for completion** (5-10 minutes)

### Step 4: Verify Initial Setup

Check that all services are running:
```bash
# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# Check backend
pm2 status

# Test health endpoint
curl http://localhost/health
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

### Step 5: Test Automated Deployment

Make a test commit:
```bash
# On your local machine
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

Monitor the deployment:
1. Go to GitHub → **Actions** tab
2. Click on the latest workflow run
3. Watch the deployment progress

**Deployment takes 3-5 minutes**

## 🎉 Success! Your CI/CD is Ready

Access your application:
- **Frontend:** http://YOUR_EC2_IP
- **Backend API:** http://YOUR_EC2_IP/api
- **Health Check:** http://YOUR_EC2_IP/health

**Demo Login:**
- Email: `admin@flowgrid.com`
- Password: `admin123`

## 🔄 How It Works

### Automatic Deployment Flow

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Actions │
│  Triggered      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Run Tests      │
│  - Type check   │
│  - Linting      │
│  - Unit tests   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Code     │
│  - Frontend     │
│  - Backend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to EC2  │
│  - Pull code    │
│  - Install deps │
│  - Build        │
│  - Restart      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify Health  │
│  - MongoDB      │
│  - Nginx        │
│  - Backend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Complete!   │
└─────────────────┘
```

### What Gets Updated

Every deployment updates:
- ✅ Frontend React application
- ✅ Backend Node.js API
- ✅ MongoDB database (via migrations/seeds)
- ✅ Nginx configuration (if changed)
- ✅ Environment variables (if changed)

### What Stays Persistent

These are NOT overwritten:
- ✅ MongoDB data (your database records)
- ✅ Environment secrets (.env files)
- ✅ PM2 process configuration
- ✅ Nginx SSL certificates (if configured)

## 📊 Monitoring Deployments

### View Deployment Status

**On GitHub:**
1. Go to **Actions** tab
2. See all deployment runs
3. Click any run to see detailed logs

**On EC2:**
```bash
# SSH into EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# View backend logs
pm2 logs flowgrid-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check service status
pm2 status
sudo systemctl status mongod
sudo systemctl status nginx
```

### Deployment Notifications

GitHub Actions will show:
- ✅ Green checkmark = Successful deployment
- ❌ Red X = Failed deployment
- 🟡 Yellow dot = In progress

## 🔧 Common Operations

### Manual Deployment

If you need to deploy without pushing:
1. Go to GitHub → **Actions** tab
2. Click **Deploy to AWS EC2** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

### Rollback to Previous Version

```bash
# SSH into EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# Navigate to app
cd ~/flowgrid

# View recent commits
git log --oneline -10

# Rollback to specific commit
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

### Update Environment Variables

```bash
# SSH into EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# Edit backend .env
cd ~/flowgrid/server
nano .env

# Restart backend
pm2 restart flowgrid-backend

# Edit frontend .env
cd ~/flowgrid
nano .env.production

# Rebuild frontend
npm run build
sudo cp -r dist/* /var/www/flowgrid/
```

### Restart Services

```bash
# Restart backend only
pm2 restart flowgrid-backend

# Restart Nginx only
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod

# Restart all
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mongod
```

## 🐛 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click failed workflow
3. Expand failed step
4. Read error message

**Common issues:**

**SSH Connection Failed:**
```
Error: Permission denied (publickey)
```
**Solution:** Verify AWS_SSH_KEY secret is correct

**MongoDB Connection Failed:**
```
Error: MongoServerError: connect ECONNREFUSED
```
**Solution:**
```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

**Backend Won't Start:**
```
Error: Cannot find module
```
**Solution:**
```bash
cd ~/flowgrid/server
npm install
npm run build
pm2 restart flowgrid-backend
```

**Frontend Shows API Error:**
```
Error: Failed to fetch
```
**Solution:** Check .env.production has correct API URL
```bash
cd ~/flowgrid
cat .env.production
# Should show: VITE_API_URL=http://YOUR_EC2_IP/api
```

### Check Service Health

```bash
# Test health endpoint
curl http://YOUR_EC2_IP/health

# Test API health
curl http://YOUR_EC2_IP/api/health

# Test login
curl -X POST http://YOUR_EC2_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowgrid.com","password":"admin123"}'
```

### View Detailed Logs

```bash
# Backend application logs
pm2 logs flowgrid-backend --lines 100

# Nginx access logs
sudo tail -100 /var/log/nginx/access.log

# Nginx error logs
sudo tail -100 /var/log/nginx/error.log

# MongoDB logs
sudo tail -100 /var/log/mongodb/mongod.log

# System logs
sudo journalctl -u mongod -n 100
```

## 🔒 Security Best Practices

### Secure Your EC2

```bash
# Enable firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Enable MongoDB Authentication

```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_PASSWORD",
  roles: ["root"]
})
exit

# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod

# Update MONGODB_URI in GitHub secrets
# mongodb://admin:STRONG_PASSWORD@localhost:27017/flowgrid?authSource=admin
```

### Set Up HTTPS

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

## 📈 Performance Optimization

### Enable PM2 Cluster Mode

```bash
# Edit PM2 config
cd ~/flowgrid/server
pm2 delete flowgrid-backend
pm2 start dist/index.js --name flowgrid-backend -i max
pm2 save
```

### Enable Nginx Caching

```bash
sudo nano /etc/nginx/sites-available/flowgrid
```

Add inside server block:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Optimize MongoDB

```bash
mongosh flowgrid

# Create indexes
db.products.createIndex({ name: "text", description: "text" })
db.customers.createIndex({ email: 1 })
db.orders.createIndex({ customerId: 1, createdAt: -1 })
db.employees.createIndex({ email: 1 })
```

## 📚 Additional Resources

- **Deployment Checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **GitHub Secrets Setup:** See `GITHUB_SECRETS_SETUP.md`
- **Troubleshooting Guide:** See `TROUBLESHOOTING.md`
- **AWS Deployment Guide:** See `AWS_DEPLOYMENT_GUIDE.md`

## 🎓 Next Steps

After successful CI/CD setup:

1. **Set up staging environment:**
   - Create `staging` branch
   - Duplicate workflow for staging
   - Test changes before production

2. **Add monitoring:**
   - Set up CloudWatch
   - Configure uptime monitoring
   - Set up error alerting

3. **Implement backups:**
   - Automated MongoDB backups
   - S3 backup storage
   - Backup restoration testing

4. **Add more tests:**
   - Integration tests
   - E2E tests with Playwright
   - API tests

5. **Optimize costs:**
   - Use EC2 reserved instances
   - Implement auto-scaling
   - Monitor resource usage

## 💡 Tips

- **Commit often:** Small, frequent commits are easier to debug
- **Test locally first:** Run `npm run build` before pushing
- **Monitor logs:** Check PM2 logs after each deployment
- **Keep secrets safe:** Never commit .env files or .pem keys
- **Document changes:** Write clear commit messages

## 🆘 Need Help?

If you encounter issues:

1. Check GitHub Actions logs
2. SSH into EC2 and check service logs
3. Review the troubleshooting section
4. Verify all secrets are correctly set
5. Test each service individually

---

**Congratulations! Your CI/CD pipeline is now fully automated! 🎉**

Every commit to `main` will automatically deploy to production with full testing and health checks.
