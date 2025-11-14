# 🚀 AWS EC2 Deployment - START HERE

## Quick Overview

You're about to deploy FlowGrid to AWS EC2 with automatic GitHub Actions deployment!

## 📋 What You'll Need (5 minutes to gather)

- ✅ AWS Account (you have this!)
- ✅ GitHub repository access
- ✅ 30 minutes of time
- ✅ Basic terminal knowledge

## 🎯 Three Simple Steps

### Step 1: Launch EC2 (5 min)
📖 See: [aws-quick-setup.md](./aws-quick-setup.md) - Section 1

### Step 2: Setup EC2 (10 min)
📖 See: [aws-quick-setup.md](./aws-quick-setup.md) - Section 3

### Step 3: Configure GitHub (5 min)
📖 See: [aws-quick-setup.md](./aws-quick-setup.md) - Section 5

## 📚 Documentation

Choose your style:

1. **Quick Checklist** → [aws-quick-setup.md](./aws-quick-setup.md)
   - Step-by-step checklist
   - Copy-paste commands
   - Perfect for experienced users

2. **Detailed Guide** → [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
   - Complete explanations
   - Troubleshooting
   - Best practices

3. **Summary** → [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
   - Architecture overview
   - How it works
   - Cost estimates

## ⚡ Super Quick Start

```bash
# 1. Launch EC2 on AWS Console (t2.micro, Ubuntu 22.04)
# 2. SSH into it:
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. Run setup:
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/flowgrid/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh

# 4. Add GitHub secrets (shown after setup completes)
# 5. Push to GitHub - done!
```

## 🎉 After Setup

Every push to `main` branch automatically:
- ✅ Tests your code
- ✅ Builds the app
- ✅ Deploys to EC2
- ✅ Restarts services

## 💰 Cost

**Free for 12 months** with AWS Free Tier!
After: ~$10-20/month

## 🆘 Need Help?

- **Quick fixes:** [aws-quick-setup.md](./aws-quick-setup.md) - Troubleshooting section
- **Detailed help:** [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - Troubleshooting section

---

**Ready? Start with [aws-quick-setup.md](./aws-quick-setup.md)!**
