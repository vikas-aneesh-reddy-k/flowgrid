# FlowGrid Deployment Guide

Complete guide to deploy FlowGrid to AWS EC2 with automatic CI/CD.

## Prerequisites

1. **AWS EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger (2GB+ RAM recommended)
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 5000 (API), 27017 (MongoDB)
   - Save your `.pem` key file securely

2. **Docker Hub Account**
   - Username: `vikaskakarla`
   - Create access token at: https://hub.docker.com/settings/security

3. **GitHub Repository**
   - Push your code to GitHub

## Step 1: Setup EC2 Instance

### 1.1 Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 1.2 Run Setup Script
```bash
# Download and run the setup script
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/deploy/setup-ec2.sh
chmod +x setup.sh
./setup.sh
```

Or manually copy the script:
```bash
# Copy the content of deploy/setup-ec2.sh to EC2
nano setup.sh
# Paste the content, save (Ctrl+X, Y, Enter)
chmod +x setup.sh
./setup.sh
```

### 1.3 Configure Environment
```bash
cd /home/ubuntu/flowgrid
nano .env
```

Update `CORS_ORIGIN` with your EC2 public IP:
```env
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP
```

### 1.4 Test Manual Deployment
```bash
# Pull images
docker compose pull

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Visit `http://YOUR_EC2_PUBLIC_IP` to verify it works!

## Step 2: Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### 2.1 Docker Hub Credentials
- **DOCKER_USERNAME**: `vikaskakarla`
- **DOCKER_PASSWORD**: Your Docker Hub access token

### 2.2 EC2 Connection Details
- **EC2_HOST**: Your EC2 public IP (e.g., `13.62.224.81`)
- **EC2_USERNAME**: `ubuntu`
- **EC2_SSH_KEY**: Content of your `.pem` file
  ```bash
  # On Windows, open your .pem file in notepad
  # Copy the ENTIRE content including:
  # -----BEGIN RSA PRIVATE KEY-----
  # ... all the lines ...
  # -----END RSA PRIVATE KEY-----
  ```

### 2.3 API URL
- **VITE_API_URL**: `http://YOUR_EC2_PUBLIC_IP:5000/api`

## Step 3: Deploy!

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Setup CI/CD deployment"
git push origin main
```

### 3.2 Watch Deployment
- Go to GitHub → Actions tab
- Watch the deployment progress
- Should complete in 5-10 minutes

### 3.3 Verify Deployment
Visit your EC2 IP:
- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend API: `http://YOUR_EC2_PUBLIC_IP:5000/health`
- MongoDB: Connect via MongoDB Compass to `YOUR_EC2_PUBLIC_IP:27017`

## MongoDB Compass Connection

**Connection String:**
```
mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_PUBLIC_IP:27017/flowgrid?authSource=admin
```

Or use individual fields:
- Host: `YOUR_EC2_PUBLIC_IP`
- Port: `27017`
- Authentication: Username/Password
- Username: `admin`
- Password: `FlowGrid2024SecurePassword!`
- Authentication Database: `admin`
- Database: `flowgrid`

## Troubleshooting

### Check Service Status
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd /home/ubuntu/flowgrid
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Restart Services
```bash
docker compose restart
```

### Full Reset
```bash
docker compose down
docker compose up -d
```

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Check Frontend
```bash
curl http://localhost/
```

## Security Recommendations

1. **Change Default Passwords**
   - Update `MONGO_PASSWORD` in `.env`
   - Update `JWT_SECRET` in `.env`

2. **Use HTTPS**
   - Setup SSL certificate with Let's Encrypt
   - Use nginx reverse proxy

3. **Restrict MongoDB Access**
   - Remove port 27017 from Security Group
   - Only allow internal Docker network access

4. **Use Environment-Specific Secrets**
   - Don't commit `.env` files
   - Use GitHub Secrets for sensitive data

## Automatic Deployments

Every push to `main` branch will:
1. Build Docker images
2. Push to Docker Hub
3. SSH into EC2
4. Pull latest images
5. Restart services

No manual intervention needed! 🎉

## Manual Deployment Commands

If you need to deploy manually:

```bash
# On your local machine
docker build -t vikaskakarla/flowgrid-backend:latest -f server/Dockerfile ./server
docker build -t vikaskakarla/flowgrid-frontend:latest -f Dockerfile.frontend .
docker push vikaskakarla/flowgrid-backend:latest
docker push vikaskakarla/flowgrid-frontend:latest

# On EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd /home/ubuntu/flowgrid
docker compose pull
docker compose up -d
```

## Support

If you encounter issues:
1. Check logs: `docker compose logs -f`
2. Verify environment variables in `.env`
3. Ensure Security Group allows required ports
4. Check GitHub Actions logs for build errors
