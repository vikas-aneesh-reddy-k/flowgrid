# Jenkins Deployment Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Pre-Deployment Checklist

### Jenkins Setup
- [ ] Jenkins is installed and running on Windows
- [ ] Can access Jenkins at `http://localhost:8080`
- [ ] Jenkins plugins installed:
  - [ ] SSH Credentials Plugin
  - [ ] Docker Pipeline Plugin
  - [ ] Git Plugin

### Windows Environment
- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] OpenSSH Client installed (test with `ssh -V`)
- [ ] Can run `ssh` and `scp` commands from Command Prompt

### AWS EC2
- [ ] EC2 instance is running
- [ ] Have the `.pem` key file
- [ ] Know the EC2 public IP address
- [ ] Security Group allows:
  - [ ] Port 22 (SSH) from Jenkins server IP
  - [ ] Port 80 (HTTP) for frontend
  - [ ] Port 5000 (API) for backend
  - [ ] Port 27017 (MongoDB) - optional, for MongoDB Compass

### Docker Hub
- [ ] Have Docker Hub account (username: vikaskakarla)
- [ ] Created access token at https://hub.docker.com/settings/security
- [ ] Can login: `docker login`

### GitHub
- [ ] Code is pushed to GitHub repository
- [ ] Repository is accessible from Jenkins

## ✅ Jenkins Configuration Checklist

### Step 1: Docker Hub Credentials
- [ ] Go to: Manage Jenkins → Credentials → Global credentials
- [ ] Added credential with:
  - [ ] Kind: Username with password
  - [ ] ID: `docker-hub-credentials`
  - [ ] Username: `vikaskakarla`
  - [ ] Password: Docker Hub access token

### Step 2: EC2 SSH Key
- [ ] Go to: Manage Jenkins → Credentials → Global credentials
- [ ] Added credential with:
  - [ ] Kind: SSH Username with private key
  - [ ] ID: `ec2-ssh-key`
  - [ ] Username: `ubuntu`
  - [ ] Private Key: Entire .pem file content (including BEGIN/END lines)

### Step 3: Environment Variables
- [ ] Go to: Manage Jenkins → System → Global properties
- [ ] Checked: Environment variables
- [ ] Added variables:
  - [ ] `EC2_HOST` = Your EC2 IP (e.g., 16.170.155.235)
  - [ ] `EC2_USERNAME` = `ubuntu`
  - [ ] `VITE_API_URL` = `http://YOUR_EC2_IP:5000/api`

### Step 4: Pipeline Job
- [ ] Created new Pipeline job named `flowgrid-production`
- [ ] Configured:
  - [ ] Build Triggers: GitHub hook trigger (if using webhooks)
  - [ ] Pipeline Definition: Pipeline script from SCM
  - [ ] SCM: Git
  - [ ] Repository URL: Your GitHub repo
  - [ ] Branch: `*/main` or `*/master`
  - [ ] Script Path: `Jenkinsfile`

## ✅ Testing Checklist

### Test 1: SSH Connection
```cmd
ssh -i path\to\your-key.pem ubuntu@YOUR_EC2_IP
```
- [ ] Connection successful
- [ ] Can see Ubuntu prompt
- [ ] Type `exit` to disconnect

### Test 2: Run Connection Test Script
```cmd
jenkins\test-jenkins-connection.bat
```
- [ ] All 5 tests passed
- [ ] SSH works
- [ ] SCP works
- [ ] Docker found on EC2
- [ ] FlowGrid directory exists

### Test 3: Manual Docker Commands
```cmd
docker --version
docker compose version
```
- [ ] Docker is installed
- [ ] Docker Compose is available

### Test 4: Jenkins Build
- [ ] Go to Jenkins job
- [ ] Click "Build Now"
- [ ] Watch console output
- [ ] All stages complete successfully:
  - [ ] Checkout SCM
  - [ ] Install Dependencies
  - [ ] Lint & Type Check
  - [ ] Run Tests
  - [ ] Build Docker Images
  - [ ] Push to Docker Hub
  - [ ] Deploy to EC2
  - [ ] Health Check

## ✅ Post-Deployment Verification

### Frontend
- [ ] Open `http://YOUR_EC2_IP` in browser
- [ ] Page loads successfully
- [ ] No console errors
- [ ] Can navigate the app

### Backend
- [ ] Open `http://YOUR_EC2_IP:5000/health` in browser
- [ ] Returns: `{"status":"ok"}`
- [ ] API is responding

### Docker Containers
SSH to EC2 and check:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose ps
```
- [ ] 3 containers running:
  - [ ] flowgrid-mongodb-1 (healthy)
  - [ ] flowgrid-backend-1 (healthy)
  - [ ] flowgrid-frontend-1 (healthy)

### MongoDB
- [ ] Can connect with MongoDB Compass (if port 27017 is open)
- [ ] Connection string: `mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_IP:27017/flowgrid?authSource=admin`
- [ ] Can see `flowgrid` database
- [ ] Collections exist: users, products, orders, customers, inventory

## ✅ Troubleshooting Checklist

If deployment fails, check:

### Jenkins Console Output
- [ ] Read the full console output
- [ ] Identify which stage failed
- [ ] Look for specific error messages

### Common Issues

#### "ssh: command not found"
- [ ] Install OpenSSH Client from Windows Optional Features
- [ ] Restart Command Prompt
- [ ] Test: `ssh -V`

#### "Permission denied (publickey)"
- [ ] Verify .pem file content in Jenkins credentials
- [ ] Check credential ID is exactly: `ec2-ssh-key`
- [ ] Test SSH manually with the same .pem file

#### "Host key verification failed"
- [ ] SSH to EC2 manually once to accept fingerprint
- [ ] Or add `-o StrictHostKeyChecking=no` to SSH command

#### "docker: command not found" (on EC2)
- [ ] SSH to EC2
- [ ] Run: `docker --version`
- [ ] If not found, run setup script: `deploy/setup-ec2.sh`

#### "Cannot connect to Docker daemon"
- [ ] Check Docker Desktop is running on Windows
- [ ] Restart Docker Desktop
- [ ] Restart Jenkins

#### Docker images not found
- [ ] Check "Push to Docker Hub" stage succeeded
- [ ] Verify Docker Hub credentials
- [ ] Check images exist: https://hub.docker.com/u/vikaskakarla

#### Containers not starting on EC2
- [ ] SSH to EC2
- [ ] Check logs: `docker compose logs -f`
- [ ] Check .env file exists: `cat /home/ubuntu/flowgrid/.env`
- [ ] Verify environment variables are set

## ✅ Security Checklist

- [ ] Changed default MongoDB password in .env
- [ ] Changed JWT_SECRET in .env
- [ ] Jenkins requires authentication
- [ ] .pem key file is secure (not in Git)
- [ ] Docker Hub token is secure (not in Git)
- [ ] EC2 security group restricts SSH to known IPs
- [ ] MongoDB port 27017 is not publicly accessible (or restricted)

## ✅ Maintenance Checklist

### Weekly
- [ ] Check Jenkins disk space
- [ ] Review build logs for warnings
- [ ] Check EC2 disk usage
- [ ] Review Docker logs for errors

### Monthly
- [ ] Update Jenkins plugins
- [ ] Update Docker images
- [ ] Backup MongoDB data
- [ ] Review security group rules
- [ ] Check for OS updates on EC2

### As Needed
- [ ] Rotate Docker Hub tokens
- [ ] Rotate MongoDB passwords
- [ ] Update SSL certificates (when HTTPS is set up)
- [ ] Review and clean old Docker images

## 📞 Need Help?

### Documentation
- **Quick Fix**: [QUICK_FIX.md](./QUICK_FIX.md)
- **Windows Setup**: [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)
- **General Setup**: [JENKINS_SETUP.md](./JENKINS_SETUP.md)

### Test Scripts
- **Connection Test**: `jenkins\test-jenkins-connection.bat`

### Useful Commands

#### View Jenkins logs (Windows):
```cmd
# Check Jenkins service status
services.msc
```

#### View EC2 logs:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs -f
```

#### Manual deployment:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose pull
docker compose down
docker compose up -d
```

---

**Print this checklist and check off items as you complete them!**
