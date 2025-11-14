# 🚀 AWS EC2 Deployment - Complete Package

## 📖 Documentation Index

Your FlowGrid project now has complete AWS EC2 deployment with automatic CI/CD!

### 🎯 Start Here
1. **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Overview of what's been set up
2. **[START_HERE.md](./START_HERE.md)** - Quick start guide

### 📋 Setup Guides
- **[aws-quick-setup.md](./aws-quick-setup.md)** - Step-by-step checklist (RECOMMENDED)
- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - Detailed comprehensive guide

### 📚 Reference
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Architecture and how it works
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### 🛠️ Scripts
- `setup-ec2.sh` - Run once on EC2 to install everything
- `deploy-to-aws.sh` - Deployment script (auto-run by GitHub Actions)
- `get-github-secrets.sh` - Helper to display GitHub secrets

### ⚙️ Configuration
- `.github/workflows/aws-deploy.yml` - GitHub Actions workflow

## 🎯 Quick Start (5 Steps)

### 1. Launch EC2 Instance
- Go to AWS Console → EC2 → Launch Instance
- Ubuntu 22.04, t2.micro, download .pem key
- **Time:** 5 minutes

### 2. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 3. Run Setup Script
```bash
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/flowgrid/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```
**Time:** 10 minutes

### 4. Add GitHub Secrets
- Go to GitHub → Settings → Secrets → Actions
- Add: AWS_EC2_HOST, AWS_EC2_USER, AWS_SSH_KEY
- **Time:** 5 minutes

### 5. Deploy
```bash
git add .
git commit -m "Setup AWS deployment"
git push origin main
```
**Time:** 3 minutes

## ✅ What You Get

- ✅ Automatic deployment on every push to main
- ✅ GitHub Actions CI/CD pipeline
- ✅ Production-ready server setup
- ✅ Node.js + MongoDB + Nginx + PM2
- ✅ Firewall and security configured
- ✅ Free tier eligible (12 months)

## 📊 Deployment Flow

```
Developer                GitHub                    AWS EC2
    |                       |                         |
    |--[git push]---------->|                         |
    |                       |                         |
    |                  [Run Tests]                    |
    |                  [Build App]                    |
    |                       |                         |
    |                       |--[SSH Deploy]---------->|
    |                       |                         |
    |                       |                    [Pull Code]
    |                       |                    [Build]
    |                       |                    [Deploy]
    |                       |                    [Restart]
    |                       |                         |
    |                       |<--[Success]-------------|
    |                       |                         |
    |<--[Notification]------|                         |
    |                       |                         |
```

## 💰 Cost Breakdown

### Free Tier (12 months)
- EC2 t2.micro: FREE (750 hrs/month)
- Storage 20GB: FREE (30GB included)
- Data transfer: FREE (15GB/month)
- **Total: $0/month** ✨

### After Free Tier
- EC2 t2.micro: $8-10/month
- EC2 t2.small: $17-20/month (recommended)
- Storage: $2/month
- **Total: $10-22/month**

## 🔒 Security Features

- ✅ UFW Firewall configured
- ✅ SSH key authentication only
- ✅ JWT authentication for API
- ✅ Environment variables for secrets
- ✅ MongoDB local access only
- ✅ HTTPS ready (add SSL certificate)
- ✅ PM2 process management
- ✅ Nginx reverse proxy

## 📈 Monitoring

### Check Status
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

### View Logs
```bash
# Backend logs
pm2 logs flowgrid-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo journalctl -u mongod -f
```

## 🔄 Updating Your App

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions automatically:
1. Runs tests
2. Builds application
3. Deploys to EC2
4. Restarts services

**No manual steps needed!**

## 🆘 Common Issues

### Can't SSH
- Check .pem permissions: `chmod 400 your-key.pem`
- Verify Security Group allows SSH

### Can't access website
- Check Security Group allows HTTP (80)
- Verify Nginx: `sudo systemctl status nginx`

### Backend not working
- Check logs: `pm2 logs flowgrid-backend`
- Restart: `pm2 restart flowgrid-backend`

**See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions**

## 🎓 Learning Resources

### AWS
- [EC2 Getting Started](https://aws.amazon.com/ec2/getting-started/)
- [Free Tier Details](https://aws.amazon.com/free/)

### GitHub Actions
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

### Server Management
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🚀 Next Steps After Deployment

1. **Setup Custom Domain**
   - Point domain to EC2 IP
   - Update Nginx configuration

2. **Enable HTTPS**
   - Install Let's Encrypt SSL
   - Configure Nginx for HTTPS

3. **Setup Monitoring**
   - CloudWatch for metrics
   - PM2 monitoring dashboard

4. **Configure Backups**
   - MongoDB automated backups
   - EC2 snapshots

5. **Create Staging Environment**
   - Separate EC2 for testing
   - Add staging workflow

## 📞 Support

If you need help:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
3. Check GitHub Actions logs
4. SSH into EC2 and check service logs

## 🎉 Success Checklist

- [ ] EC2 instance launched
- [ ] Setup script completed
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] Website accessible
- [ ] Backend API working
- [ ] Can login to application
- [ ] Automatic deployments working

## 📝 Important Files

```
flowgrid/
├── .github/
│   └── workflows/
│       └── aws-deploy.yml          # GitHub Actions workflow
├── setup-ec2.sh                    # EC2 setup script
├── deploy-to-aws.sh                # Deployment script
├── get-github-secrets.sh           # Helper script
├── START_HERE.md                   # Quick start
├── aws-quick-setup.md              # Step-by-step guide
├── AWS_DEPLOYMENT_GUIDE.md         # Detailed guide
├── DEPLOYMENT_SUMMARY.md           # Overview
├── TROUBLESHOOTING.md              # Problem solving
└── DEPLOYMENT_README.md            # This file
```

---

**Ready to deploy? Start with [START_HERE.md](./START_HERE.md)!**

**Need help? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)!**

**Questions? Read [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)!**
