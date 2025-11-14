# AWS EC2 Quick Setup Checklist

## ✅ Step-by-Step Checklist

### 1. Launch EC2 Instance
- [ ] Go to AWS Console → EC2 → Launch Instance
- [ ] Name: `flowgrid-production`
- [ ] AMI: Ubuntu Server 22.04 LTS
- [ ] Instance Type: t2.micro (free tier) or t2.small
- [ ] Create new key pair: `flowgrid-key.pem` (DOWNLOAD AND SAVE!)
- [ ] Enable: SSH, HTTP, HTTPS traffic
- [ ] Storage: 20 GB
- [ ] Launch instance
- [ ] Note Public IP: ________________

### 2. Configure Security Group
- [ ] Go to Security Groups
- [ ] Edit Inbound Rules:
  - [ ] SSH (22) - 0.0.0.0/0
  - [ ] HTTP (80) - 0.0.0.0/0
  - [ ] HTTPS (443) - 0.0.0.0/0
  - [ ] Custom TCP (5000) - 0.0.0.0/0

### 3. Connect to EC2

**Windows (PowerShell or Git Bash):**
```bash
cd Downloads
chmod 400 flowgrid-key.pem
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

**Mac/Linux:**
```bash
chmod 400 ~/Downloads/flowgrid-key.pem
ssh -i ~/Downloads/flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

### 4. Run Setup Script on EC2

```bash
# Download and run setup
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/flowgrid/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

Wait 5-10 minutes for installation to complete.

### 5. Add GitHub Secrets

Go to: GitHub Repository → Settings → Secrets and variables → Actions

**Add these 3 secrets:**

1. **AWS_EC2_HOST**
   - Value: Your EC2 Public IP (e.g., 54.123.45.67)

2. **AWS_EC2_USER**
   - Value: `ubuntu`

3. **AWS_SSH_KEY**
   - Value: Contents of flowgrid-key.pem file

**Get .pem contents:**
```powershell
# Windows
Get-Content flowgrid-key.pem | clip

# Mac
cat flowgrid-key.pem | pbcopy

# Linux
cat flowgrid-key.pem | xclip -selection clipboard
```

### 6. Deploy!

**Option A: Push to GitHub**
```bash
git add .
git commit -m "Setup AWS deployment"
git push origin main
```

**Option B: Manual Trigger**
- Go to GitHub → Actions → "Deploy to AWS EC2" → Run workflow

### 7. Verify

- [ ] Check GitHub Actions (should be green ✅)
- [ ] Open browser: `http://YOUR_EC2_IP`
- [ ] Login with: admin@flowgrid.com / admin123

## 🎉 Done!

Your app is now live on AWS with automatic deployments!

## Quick Commands

**SSH into EC2:**
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

**Check services:**
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

**View logs:**
```bash
pm2 logs flowgrid-backend
```

**Restart services:**
```bash
pm2 restart flowgrid-backend
sudo systemctl restart nginx
```

## Troubleshooting

**Can't SSH?**
- Check Security Group allows SSH from your IP
- Verify .pem file permissions: `chmod 400 flowgrid-key.pem`

**Can't access website?**
- Check Security Group allows HTTP (80)
- Verify Nginx: `sudo systemctl status nginx`

**Backend not working?**
- Check logs: `pm2 logs flowgrid-backend`
- Verify MongoDB: `sudo systemctl status mongod`

## Cost

**Free Tier (12 months):**
- t2.micro: FREE
- 20 GB storage: FREE
- Total: $0/month

**After Free Tier:**
- t2.micro: ~$8-10/month
- t2.small: ~$17-20/month

---

Need help? Check [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed instructions.
