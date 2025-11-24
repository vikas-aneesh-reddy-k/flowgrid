# 🚀 Complete Deployment Setup Guide

## Problem: Code not updating on AWS

Your Jenkins pipeline is building successfully but not deploying because:
1. Docker Desktop is not running on your local machine
2. Jenkins credentials may not be configured
3. Deployment stages are being skipped

## ✅ Solution: Use GitHub Actions for Deployment

GitHub Actions has Docker built-in and will automatically deploy to your EC2.

---

## 📋 Step-by-Step Setup

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/vikas-aneesh-reddy-k/flowgrid.git
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these **3 secrets**:

#### Secret 1: DOCKERHUB_USERNAME
- **Name**: `DOCKERHUB_USERNAME`
- **Value**: `vikaskakarla`

#### Secret 2: DOCKERHUB_TOKEN
- **Name**: `DOCKERHUB_TOKEN`
- **Value**: Your Docker Hub access token
  - Get it from: https://hub.docker.com/settings/security
  - Click "New Access Token"
  - Copy the token

#### Secret 3: EC2_SSH_KEY
- **Name**: `EC2_SSH_KEY`
- **Value**: Content of your `flowgrid-key.pem` file
  - Open `flowgrid-key.pem` in notepad
  - Copy **EVERYTHING** including:
    ```
    -----BEGIN RSA PRIVATE KEY-----
    ... all the content ...
    -----END RSA PRIVATE KEY-----
    ```
  - Paste it as the secret value

### Step 2: Verify EC2 Setup

Make sure your EC2 instance is set up:

```bash
# Connect to EC2
ssh -i flowgrid-key.pem -o StrictHostKeyChecking=no ubuntu@13.62.224.81

# Run these commands on EC2:
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create directories
mkdir -p /home/ubuntu/docker

# Logout and login again for docker group to take effect
exit
```

### Step 3: Test the Deployment

1. Make a small change to any file (like README.md)
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the workflow run
5. After 5-10 minutes, check: http://13.62.224.81

### Step 4: Verify Deployment

Once the GitHub Action completes:

- **Frontend**: http://13.62.224.81
- **Backend API**: http://13.62.224.81:5000/health
- **Check logs on EC2**:
  ```bash
  ssh -i flowgrid-key.pem ubuntu@13.62.224.81
  docker-compose logs -f
  ```

---

## 🔍 Troubleshooting

### If GitHub Actions fails:

1. **Check the Actions tab** on GitHub for error messages
2. **Verify secrets are added** correctly (no extra spaces)
3. **Check EC2 security group**:
   - Port 22 (SSH) - open to your IP or 0.0.0.0/0
   - Port 80 (HTTP) - open to 0.0.0.0/0
   - Port 5000 (API) - open to 0.0.0.0/0

### If website shows old code:

```bash
# SSH to EC2
ssh -i flowgrid-key.pem ubuntu@13.62.224.81

# Force pull latest images
docker-compose pull
docker-compose down
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

### If containers won't start:

```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check disk space
df -h

# Clean up old images
docker system prune -a -f
```

---

## 🎯 Quick Commands Reference

### Deploy manually from your PC:
```bash
# Build and push images
docker build -f Dockerfile.frontend --build-arg VITE_API_URL=http://13.62.224.81:5000/api -t vikaskakarla/flowgrid-frontend:latest .
docker build -f server/Dockerfile -t vikaskakarla/flowgrid-backend:latest ./server

docker push vikaskakarla/flowgrid-frontend:latest
docker push vikaskakarla/flowgrid-backend:latest

# Deploy to EC2
scp -i flowgrid-key.pem docker-compose.yml ubuntu@13.62.224.81:/home/ubuntu/
scp -i flowgrid-key.pem .env.production ubuntu@13.62.224.81:/home/ubuntu/.env
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose pull && docker-compose up -d"
```

### Check deployment status:
```bash
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose ps"
```

### View logs:
```bash
ssh -i flowgrid-key.pem ubuntu@13.62.224.81 "docker-compose logs -f"
```

---

## ✅ Success Checklist

- [ ] GitHub secrets added (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, EC2_SSH_KEY)
- [ ] EC2 instance has Docker and Docker Compose installed
- [ ] EC2 security group allows ports 22, 80, 5000
- [ ] GitHub Actions workflow runs successfully
- [ ] Website accessible at http://13.62.224.81
- [ ] API responds at http://13.62.224.81:5000/health

---

## 🚀 After Setup

Every time you push to the `main` branch:
1. GitHub Actions automatically builds Docker images
2. Pushes them to Docker Hub
3. Deploys to your EC2 instance
4. Your website updates automatically in 5-10 minutes

**Your website will now stay up-to-date automatically!** 🎉
