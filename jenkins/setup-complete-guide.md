# Complete Jenkins CI/CD Setup Guide for FlowGrid

## Prerequisites Checklist
- ✅ Jenkins installed on your PC
- ✅ Docker installed on your PC
- ✅ EC2 instance created (13.53.86.36)
- ✅ GitHub repository: https://github.com/vikas-aneesh-reddy-k/flowgrid.git
- ✅ PEM file: flowgrid-key.pem

## Step 1: Prepare EC2 Instance

### 1.1 Connect to EC2 and run setup
```bash
# On your local machine
chmod 400 flowgrid-key.pem
scp -i flowgrid-key.pem scripts/ec2-setup.sh ubuntu@13.53.86.36:/home/ubuntu/
ssh -i flowgrid-key.pem ubuntu@13.53.86.36
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### 1.2 Verify EC2 setup
```bash
docker --version
docker-compose --version
sudo ufw status
```

## Step 2: Configure Jenkins

### 2.1 Install Required Jenkins Plugins
1. Go to Jenkins Dashboard → Manage Jenkins → Manage Plugins
2. Install these plugins:
   - **Docker Pipeline**
   - **GitHub Integration Plugin**
   - **SSH Agent Plugin**
   - **Email Extension Plugin**
   - **Blue Ocean** (optional, for better UI)

### 2.2 Configure Jenkins Credentials
Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials → System → Global credentials

#### Add Docker Hub Credentials
- **Kind**: Username with password
- **ID**: `dockerhub-credentials`
- **Username**: `vikaskakarla`
- **Password**: [Your Docker Hub password/token]
- **Description**: Docker Hub Access

#### Add EC2 SSH Key
- **Kind**: SSH Username with private key
- **ID**: `ec2-ssh-key`
- **Username**: `ubuntu`
- **Private Key**: [Copy content of flowgrid-key.pem]
- **Description**: EC2 SSH Access

#### Add MongoDB Credentials
- **Kind**: Secret text
- **ID**: `mongo-user`
- **Secret**: `admin`

- **Kind**: Secret text
- **ID**: `mongo-password`
- **Secret**: `FlowGrid2024SecurePassword!`

#### Add JWT Secret
- **Kind**: Secret text
- **ID**: `jwt-secret`
- **Secret**: `FlowGrid2024SuperSecureJWTSecretKey123456789!`

## Step 3: Create Jenkins Pipeline Job

### 3.1 Create New Pipeline Job
1. Jenkins Dashboard → New Item
2. Enter name: `FlowGrid-CI-CD`
3. Select "Pipeline"
4. Click OK

### 3.2 Configure Pipeline Job
#### General Settings
- ✅ Check "GitHub project"
- **Project url**: `https://github.com/vikas-aneesh-reddy-k/flowgrid.git`

#### Build Triggers
- ✅ Check "GitHub hook trigger for GITScm polling"

#### Pipeline Configuration
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/vikas-aneesh-reddy-k/flowgrid.git`
- **Credentials**: (Leave as none for public repo)
- **Branch Specifier**: `*/main`
- **Script Path**: `Jenkinsfile`

### 3.3 Save the Job

## Step 4: Configure GitHub Webhook

### 4.1 Get Jenkins URL
- Find your Jenkins IP address
- Webhook URL format: `http://YOUR_JENKINS_IP:8080/github-webhook/`

### 4.2 Add Webhook in GitHub
1. Go to https://github.com/vikas-aneesh-reddy-k/flowgrid.git
2. Settings → Webhooks → Add webhook
3. **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Which events**: Just the push event
6. ✅ Active
7. Add webhook

## Step 5: Update Environment Variables

### 5.1 Update .env.production
Replace the placeholder values in `.env.production`:
```env
MONGO_PASSWORD=FlowGrid2024SecurePassword!
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!
```

## Step 6: Test the Pipeline

### 6.1 Manual Test
1. Go to Jenkins → FlowGrid-CI-CD → Build Now
2. Monitor the build progress
3. Check console output for any errors

### 6.2 Automatic Test
1. Make a small change to your code
2. Commit and push to GitHub
3. Verify webhook triggers Jenkins build

## Step 7: Verify Deployment

### 7.1 Check Application
- **Frontend**: http://13.53.86.36
- **Backend API**: http://13.53.86.36:5000/health
- **MongoDB**: Should be accessible internally

### 7.2 Monitor Services
```bash
# SSH to EC2
ssh -i flowgrid-key.pem ubuntu@13.53.86.36

# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Monitor system
./monitor.sh
```

## Step 8: Production Optimizations

### 8.1 SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

### 8.2 Domain Setup (Optional)
1. Point your domain to EC2 IP (13.53.86.36)
2. Update nginx configuration for domain
3. Update CORS settings in backend

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Jenkins Build Fails
```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Check Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### 2. Docker Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Check Dockerfile syntax
docker build -t test .
```

#### 3. EC2 Connection Issues
```bash
# Check security group
# Ensure ports 22, 80, 5000 are open

# Test SSH connection
ssh -i flowgrid-key.pem ubuntu@13.53.86.36
```

#### 4. Application Not Accessible
```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check ports
netstat -tlnp | grep -E ':(80|5000)'
```

#### 5. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh
```

## Monitoring and Maintenance

### Daily Checks
- Monitor Jenkins build status
- Check application health endpoints
- Review system resources on EC2

### Weekly Tasks
- Update system packages on EC2
- Review and rotate logs
- Check security updates

### Monthly Tasks
- Update Jenkins and plugins
- Review and update credentials
- Backup MongoDB data
- Review security configurations

## Success Indicators

✅ **Pipeline Working**: Commits trigger automatic builds
✅ **Frontend Accessible**: http://13.53.86.36 loads correctly
✅ **Backend API Working**: http://13.53.86.36:5000/health returns 200
✅ **MongoDB Connected**: Backend can connect to database
✅ **Docker Images Updated**: Latest images deployed automatically
✅ **Health Checks Pass**: All services running correctly

## Next Steps

1. **Set up monitoring**: Consider Prometheus + Grafana
2. **Add staging environment**: Create separate staging pipeline
3. **Implement blue-green deployment**: Zero-downtime deployments
4. **Add automated testing**: Expand test coverage
5. **Set up alerts**: Email/Slack notifications for failures

Your CI/CD pipeline is now complete and ready for production use!