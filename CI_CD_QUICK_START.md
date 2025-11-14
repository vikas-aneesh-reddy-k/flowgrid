# CI/CD Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites Checklist
- [ ] AWS Account
- [ ] Docker Hub Account  
- [ ] GitHub Repository
- [ ] SSH Key for EC2

---

## Step 1: Launch EC2 (5 min)
```bash
# AWS Console → EC2 → Launch Instance
Instance Type: t2.micro (Free Tier)
AMI: Ubuntu 22.04 LTS
Storage: 30 GB
Security Groups: 22, 80, 443, 8080, 5000
```

## Step 2: Install on EC2 (10 min)
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@<EC2-IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Jenkins
sudo apt install -y openjdk-17-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins

# Get Jenkins password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## Step 3: Configure Jenkins (5 min)
1. Open `http://<EC2-IP>:8080`
2. Enter admin password
3. Install suggested plugins
4. Install: Docker Pipeline, SSH Agent, GitHub Integration
5. Add credentials:
   - Docker Hub (ID: `dockerhub-credentials`)
   - EC2 SSH Key (ID: `ec2-ssh-key`)
   - EC2 Host (ID: `ec2-host`)

## Step 4: Setup Project (5 min)
```bash
# On EC2
cd /home/ubuntu
git clone https://github.com/your-username/flowgrid.git
cd flowgrid
cp .env.example .env
nano .env  # Update credentials
```

## Step 5: Create Jenkins Pipeline (5 min)
1. Jenkins → New Item → Pipeline
2. Name: `flowgrid-pipeline`
3. Pipeline from SCM → Git
4. Repository: Your GitHub URL
5. Script Path: `Jenkinsfile`
6. Save

## Step 6: Setup GitHub Webhook (2 min)
1. GitHub Repo → Settings → Webhooks
2. Add webhook: `http://<EC2-IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: Push events

## Step 7: Deploy! (1 min)
```bash
git push origin main
# Watch Jenkins build automatically!
```

---

## 📊 Testing Commands

```bash
# Run all tests locally
npm run test:all

# Run specific test layers
npm run test:unit      # Fast unit tests
npm run test:api       # API integration tests
npm run test:e2e       # Playwright E2E tests

# CI-optimized tests
npm run test:ci        # Unit + API only
```

---

## 🔧 Troubleshooting

**Jenkins can't connect to EC2:**
- Check security group allows port 22
- Verify SSH key in Jenkins credentials

**Docker build fails:**
- Check Docker Hub credentials
- Verify Dockerfile paths

**Tests fail:**
- Run locally first: `npm run test:all`
- Check MongoDB connection
- Verify environment variables

---

## 📚 Full Documentation
See `CI_CD_SETUP_GUIDE.md` for detailed instructions.
