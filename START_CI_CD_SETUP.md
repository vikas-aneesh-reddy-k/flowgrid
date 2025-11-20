# 🚀 START HERE: CI/CD Setup

## ⚡ Quick Start (Choose Your Path)

### Path 1: Super Quick (10 Minutes) ⚡
**For those who want to get started immediately**

1. Run setup helper:
   ```bash
   # Windows: setup-github-secrets.bat
   # Mac/Linux: ./setup-github-secrets.sh
   ```

2. Add 4 secrets to GitHub (copy from helper output)

3. SSH to EC2 and run:
   ```bash
   git clone https://github.com/YOUR_USERNAME/flowgrid.git
   cd flowgrid
   chmod +x deploy-complete.sh
   ./deploy-complete.sh
   ```

4. Test:
   ```bash
   git push origin main
   ```

**Done!** → See [QUICK_START_CI_CD.md](./QUICK_START_CI_CD.md)

---

### Path 2: Detailed Setup (30 Minutes) 📚
**For those who want to understand everything**

Follow the complete guide with explanations:
→ See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

---

### Path 3: Checklist Approach (20 Minutes) ✅
**For those who like step-by-step verification**

Follow the deployment checklist:
→ See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] AWS EC2 instance running (Ubuntu 20.04/22.04)
- [ ] EC2 security group allows ports 22, 80, 443
- [ ] SSH key (.pem file) downloaded
- [ ] GitHub repository created
- [ ] Git installed locally

**Don't have EC2 yet?** → See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

---

## 🎯 What You'll Get

After setup, every commit to `main` will automatically:

1. ✅ Run tests (type checking, linting, unit tests)
2. ✅ Build frontend and backend
3. ✅ Deploy to AWS EC2
4. ✅ Update MongoDB database
5. ✅ Restart all services
6. ✅ Verify deployment health

**No manual deployment needed!**

---

## 🔑 Required GitHub Secrets

You need to add 4 secrets to GitHub:

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_EC2_HOST` | EC2 public IP | `54.123.45.67` |
| `AWS_EC2_USER` | SSH username | `ubuntu` |
| `AWS_SSH_KEY` | .pem file content | `-----BEGIN RSA...` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/flowgrid` |

**Helper scripts will collect these for you!**

---

## 🛠️ Setup Tools Provided

### Scripts
- `setup-github-secrets.sh` / `.bat` - Collect secrets
- `deploy-complete.sh` - Complete EC2 setup
- `verify-deployment.sh` / `.bat` - Test deployment

### Documentation
- `QUICK_START_CI_CD.md` - 10-minute guide
- `CI_CD_SETUP_GUIDE.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `GITHUB_SECRETS_SETUP.md` - Secrets configuration
- `TROUBLESHOOTING.md` - Common issues

---

## 🎬 Quick Demo

**See it in action:**

1. Make a change:
   ```bash
   echo "# Update" >> README.md
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

3. Watch deployment:
   - Go to GitHub → Actions tab
   - See workflow running
   - Wait 3-5 minutes

4. Check result:
   - Open `http://YOUR_EC2_IP`
   - See your changes live!

---

## 📊 What Gets Automated

### On Every Commit:
```
Code Push → Tests → Build → Deploy → Restart → Verify → ✅ Live!
```

### Services Managed:
- ✅ Frontend (React + Vite)
- ✅ Backend (Node.js + Express)
- ✅ MongoDB Database
- ✅ Nginx Web Server
- ✅ PM2 Process Manager

### What Stays Safe:
- ✅ MongoDB data (not overwritten)
- ✅ Environment secrets
- ✅ SSL certificates
- ✅ Custom configurations

---

## 🚦 Setup Status Checklist

Track your progress:

### Phase 1: Preparation
- [ ] EC2 instance running
- [ ] Security group configured
- [ ] SSH key downloaded
- [ ] GitHub repository created

### Phase 2: GitHub Secrets
- [ ] Ran setup helper script
- [ ] Added AWS_EC2_HOST
- [ ] Added AWS_EC2_USER
- [ ] Added AWS_SSH_KEY
- [ ] Added MONGODB_URI

### Phase 3: EC2 Setup
- [ ] SSH connection successful
- [ ] Repository cloned
- [ ] Setup script executed
- [ ] All services running

### Phase 4: Verification
- [ ] Verification script passed
- [ ] Application accessible
- [ ] Login works
- [ ] API endpoints respond

### Phase 5: Automation Test
- [ ] Made test commit
- [ ] GitHub Actions ran
- [ ] Deployment successful
- [ ] Changes visible on EC2

---

## 🎯 Choose Your Next Step

### I'm Ready to Start! 🚀
→ Go to [QUICK_START_CI_CD.md](./QUICK_START_CI_CD.md)

### I Need More Details 📚
→ Go to [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

### I Want a Checklist ✅
→ Go to [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### I Need to Set Up AWS First ☁️
→ Go to [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

### I Have Questions ❓
→ Go to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 💡 Pro Tips

1. **Start with Quick Start** - Get it working first, understand later
2. **Use the helper scripts** - They collect everything you need
3. **Test locally first** - Run `npm run build` before pushing
4. **Monitor the first deployment** - Watch GitHub Actions logs
5. **Keep this tab open** - You'll reference it during setup

---

## 🆘 Need Help?

### During Setup:
1. Check the relevant guide
2. Review troubleshooting section
3. Verify prerequisites are met
4. Check GitHub Actions logs

### After Setup:
1. Run verification script
2. Check service logs on EC2
3. Test individual components
4. Review error messages

---

## 🎉 Success Looks Like:

When setup is complete:

✅ Application live at `http://YOUR_EC2_IP`
✅ GitHub Actions shows green checkmarks
✅ All services running on EC2
✅ MongoDB connected and working
✅ Automated deployment on every push
✅ Health checks passing

---

## ⏱️ Time Estimates

- **Quick Setup:** 10 minutes
- **Detailed Setup:** 30 minutes
- **Checklist Approach:** 20 minutes
- **First Deployment:** 3-5 minutes
- **Subsequent Deployments:** 3-5 minutes

---

## 🎓 What You'll Learn

By completing this setup:

- ✅ GitHub Actions workflows
- ✅ CI/CD best practices
- ✅ AWS EC2 deployment
- ✅ MongoDB management
- ✅ Nginx configuration
- ✅ PM2 process management
- ✅ Automated testing
- ✅ Health monitoring

---

## 🏁 Ready? Let's Go!

**Choose your path above and start your CI/CD journey!**

**Recommended:** Start with [QUICK_START_CI_CD.md](./QUICK_START_CI_CD.md) to get up and running in 10 minutes.

---

**Questions?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Need details?** See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

**Want to verify?** Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Good luck! You've got this! 🚀**
