# ✅ FlowGrid Deployment Checklist

Print this checklist and check off items as you complete them.

---

## Phase 1: Pre-Deployment Setup

### AWS Account Setup
- [ ] AWS account created and verified
- [ ] Payment method added
- [ ] IAM user created (optional but recommended)
- [ ] AWS CLI installed (optional)

### GitHub Setup
- [ ] GitHub account created
- [ ] Repository created or forked
- [ ] Code pushed to repository
- [ ] Repository is accessible

### Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Email verified
- [ ] Two repositories created:
  - [ ] flowgrid-frontend
  - [ ] flowgrid-backend

### Local Preparation
- [ ] SSH client installed (Windows: PowerShell, Mac/Linux: Terminal)
- [ ] Git installed and configured
- [ ] Code editor installed (VS Code recommended)
- [ ] All deployment files present in repository:
  - [ ] Jenkinsfile
  - [ ] docker-compose.yml
  - [ ] Dockerfile
  - [ ] Dockerfile.frontend
  - [ ] server/Dockerfile
  - [ ] nginx-docker.conf
  - [ ] setup-ec2-complete.sh

---

## Phase 2: AWS EC2 Setup

### Launch EC2 Instance
- [ ] Logged into AWS Console
- [ ] Navigated to EC2 Dashboard
- [ ] Clicked "Launch Instance"
- [ ] Selected Ubuntu Server 22.04 LTS
- [ ] Selected t2.medium instance type
- [ ] Created new key pair:
  - [ ] Name: flowgrid-key
  - [ ] Type: RSA
  - [ ] Format: .pem
  - [ ] Downloaded and saved securely
- [ ] Configured storage: 20 GB gp3
- [ ] Instance launched successfully
- [ ] Instance state: Running
- [ ] Public IP noted: ___________________

### Configure Security Group
- [ ] Security group created/selected
- [ ] Inbound rules configured:
  - [ ] SSH (22) - My IP
  - [ ] HTTP (80) - Anywhere (0.0.0.0/0)
  - [ ] HTTPS (443) - Anywhere (0.0.0.0/0)
  - [ ] Custom TCP (8080) - My IP (Jenkins)
  - [ ] Custom TCP (5000) - Anywhere (0.0.0.0/0) (API)
- [ ] Security group applied to instance

### Connect to EC2
- [ ] Key file permissions set correctly
  - Windows: `icacls "flowgrid-key.pem" /inheritance:r`
  - Linux/Mac: `chmod 400 flowgrid-key.pem`
- [ ] Successfully connected via SSH
- [ ] Command used: `ssh -i "flowgrid-key.pem" ubuntu@YOUR_EC2_IP`

---

## Phase 3: EC2 Software Installation

### Run Setup Script
- [ ] Downloaded setup script
- [ ] Made script executable: `chmod +x setup-ec2-complete.sh`
- [ ] Ran setup script: `./setup-ec2-complete.sh`
- [ ] Script completed without errors

### Verify Installations
- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker-compose --version`
- [ ] Java installed: `java -version`
- [ ] Jenkins installed: `sudo systemctl status jenkins`
- [ ] Jenkins is running
- [ ] Jenkins initial password obtained
  - Password: ___________________

### Post-Installation
- [ ] Logged out and logged back in (for docker group)
- [ ] Can run docker without sudo: `docker ps`
- [ ] Created deployment directory: `/home/ubuntu/flowgrid`

---

## Phase 4: Jenkins Configuration

### Initial Setup
- [ ] Accessed Jenkins: `http://YOUR_EC2_IP:8080`
- [ ] Entered initial admin password
- [ ] Selected "Install suggested plugins"
- [ ] Plugins installed successfully
- [ ] Created admin user:
  - Username: ___________________
  - Password: ___________________
  - Email: ___________________
- [ ] Jenkins URL configured

### Install Additional Plugins
- [ ] Navigated to Manage Jenkins → Plugins
- [ ] Installed required plugins:
  - [ ] Docker Pipeline
  - [ ] GitHub Integration
  - [ ] SSH Agent
  - [ ] Credentials Binding
- [ ] Restarted Jenkins

### Add Credentials
- [ ] Navigated to Manage Jenkins → Credentials
- [ ] Added Docker Hub credentials:
  - [ ] Kind: Username with password
  - [ ] ID: dockerhub-credentials
  - [ ] Username: ___________________
  - [ ] Password: ___________________
- [ ] Added EC2 SSH key:
  - [ ] Kind: SSH Username with private key
  - [ ] ID: ec2-ssh-key
  - [ ] Username: ubuntu
  - [ ] Private key pasted
- [ ] Added MongoDB URI:
  - [ ] Kind: Secret text
  - [ ] ID: mongodb-uri
  - [ ] Secret: mongodb://admin:admin123@mongodb:27017/flowgrid?authSource=admin
- [ ] Added JWT Secret:
  - [ ] Kind: Secret text
  - [ ] ID: jwt-secret
  - [ ] Secret generated: `openssl rand -base64 32`
  - [ ] Secret: ___________________

### Configure Environment Variables
- [ ] Navigated to Manage Jenkins → System
- [ ] Enabled "Environment variables"
- [ ] Added variables:
  - [ ] DOCKER_HUB_USERNAME: ___________________
  - [ ] EC2_HOST: ___________________
  - [ ] EC2_USER: ubuntu
- [ ] Saved configuration

---

## Phase 5: Jenkins Pipeline Setup

### Create Pipeline Job
- [ ] Clicked "New Item"
- [ ] Name: FlowGrid-Deploy
- [ ] Type: Pipeline
- [ ] Job created

### Configure Pipeline
- [ ] Description added
- [ ] Build trigger enabled: "GitHub hook trigger for GITScm polling"
- [ ] Pipeline definition: "Pipeline script from SCM"
- [ ] SCM: Git
- [ ] Repository URL: ___________________
- [ ] Credentials added (if private repo)
- [ ] Branch: */main
- [ ] Script Path: Jenkinsfile
- [ ] Configuration saved

### Test Pipeline
- [ ] Clicked "Build Now"
- [ ] Build started
- [ ] Build completed successfully
- [ ] Console output reviewed
- [ ] No errors found

---

## Phase 6: GitHub Configuration

### Repository Setup
- [ ] Repository contains all required files
- [ ] .gitignore configured properly
- [ ] Sensitive files not committed (.env, .pem)
- [ ] Code pushed to main branch

### Configure Webhook
- [ ] Navigated to Repository → Settings → Webhooks
- [ ] Clicked "Add webhook"
- [ ] Payload URL: `http://YOUR_EC2_IP:8080/github-webhook/`
- [ ] Content type: application/json
- [ ] Events: "Just the push event"
- [ ] Active: ✓
- [ ] Webhook created
- [ ] Webhook tested (Recent Deliveries shows 200 OK)

---

## Phase 7: Environment Configuration

### Create .env File on EC2
- [ ] SSH to EC2
- [ ] Navigated to `/home/ubuntu/flowgrid`
- [ ] Created .env file
- [ ] Added all required variables:
  - [ ] MONGO_USER
  - [ ] MONGO_PASSWORD
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] CORS_ORIGIN=*
  - [ ] VITE_API_URL
- [ ] File permissions set: `chmod 600 .env`

---

## Phase 8: First Deployment

### Trigger Deployment
- [ ] Local code is up to date
- [ ] Made a test commit
- [ ] Pushed to GitHub: `git push origin main`
- [ ] GitHub webhook triggered
- [ ] Jenkins build started automatically
- [ ] Monitored build progress

### Build Stages
- [ ] Stage 1: Checkout ✓
- [ ] Stage 2: Build Docker Images ✓
- [ ] Stage 3: Run Tests ✓
- [ ] Stage 4: Push to Docker Hub ✓
- [ ] Stage 5: Deploy to EC2 ✓
- [ ] Stage 6: Health Check ✓
- [ ] Build completed successfully
- [ ] Build time: _____ minutes

---

## Phase 9: Verification

### Check Containers on EC2
- [ ] SSH to EC2
- [ ] Ran `docker ps`
- [ ] Containers running:
  - [ ] flowgrid-frontend
  - [ ] flowgrid-backend
  - [ ] flowgrid-mongodb
- [ ] No containers in restart loop
- [ ] All containers healthy

### Check Logs
- [ ] Backend logs: `docker logs flowgrid-backend`
  - [ ] No errors
  - [ ] Server started message visible
  - [ ] Database connected message visible
- [ ] Frontend logs: `docker logs flowgrid-frontend`
  - [ ] Nginx started successfully
- [ ] MongoDB logs: `docker logs flowgrid-mongodb`
  - [ ] Database initialized
  - [ ] Ready for connections

### Test Application
- [ ] Frontend accessible: `http://YOUR_EC2_IP`
  - [ ] Page loads correctly
  - [ ] No console errors
- [ ] API health check: `http://YOUR_EC2_IP/api/health`
  - [ ] Returns 200 OK
  - [ ] Shows "healthy" status
  - [ ] Database shows "connected"
- [ ] API endpoints working:
  - [ ] /api/products
  - [ ] /api/customers
  - [ ] /api/orders
  - [ ] /api/employees

---

## Phase 10: Database Setup

### Seed Database
- [ ] SSH to EC2
- [ ] Ran seed command:
  ```bash
  docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"
  ```
- [ ] Seed completed successfully
- [ ] Data created:
  - [ ] Admin user
  - [ ] Products
  - [ ] Customers
  - [ ] Orders
  - [ ] Employees

### Verify Database
- [ ] Connected to MongoDB:
  ```bash
  docker exec -it flowgrid-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
  ```
- [ ] Checked collections:
  - [ ] users collection exists
  - [ ] products collection exists
  - [ ] customers collection exists
  - [ ] orders collection exists
  - [ ] employees collection exists
- [ ] Sample data visible in collections

---

## Phase 11: Test Auto-Deployment

### Make Test Change
- [ ] Made a small code change locally
- [ ] Committed change: `git commit -m "Test auto-deployment"`
- [ ] Pushed to GitHub: `git push origin main`

### Verify Auto-Deployment
- [ ] GitHub webhook triggered automatically
- [ ] Jenkins build started automatically
- [ ] Build completed successfully
- [ ] New containers deployed
- [ ] Application updated with changes
- [ ] No downtime experienced

---

## Phase 12: Security Hardening

### Change Default Passwords
- [ ] Changed MongoDB password in .env
- [ ] Updated MongoDB URI with new password
- [ ] Restarted containers: `docker-compose restart`
- [ ] Verified connection still works

### Secure Jenkins
- [ ] Jenkins admin password is strong
- [ ] Security group restricts Jenkins port to My IP only
- [ ] Jenkins security realm configured
- [ ] CSRF protection enabled

### Secure EC2
- [ ] SSH key stored securely
- [ ] Security group rules reviewed
- [ ] Only necessary ports open
- [ ] Considered setting up fail2ban

---

## Phase 13: Monitoring Setup

### Health Checks
- [ ] Health endpoint accessible: `/api/health`
- [ ] Returns correct status
- [ ] Database status included
- [ ] Uptime information included

### Log Monitoring
- [ ] Know how to check logs:
  - [ ] `docker logs flowgrid-backend -f`
  - [ ] `docker logs flowgrid-frontend -f`
  - [ ] `docker logs flowgrid-mongodb -f`
- [ ] Logs are readable and informative

### Resource Monitoring
- [ ] Can check resource usage: `docker stats`
- [ ] CPU usage is reasonable
- [ ] Memory usage is reasonable
- [ ] Disk space is sufficient: `df -h`

---

## Phase 14: Backup Strategy

### Database Backup
- [ ] Backup command tested:
  ```bash
  docker exec flowgrid-mongodb mongodump --out /backup -u admin -p admin123 --authenticationDatabase admin
  ```
- [ ] Backup successful
- [ ] Backup copied from container:
  ```bash
  docker cp flowgrid-mongodb:/backup ./mongodb-backup
  ```
- [ ] Backup stored securely

### Code Backup
- [ ] Code is in GitHub (version controlled)
- [ ] .env file backed up separately (not in git)
- [ ] SSH keys backed up securely

---

## Phase 15: Documentation

### Document Your Setup
- [ ] EC2 IP address documented: ___________________
- [ ] Jenkins URL documented: ___________________
- [ ] Docker Hub username documented: ___________________
- [ ] MongoDB credentials stored securely
- [ ] JWT secret stored securely
- [ ] All passwords stored in password manager

### Team Documentation
- [ ] Shared access information with team
- [ ] Documented custom configurations
- [ ] Created runbook for common tasks
- [ ] Documented troubleshooting steps

---

## Phase 16: Final Testing

### Comprehensive Testing
- [ ] Frontend loads correctly
- [ ] All pages accessible
- [ ] Login functionality works
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] CORS is configured correctly
- [ ] No console errors
- [ ] No network errors

### Performance Testing
- [ ] Page load time acceptable
- [ ] API response time acceptable
- [ ] Database queries are fast
- [ ] No memory leaks
- [ ] No CPU spikes

### Auto-Deployment Testing
- [ ] Made multiple test commits
- [ ] Each commit triggered deployment
- [ ] All deployments successful
- [ ] No manual intervention needed

---

## Phase 17: Post-Deployment

### Monitoring
- [ ] Set up CloudWatch (optional)
- [ ] Configure alerts for failures
- [ ] Monitor disk space
- [ ] Monitor memory usage
- [ ] Monitor CPU usage

### Optimization
- [ ] Docker images optimized
- [ ] Database indexes created
- [ ] Nginx caching configured
- [ ] Static assets optimized

### Future Improvements
- [ ] Plan for HTTPS/SSL setup
- [ ] Plan for domain name
- [ ] Plan for staging environment
- [ ] Plan for load balancing
- [ ] Plan for auto-scaling

---

## ✅ Deployment Complete!

### Success Criteria
- [ ] All containers running
- [ ] Application accessible
- [ ] API working
- [ ] Database connected
- [ ] Auto-deployment working
- [ ] No errors in logs
- [ ] Team has access
- [ ] Documentation complete

### Access Information
```
Frontend: http://YOUR_EC2_IP
API: http://YOUR_EC2_IP/api
Jenkins: http://YOUR_EC2_IP:8080
Health: http://YOUR_EC2_IP/api/health
```

### Next Steps
- [ ] Setup SSL certificate
- [ ] Configure domain name
- [ ] Implement staging environment
- [ ] Add more monitoring
- [ ] Regular backups scheduled
- [ ] Security audit completed

---

## 📞 Support Resources

### Documentation
- [ ] START_HERE_DEPLOYMENT.md
- [ ] VISUAL_SETUP_GUIDE.md
- [ ] JENKINS_DOCKER_DEPLOYMENT_GUIDE.md
- [ ] TROUBLESHOOTING_DETAILED.md
- [ ] QUICK_SETUP_COMMANDS.md

### Quick Commands
```bash
# Check status
docker ps
docker-compose logs -f

# Restart services
docker-compose restart

# Health check
curl http://localhost/api/health

# View logs
docker logs flowgrid-backend -f
```

---

**Congratulations! Your deployment is complete! 🎉**

Date Completed: ___________________
Deployed By: ___________________
EC2 IP: ___________________
Jenkins URL: ___________________

---

**Keep this checklist for future reference and team onboarding!**
