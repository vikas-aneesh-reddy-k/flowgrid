# 🚀 Deploy FlowGrid NOW - Start Here!

**Everything is ready!** Follow these 3 simple steps to deploy your app.

## 📋 What You Need (5 minutes to gather)

1. **AWS Account** - Create one at https://aws.amazon.com if you don't have it
2. **Docker Hub Account** - Create at https://hub.docker.com (free)
3. **GitHub Account** - You already have this!

## 🎯 3 Steps to Deploy

### Step 1: Launch EC2 (5 minutes)
1. Go to AWS EC2 Console: https://console.aws.amazon.com/ec2
2. Click "Launch Instance"
3. Settings:
   - Name: `flowgrid-server`
   - Image: **Ubuntu Server 22.04 LTS**
   - Type: **t3.small** (2 vCPU, 2GB RAM - recommended) or larger
   - Key pair: Create new (download the .pem file!)
   - Security Group: Allow ports **22, 80, 5000, 27017**
4. Click "Launch"
5. **Save your EC2 Public IP**: `_________________`

### Step 2: Setup EC2 (5 minutes)
Open terminal/PowerShell and run:

```bash
# Connect to EC2 (replace YOUR_KEY.pem and YOUR_EC2_IP)
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP

# Copy and paste this entire block:
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
sudo systemctl enable docker && sudo systemctl start docker
mkdir -p /home/ubuntu/flowgrid && cd /home/ubuntu/flowgrid

# Create .env file
cat > .env << 'EOF'
MONGO_USER=admin
MONGO_PASSWORD=FlowGrid2024SecurePassword!
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!
NODE_ENV=production
CORS_ORIGIN=http://YOUR_EC2_IP
EOF

# IMPORTANT: Edit .env and replace YOUR_EC2_IP with your actual IP
nano .env
# Press Ctrl+X, then Y, then Enter to save

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    ports:
      - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    image: vikaskakarla/flowgrid-backend:latest
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/flowgrid?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
      NODE_ENV: ${NODE_ENV}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: vikaskakarla/flowgrid-frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mongodb_data:
    driver: local

networks:
  app-network:
    driver: bridge
EOF

# You can exit SSH now
exit
```

### Step 3: Setup GitHub & Deploy (5 minutes)

#### 3.1 Get Docker Hub Token
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `github-actions`
4. Copy the token: `_________________`

#### 3.2 Add GitHub Secrets
1. Go to your repo: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret" for each:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | `vikaskakarla` |
| `DOCKER_PASSWORD` | Your Docker Hub token from above |
| `EC2_HOST` | Your EC2 public IP |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Open your .pem file in notepad, copy ALL content |
| `VITE_API_URL` | `http://YOUR_EC2_IP:5000/api` |

#### 3.3 Deploy!
```bash
git add .
git commit -m "Deploy FlowGrid to EC2"
git push origin main
```

**That's it!** 🎉

## ✅ Verify It Works

1. **Watch deployment**: Go to GitHub → Actions tab (takes 5-10 minutes)
2. **Open your app**: `http://YOUR_EC2_IP`
3. **Test backend**: `http://YOUR_EC2_IP:5000/health`
4. **Connect MongoDB Compass**:
   ```
   mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_IP:27017/flowgrid?authSource=admin
   ```

## 🎊 Success!

Your app is now:
- ✅ Live on the internet
- ✅ Auto-deploys on every git push
- ✅ Running with MongoDB
- ✅ Fully functional with login/auth

## 📚 Next Steps

- **Change passwords**: Edit `/home/ubuntu/flowgrid/.env` on EC2
- **Setup HTTPS**: Follow `deploy/README.md` for SSL setup
- **Monitor**: Check logs with `docker compose logs -f`

## 🆘 Problems?

### App not loading?
```bash
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose ps
docker compose logs -f
```

### GitHub Actions failed?
- Check Actions tab for error messages
- Verify all secrets are set correctly
- Make sure .pem key is complete (including BEGIN/END lines)

### Need detailed help?
- Quick guide: `deploy/QUICK_START.md`
- Full guide: `deploy/README.md`
- Checklist: `deploy/CHECKLIST.md`

---

**Ready? Start with Step 1!** 🚀
