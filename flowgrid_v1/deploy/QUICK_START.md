# 🚀 Quick Start - Deploy in 10 Minutes

Follow these exact steps to get FlowGrid running on EC2.

## Step 1: Launch EC2 Instance (2 minutes)

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Configure:
   - **Name**: flowgrid-server
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: t3.small (2 vCPU, 2GB RAM - recommended) or larger
   - **Key pair**: Create new or use existing (download .pem file)
   - **Security Group**: Create new with these rules:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere (0.0.0.0/0)
     - Custom TCP (5000) - Anywhere (0.0.0.0/0)
     - Custom TCP (27017) - Your IP only
4. Click "Launch Instance"
5. Wait for instance to start and note the **Public IPv4 address**

## Step 2: Setup EC2 (3 minutes)

```bash
# Connect to EC2 (replace with your values)
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Download and run setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/deploy/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh

# Edit environment file
nano /home/ubuntu/flowgrid/.env
```

Update this line in `.env`:
```
CORS_ORIGIN=http://YOUR_EC2_IP
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 3: Setup GitHub Secrets (2 minutes)

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Click "New repository secret" for each:

| Name | Value |
|------|-------|
| `DOCKER_USERNAME` | `vikaskakarla` |
| `DOCKER_PASSWORD` | Your Docker Hub token from https://hub.docker.com/settings/security |
| `EC2_HOST` | Your EC2 public IP |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Full content of your .pem file (including BEGIN/END lines) |
| `VITE_API_URL` | `http://YOUR_EC2_IP:5000/api` |

## Step 4: Deploy! (3 minutes)

```bash
# On your local machine
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Go to GitHub → Actions tab and watch the deployment!

## Step 5: Verify (1 minute)

Open in browser:
- **Frontend**: `http://YOUR_EC2_IP`
- **Backend**: `http://YOUR_EC2_IP:5000/health`

Connect MongoDB Compass:
```
mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_IP:27017/flowgrid?authSource=admin
```

## ✅ Done!

Your app is now live and will auto-deploy on every push to main!

## Common Issues

### "Connection refused" on port 80
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs frontend
```

### Backend not responding
```bash
docker compose logs backend
```

### MongoDB connection issues
```bash
docker compose logs mongodb
```

### Restart everything
```bash
docker compose down
docker compose up -d
```

## Next Steps

1. **Change passwords** in `/home/ubuntu/flowgrid/.env`
2. **Setup HTTPS** with Let's Encrypt
3. **Restrict MongoDB** port in Security Group
4. **Setup monitoring** with CloudWatch

## Support

Check the full guide: `deploy/README.md`
