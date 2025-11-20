# Quick Start: CI/CD Automation

## 🎯 Goal
Set up complete CI/CD automation so every commit to GitHub automatically deploys to AWS EC2 with full testing and MongoDB integration.

## ⚡ Super Quick Setup (10 Minutes)

### Prerequisites Checklist
- [ ] AWS EC2 instance running (Ubuntu 20.04/22.04)
- [ ] EC2 security group allows ports 22, 80, 443
- [ ] SSH key (.pem file) downloaded
- [ ] GitHub repository created

### Step 1: Run Setup Helper (2 minutes)

**On Windows:**
```bash
setup-github-secrets.bat
```

**On Mac/Linux:**
```bash
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh
```

This collects:
- ✅ EC2 IP address
- ✅ SSH username
- ✅ SSH key content
- ✅ MongoDB URI

### Step 2: Add GitHub Secrets (2 minutes)

1. Go to: `https://github.com/YOUR_USERNAME/flowgrid/settings/secrets/actions`
2. Click "New repository secret"
3. Add these 4 secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `AWS_EC2_HOST` | Your EC2 IP | `54.123.45.67` |
| `AWS_EC2_USER` | SSH username | `ubuntu` |
| `AWS_SSH_KEY` | .pem file content | `-----BEGIN RSA PRIVATE KEY-----...` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/flowgrid` |

### Step 3: Initial EC2 Setup (5 minutes)

```bash
# Connect to EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP

# Clone and setup
git clone https://github.com/YOUR_USERNAME/flowgrid.git
cd flowgrid
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**Wait 5-10 minutes** for installation to complete.

### Step 4: Verify Deployment (1 minute)

```bash
# On your local machine
chmod +x verify-deployment.sh
./verify-deployment.sh YOUR_EC2_IP
```

Expected output:
```
✅ ALL TESTS PASSED!
Your application is fully functional!
```

### Step 5: Test Automation (1 minute)

```bash
# Make a test change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD automation"
git push origin main
```

**Watch it deploy:**
1. Go to GitHub → Actions tab
2. See the workflow running
3. Wait 3-5 minutes
4. Check your EC2 IP in browser

## 🎉 Done!

Your application is now live with full CI/CD automation!

**Access your app:**
- Frontend: `http://YOUR_EC2_IP`
- Backend API: `http://YOUR_EC2_IP/api`
- Health: `http://YOUR_EC2_IP/health`

**Demo login:**
- Email: `admin@flowgrid.com`
- Password: `admin123`

## 🔄 How It Works

```
You push code → GitHub Actions runs tests → Deploys to EC2 → Restarts services → ✅ Live!
```

**Every commit automatically:**
1. Runs type checking
2. Runs linting
3. Runs unit tests
4. Builds frontend
5. Builds backend
6. Deploys to EC2
7. Updates MongoDB
8. Restarts PM2
9. Restarts Nginx
10. Verifies health

## 📊 Monitoring

**GitHub Actions:**
- Go to Actions tab
- See all deployments
- Click any run for logs

**EC2 Logs:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
pm2 logs flowgrid-backend
```

## 🐛 Troubleshooting

### Deployment Failed?

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click failed workflow
3. Read error message

**Common fixes:**

**SSH Error:**
```bash
# Verify secret is correct
# Re-add AWS_SSH_KEY with complete .pem content
```

**MongoDB Error:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
sudo systemctl restart mongod
sudo systemctl status mongod
```

**Backend Error:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
cd ~/flowgrid/server
pm2 logs flowgrid-backend
pm2 restart flowgrid-backend
```

**Frontend Error:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
cd ~/flowgrid
cat .env.production
# Should show: VITE_API_URL=http://YOUR_EC2_IP/api
```

## 🔧 Common Operations

### Restart Services
```bash
pm2 restart flowgrid-backend
sudo systemctl restart nginx
```

### View Logs
```bash
pm2 logs flowgrid-backend
sudo tail -f /var/log/nginx/error.log
```

### Update Environment
```bash
cd ~/flowgrid/server
nano .env
pm2 restart flowgrid-backend
```

### Rollback
```bash
cd ~/flowgrid
git log --oneline -5
git reset --hard COMMIT_HASH
cd server && npm run build && pm2 restart flowgrid-backend
cd .. && npm run build && sudo cp -r dist/* /var/www/flowgrid/
```

## 📚 Full Documentation

For detailed information:

- **[CI/CD Setup Guide](./CI_CD_SETUP_GUIDE.md)** - Complete guide
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Verification steps
- **[GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)** - Secrets details
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues

## 💡 Tips

- **Test locally first:** Run `npm run build` before pushing
- **Small commits:** Easier to debug if something breaks
- **Monitor logs:** Check PM2 logs after each deployment
- **Keep secrets safe:** Never commit .env or .pem files

## 🆘 Need Help?

1. Check GitHub Actions logs
2. SSH into EC2 and check service logs
3. Run verification script
4. Review troubleshooting guide

## 🎓 Next Steps

After successful setup:

1. **Add HTTPS:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Set up monitoring:**
   - CloudWatch
   - Uptime monitoring
   - Error alerts

3. **Create staging environment:**
   - Staging branch
   - Separate EC2 instance
   - Test before production

4. **Optimize performance:**
   - PM2 cluster mode
   - Nginx caching
   - MongoDB indexes

---

**Congratulations! You now have a fully automated CI/CD pipeline! 🚀**

Every commit to `main` automatically deploys to production with full testing and health checks.
