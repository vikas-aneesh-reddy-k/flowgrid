# AWS EC2 Quick Start Guide

## 🚀 Deploy FlowGrid to AWS in 15 Minutes

### Step 1: Launch EC2 Instance (5 minutes)

1. Go to [AWS Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Configure:
   - **Name:** flowgrid-server
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance Type:** t2.micro (Free tier)
   - **Key Pair:** Create new → Download `.pem` file
   - **Security Group:** Allow ports 22, 80, 443, 5000
4. Click **Launch Instance**
5. Wait for instance to start and note the **Public IP**

### Step 2: Connect to EC2 (2 minutes)

```bash
# On your local machine
chmod 400 flowgrid-key.pem
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

### Step 3: Setup EC2 (5 minutes)

```bash
# On EC2 instance
wget https://raw.githubusercontent.com/vikas-aneesh-reddy-k/flowgrid/main/setup-ec2.sh
bash setup-ec2.sh
```

This installs:
- Node.js 18
- MongoDB
- PM2 (Process Manager)
- Nginx (Web Server)

### Step 4: Deploy Application (3 minutes)

```bash
# On EC2 instance
wget https://raw.githubusercontent.com/vikas-aneesh-reddy-k/flowgrid/main/deploy-to-aws.sh
bash deploy-to-aws.sh
```

### Step 5: Configure GitHub Secrets (Optional - for auto-deploy)

1. Go to your GitHub repo → Settings → Secrets → Actions
2. Add these secrets:
   - `AWS_EC2_HOST`: Your EC2 public IP
   - `AWS_EC2_USER`: `ubuntu`
   - `AWS_SSH_KEY`: Contents of your `.pem` file

Now every push to `main` branch will auto-deploy!

### Step 6: Access Your Application

Open browser: `http://YOUR_EC2_IP`

**Demo Login:**
- Email: `admin@flowgrid.com`
- Password: `admin123`

---

## 📋 Useful Commands

### On EC2 Instance

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs flowgrid-backend

# Restart backend
pm2 restart flowgrid-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check MongoDB status
sudo systemctl status mongod

# Redeploy application
cd ~/flowgrid && bash deploy-to-aws.sh
```

---

## 🔧 Troubleshooting

### Backend not starting
```bash
pm2 logs flowgrid-backend
cd ~/flowgrid/server
cat .env
```

### Frontend shows 404
```bash
sudo systemctl restart nginx
ls -la /var/www/flowgrid/
```

### MongoDB connection error
```bash
sudo systemctl restart mongod
mongosh --eval "db.adminCommand('ping')"
```

### Can't connect to EC2
```bash
# Check security group allows your IP on port 22
# Verify key file permissions: chmod 400 flowgrid-key.pem
```

---

## 💰 Cost Estimate

**Free Tier (First 12 months):**
- EC2 t2.micro: 750 hours/month FREE
- EBS Storage: 30 GB FREE
- Data Transfer: 15 GB/month FREE

**After Free Tier:**
- ~$8-10/month for t2.micro instance

---

## 🔒 Security Checklist

- [ ] Change default MongoDB password
- [ ] Setup HTTPS with Let's Encrypt
- [ ] Restrict SSH to your IP only
- [ ] Enable AWS CloudWatch monitoring
- [ ] Setup automated backups
- [ ] Use AWS Secrets Manager for sensitive data

---

## 📚 Additional Resources

- [Full Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🆘 Need Help?

1. Check the logs: `pm2 logs flowgrid-backend`
2. Review [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
3. Check GitHub Actions logs for deployment issues
4. Verify all secrets are configured correctly

---

**That's it! Your FlowGrid ERP is now running on AWS! 🎉**
