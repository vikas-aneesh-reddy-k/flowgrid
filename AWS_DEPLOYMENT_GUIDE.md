# AWS EC2 Deployment Guide

This guide will help you deploy FlowGrid to AWS EC2 with automatic GitHub Actions deployment.

## Prerequisites

- AWS Account (you already have this ✅)
- GitHub repository with your code
- Basic understanding of SSH and terminal commands

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance:**
   - **Name:** flowgrid-production
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** t2.micro (Free tier) or t2.small (recommended for production)
   - **Key Pair:** Create new key pair
     - Name: `flowgrid-key`
     - Type: RSA
     - Format: .pem
     - **IMPORTANT:** Download and save this file securely!

3. **Network Settings:**
   - ✅ Allow SSH traffic from: My IP (or Anywhere for GitHub Actions)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet

4. **Storage:** 20 GB gp3 (minimum)

5. **Click "Launch Instance"**

6. **Wait for instance to be running** and note down:
   - Public IPv4 address (e.g., 54.123.45.67)
   - Instance ID

## Step 2: Configure Security Group

1. Go to **EC2 → Security Groups**
2. Find your instance's security group
3. **Edit Inbound Rules** and ensure you have:
   - SSH (22) - Your IP or 0.0.0.0/0 (for GitHub Actions)
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (5000) - 0.0.0.0/0 (for backend API)

## Step 3: Connect to EC2 and Run Setup

### On Windows:

```powershell
# Navigate to where you saved the .pem file
cd Downloads

# Set permissions (if using Git Bash or WSL)
chmod 400 flowgrid-key.pem

# Connect to EC2
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### On Mac/Linux:

```bash
# Set permissions
chmod 400 ~/Downloads/flowgrid-key.pem

# Connect to EC2
ssh -i ~/Downloads/flowgrid-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Once Connected, Run Setup Script:

```bash
# Download setup script
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup-ec2.sh

# Make it executable
chmod +x setup-ec2.sh

# Run setup
./setup-ec2.sh
```

This will install:
- Node.js 18
- MongoDB
- Nginx
- PM2
- Configure firewall

**⏱️ This takes about 5-10 minutes**

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these three secrets:

### Secret 1: AWS_EC2_HOST
- **Name:** `AWS_EC2_HOST`
- **Value:** Your EC2 public IP (e.g., `54.123.45.67`)

### Secret 2: AWS_EC2_USER
- **Name:** `AWS_EC2_USER`
- **Value:** `ubuntu`

### Secret 3: AWS_SSH_KEY
- **Name:** `AWS_SSH_KEY`
- **Value:** Contents of your .pem file

To get the .pem file contents:

**Windows (PowerShell):**
```powershell
Get-Content flowgrid-key.pem | clip
```

**Mac/Linux:**
```bash
cat flowgrid-key.pem | pbcopy  # Mac
cat flowgrid-key.pem | xclip -selection clipboard  # Linux
```

Or just open the file in a text editor and copy everything including:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

## Step 5: Initial Deployment

### Option A: Automatic (Push to main branch)

```bash
git add .
git commit -m "Setup AWS deployment"
git push origin main
```

The GitHub Action will automatically deploy!

### Option B: Manual Deployment

1. Go to GitHub → **Actions** tab
2. Click **"Deploy to AWS EC2"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

## Step 6: Verify Deployment

1. **Check GitHub Actions:**
   - Go to Actions tab in your repository
   - Watch the deployment progress
   - Should complete in 3-5 minutes

2. **Access Your Application:**
   - Open browser: `http://YOUR_EC2_PUBLIC_IP`
   - You should see FlowGrid running!

3. **Check Backend:**
   - API: `http://YOUR_EC2_PUBLIC_IP/api`

## Step 7: First Time Setup

1. **SSH into your EC2:**
   ```bash
   ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

2. **Seed the database (if needed):**
   ```bash
   cd ~/flowgrid/server
   npm run seed
   ```

3. **Check services:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status mongod
   ```

## Troubleshooting

### Deployment fails with SSH error
- Make sure AWS_SSH_KEY secret includes the entire .pem file content
- Check Security Group allows SSH from 0.0.0.0/0

### Can't access the website
- Check Security Group has HTTP (80) open to 0.0.0.0/0
- Verify Nginx is running: `sudo systemctl status nginx`
- Check EC2 instance is running in AWS Console

### Backend not working
- SSH into EC2 and check: `pm2 logs flowgrid-backend`
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check environment variables: `cat ~/flowgrid/server/.env`

### Database connection issues
- Restart MongoDB: `sudo systemctl restart mongod`
- Check MongoDB logs: `sudo journalctl -u mongod -n 50`

## Monitoring

### Check Application Logs
```bash
# Backend logs
pm2 logs flowgrid-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

## Updating Your Application

Just push to main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build the application
3. Deploy to EC2
4. Restart services

## Cost Estimation

### Free Tier (First 12 months)
- t2.micro instance: FREE (750 hours/month)
- 20 GB storage: FREE (30 GB included)
- Data transfer: FREE (15 GB out/month)

### After Free Tier
- t2.micro: ~$8-10/month
- t2.small: ~$17-20/month
- Storage: ~$2/month for 20 GB
- Data transfer: First 1 GB free, then $0.09/GB

## Security Best Practices

1. **Change default MongoDB port** (optional)
2. **Setup SSL/HTTPS** with Let's Encrypt (recommended)
3. **Regular backups** of MongoDB data
4. **Update packages regularly:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Next Steps

1. ✅ Setup custom domain (optional)
2. ✅ Configure SSL/HTTPS with Let's Encrypt
3. ✅ Setup MongoDB backups
4. ✅ Configure monitoring and alerts
5. ✅ Setup staging environment

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. SSH into EC2 and check service logs
3. Review this guide's troubleshooting section

---

**🎉 Congratulations! Your application is now deployed on AWS EC2 with automatic CI/CD!**
