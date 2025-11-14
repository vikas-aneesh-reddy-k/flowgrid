# AWS EC2 Deployment Guide (Free Tier)

This guide will help you deploy FlowGrid ERP to AWS EC2 Free Tier without Docker or Jenkins.

## Prerequisites

1. AWS Account (Free Tier eligible)
2. GitHub repository with your code
3. Basic knowledge of SSH and Linux commands

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance:**
   - **Name:** flowgrid-server
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** t2.micro (Free tier eligible)
   - **Key Pair:** Create new key pair
     - Name: flowgrid-key
     - Type: RSA
     - Format: .pem
     - **Download and save the .pem file securely**

3. **Network Settings:**
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow Custom TCP (port 5000) from anywhere (for backend API)

4. **Storage:** 8 GB (Free tier eligible)

5. **Launch Instance**

## Step 2: Connect to EC2 Instance

```bash
# Change permissions on your key file
chmod 400 flowgrid-key.pem

# Connect to your instance
ssh -i flowgrid-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

## Step 3: Setup EC2 Instance

Run these commands on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable
```

## Step 4: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/flowgrid
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/flowgrid;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/flowgrid /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **AWS_EC2_HOST:** Your EC2 public IP address
2. **AWS_EC2_USER:** `ubuntu`
3. **AWS_SSH_KEY:** Contents of your flowgrid-key.pem file
4. **MONGODB_URI:** `mongodb://localhost:27017/flowgrid`
5. **JWT_SECRET:** Generate a random secret (e.g., `openssl rand -base64 32`)

## Step 6: Manual First Deployment

On your EC2 instance:

```bash
# Clone your repository
cd ~
git clone https://github.com/YOUR_USERNAME/flowgrid.git
cd flowgrid

# Install dependencies
npm ci
cd server && npm ci && cd ..

# Build frontend
npm run build

# Build backend
cd server && npm run build && cd ..

# Setup backend environment
cd server
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowgrid
JWT_SECRET=your-secret-key-here
NODE_ENV=production
CORS_ORIGIN=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF

# Seed database
npm run seed

# Start backend with PM2
pm2 start dist/index.js --name flowgrid-backend
pm2 save
pm2 startup

# Copy frontend to Nginx directory
sudo mkdir -p /var/www/flowgrid
sudo cp -r ../dist/* /var/www/flowgrid/
sudo chown -R www-data:www-data /var/www/flowgrid
```

## Step 7: Test Your Deployment

1. Open your browser and go to: `http://YOUR_EC2_PUBLIC_IP`
2. You should see the FlowGrid login page
3. Use demo credentials: `admin@flowgrid.com` / `admin123`

## Step 8: Automatic Deployments

Now, every time you push to the `main` branch, GitHub Actions will automatically:
1. Build your application
2. Deploy to your EC2 instance
3. Restart the services

## Monitoring

```bash
# Check backend logs
pm2 logs flowgrid-backend

# Check backend status
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check MongoDB status
sudo systemctl status mongod
```

## Troubleshooting

### Backend not starting
```bash
cd ~/flowgrid/server
pm2 logs flowgrid-backend
```

### Frontend not loading
```bash
sudo nginx -t
sudo systemctl status nginx
```

### MongoDB connection issues
```bash
sudo systemctl status mongod
mongo --eval "db.adminCommand('ping')"
```

## Cost Optimization

- EC2 t2.micro: Free for 750 hours/month (first 12 months)
- Data transfer: 15 GB/month free
- EBS storage: 30 GB free

## Security Recommendations

1. **Setup HTTPS with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. **Restrict SSH access:**
```bash
sudo ufw delete allow 22
sudo ufw allow from YOUR_IP to any port 22
```

3. **Setup MongoDB authentication:**
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})
```

4. **Regular updates:**
```bash
sudo apt update && sudo apt upgrade -y
pm2 update
```

## Backup Strategy

```bash
# Backup MongoDB
mongodump --out=/home/ubuntu/backups/$(date +%Y%m%d)

# Backup to S3 (optional)
aws s3 sync /home/ubuntu/backups s3://your-backup-bucket/
```
