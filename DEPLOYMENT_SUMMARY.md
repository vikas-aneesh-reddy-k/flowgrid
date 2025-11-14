# AWS EC2 Deployment - Setup Summary

## 🎯 What Has Been Configured

Your FlowGrid project is now ready for AWS EC2 deployment with automatic CI/CD via GitHub Actions!

## 📁 Files Created/Updated

### 1. GitHub Actions Workflow
**File:** `.github/workflows/aws-deploy.yml`
- Triggers on every push to `main` branch
- Runs tests and builds
- Automatically deploys to EC2 via SSH
- Can also be triggered manually

### 2. EC2 Setup Script
**File:** `setup-ec2.sh`
- Installs Node.js 18, MongoDB, Nginx, PM2
- Configures firewall and services
- Sets up application directory
- Run this ONCE on your EC2 instance

### 3. Deployment Script
**File:** `deploy-to-aws.sh`
- Pulls latest code from GitHub
- Builds frontend and backend
- Deploys to Nginx and PM2
- Automatically run by GitHub Actions

### 4. Documentation
- **AWS_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
- **aws-quick-setup.md** - Quick reference checklist
- **README.md** - Updated with deployment info

## 🚀 How It Works

```
┌─────────────────┐
│  Push to GitHub │
│   (main branch) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│  - Run tests    │
│  - Build app    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSH to EC2     │
│  - Pull code    │
│  - Build        │
│  - Deploy       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Live on AWS   │
│ http://YOUR_IP  │
└─────────────────┘
```

## ✅ What You Need to Do Now

### Step 1: Launch EC2 Instance (5 minutes)
1. Go to AWS Console → EC2
2. Launch Ubuntu 22.04 instance
3. Download the .pem key file
4. Note the public IP address

### Step 2: Run Setup Script (10 minutes)
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Download and run setup
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/flowgrid/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### Step 3: Configure GitHub Secrets (2 minutes)
Add these 3 secrets in GitHub:
- `AWS_EC2_HOST` - Your EC2 public IP
- `AWS_EC2_USER` - ubuntu
- `AWS_SSH_KEY` - Contents of your .pem file

### Step 4: Deploy! (3 minutes)
```bash
git add .
git commit -m "Setup AWS deployment"
git push origin main
```

Watch the magic happen in GitHub Actions! ✨

## 🔄 Continuous Deployment

After initial setup, every time you push to main:
1. ✅ Code is tested
2. ✅ Application is built
3. ✅ Deployed to EC2 automatically
4. ✅ Services are restarted

No manual deployment needed!

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│           AWS EC2 Instance              │
│                                         │
│  ┌──────────┐      ┌──────────────┐   │
│  │  Nginx   │─────▶│   Frontend   │   │
│  │  (Port   │      │   (React)    │   │
│  │   80)    │      └──────────────┘   │
│  └────┬─────┘                          │
│       │                                │
│       │ /api                           │
│       ▼                                │
│  ┌──────────┐      ┌──────────────┐   │
│  │   PM2    │─────▶│   Backend    │   │
│  │          │      │  (Express)   │   │
│  └──────────┘      └──────┬───────┘   │
│                            │           │
│                            ▼           │
│                     ┌──────────────┐   │
│                     │   MongoDB    │   │
│                     └──────────────┘   │
└─────────────────────────────────────────┘
```

## 💰 Cost Estimate

### Free Tier (First 12 months)
- **t2.micro instance:** FREE (750 hours/month)
- **Storage (20 GB):** FREE (30 GB included)
- **Data transfer:** FREE (15 GB out/month)
- **Total:** $0/month ✨

### After Free Tier
- **t2.micro:** ~$8-10/month
- **t2.small:** ~$17-20/month (recommended)
- **Storage:** ~$2/month
- **Total:** ~$10-22/month

## 🔒 Security Features

✅ Firewall configured (UFW)
✅ HTTPS ready (add SSL certificate)
✅ JWT authentication
✅ Environment variables for secrets
✅ MongoDB local access only
✅ PM2 process management

## 📝 Useful Commands

**Check deployment status:**
```bash
# On EC2
pm2 status
pm2 logs flowgrid-backend
sudo systemctl status nginx
sudo systemctl status mongod
```

**Manual deployment:**
```bash
# On EC2
cd ~/flowgrid
git pull origin main
npm ci && cd server && npm ci && cd ..
npm run build && cd server && npm run build && cd ..
pm2 restart flowgrid-backend
```

**View logs:**
```bash
pm2 logs flowgrid-backend --lines 100
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🆘 Troubleshooting

### Deployment fails
- Check GitHub Actions logs
- Verify GitHub secrets are correct
- Ensure EC2 security group allows SSH from 0.0.0.0/0

### Can't access website
- Check security group allows HTTP (80)
- Verify Nginx: `sudo systemctl status nginx`
- Check firewall: `sudo ufw status`

### Backend errors
- Check logs: `pm2 logs flowgrid-backend`
- Verify MongoDB: `sudo systemctl status mongod`
- Check environment: `cat ~/flowgrid/server/.env`

## 📚 Documentation

- **[Complete Guide](./AWS_DEPLOYMENT_GUIDE.md)** - Detailed instructions
- **[Quick Setup](./aws-quick-setup.md)** - Checklist format
- **[README](./README.md)** - Project overview

## 🎉 Next Steps

After successful deployment:

1. **Setup Custom Domain** (optional)
   - Point domain to EC2 IP
   - Update Nginx configuration

2. **Enable HTTPS** (recommended)
   - Install Let's Encrypt SSL
   - Configure Nginx for HTTPS

3. **Setup Monitoring**
   - CloudWatch for EC2 metrics
   - PM2 monitoring dashboard

4. **Configure Backups**
   - MongoDB automated backups
   - Snapshot EC2 instance

5. **Setup Staging Environment**
   - Create separate EC2 for testing
   - Add staging workflow

## 🤝 Support

If you need help:
1. Check the troubleshooting sections
2. Review GitHub Actions logs
3. SSH into EC2 and check service logs
4. Refer to AWS_DEPLOYMENT_GUIDE.md

---

**Ready to deploy? Follow the steps in [aws-quick-setup.md](./aws-quick-setup.md)!**
