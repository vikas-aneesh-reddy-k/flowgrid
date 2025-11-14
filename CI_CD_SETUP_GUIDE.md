# CI/CD Pipeline Setup Guide
## Jenkins + Docker + AWS EC2 (Free Tier)

This guide will help you set up a complete CI/CD pipeline for FlowGrid ERP.

---

## 📋 Prerequisites

- AWS Account (Free Tier eligible)
- Docker Hub Account (free)
- GitHub/GitLab repository
- Domain name (optional, can use EC2 IP)

---

## 🎯 Architecture Overview

```
GitHub Push → Jenkins Webhook → Build → Test → Docker Build → Push to Hub → Deploy to EC2
```

**Testing Layers:**
1. **Unit Tests** (Jest/Vitest) - Fast, component-level
2. **API Integration Tests** (Supertest) - Backend endpoints
3. **E2E Tests** (Playwright) - Full user workflows

---

## Part 1: AWS EC2 Setup (15 minutes)

### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → EC2 Dashboard
2. **Click "Launch Instance"**
3. **Configure:**
   - Name: `flowgrid-production`
   - AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   - Instance type: `t2.micro` (1 vCPU, 1GB RAM)
   - Key pair: Create new or use existing
   - Storage: 30 GB gp3 (Free tier: 30GB)

4. **Security Group Settings:**
   ```
   Type            Protocol    Port Range    Source
   SSH             TCP         22            Your IP
   HTTP            TCP         80            0.0.0.0/0
   HTTPS           TCP         443           0.0.0.0/0
   Custom TCP      TCP         8080          Your IP (Jenkins)
   Custom TCP      TCP         5000          Your IP (Backend API)
   ```

5. **Launch Instance** and download the `.pem` key file

### Step 2: Connect to EC2

```bash
# Set permissions on key file
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

### Step 4: Install Jenkins on EC2

```bash
# Reconnect to EC2
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Install Java (Jenkins requirement)
sudo apt install -y openjdk-17-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 5: Configure Jenkins

1. **Access Jenkins:** `http://<EC2-PUBLIC-IP>:8080`
2. **Enter initial admin password** (from previous step)
3. **Install suggested plugins**
4. **Create admin user**
5. **Install additional plugins:**
   - Docker Pipeline
   - SSH Agent
   - GitHub Integration
   - HTML Publisher (for test reports)

---

## Part 2: Docker Hub Setup (5 minutes)

### Step 1: Create Docker Hub Account
1. Go to https://hub.docker.com
2. Sign up for free account
3. Create two repositories:
   - `your-username/flowgrid-frontend`
   - `your-username/flowgrid-backend`

### Step 2: Add Docker Hub Credentials to Jenkins
1. Jenkins → Manage Jenkins → Credentials
2. Add Credentials:
   - Kind: Username with password
   - ID: `dockerhub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password

---

## Part 3: Project Setup (10 minutes)

### Step 1: Update Jenkinsfile

Edit `Jenkinsfile` and replace:
```groovy
DOCKER_IMAGE_FRONTEND = 'your-dockerhub-username/flowgrid-frontend'
DOCKER_IMAGE_BACKEND = 'your-dockerhub-username/flowgrid-backend'
```

### Step 2: Setup Application on EC2

```bash
# On EC2 instance
cd /home/ubuntu
git clone https://github.com/your-username/flowgrid.git
cd flowgrid

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

Update `.env`:
```env
MONGO_USER=admin
MONGO_PASSWORD=<strong-password>
JWT_SECRET=<generate-random-string>
NODE_ENV=production
```

### Step 3: Add EC2 SSH Key to Jenkins

1. **On your local machine:**
```bash
cat your-key.pem
```

2. **In Jenkins:**
   - Manage Jenkins → Credentials
   - Add Credentials:
     - Kind: SSH Username with private key
     - ID: `ec2-ssh-key`
     - Username: `ubuntu`
     - Private Key: Paste content from your-key.pem

3. **Add EC2 Host:**
   - Add Credentials:
     - Kind: Secret text
     - ID: `ec2-host`
     - Secret: Your EC2 public IP

---

## Part 4: Jenkins Pipeline Setup (10 minutes)

### Step 1: Create Jenkins Job

1. **New Item** → Enter name: `flowgrid-pipeline`
2. **Select:** Pipeline
3. **Configure:**

   **General:**
   - ✅ GitHub project: `https://github.com/your-username/flowgrid`

   **Build Triggers:**
   - ✅ GitHub hook trigger for GITScm polling

   **Pipeline:**
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/your-username/flowgrid.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

4. **Save**

### Step 2: Setup GitHub Webhook

1. **GitHub Repository** → Settings → Webhooks
2. **Add webhook:**
   - Payload URL: `http://<EC2-PUBLIC-IP>:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event
   - ✅ Active

---

## Part 5: Testing Setup (15 minutes)

### Step 1: Install Testing Dependencies

```bash
# On your local machine
npm install --save-dev jest @types/jest supertest @types/supertest
npm install --save-dev vitest @vitest/ui
```

### Step 2: Create API Integration Tests

Create `server/tests/api.test.js`:
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('API Integration Tests', () => {
  let token;

  test('POST /api/auth/login - should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@flowgrid.com',
        password: 'admin123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('GET /api/dashboard/stats - should return stats', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/health - should return healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
```

### Step 3: Update package.json

Add to `package.json`:
```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:api": "jest --testPathPattern=server/tests",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:api && npm run test:e2e"
  }
}
```

---

## Part 6: First Deployment (10 minutes)

### Step 1: Manual Test Deployment

```bash
# On EC2
cd /home/ubuntu/flowgrid

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services
curl http://localhost:5000/api/health
curl http://localhost:80
```

### Step 2: Trigger Jenkins Build

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

2. **Watch Jenkins build:**
   - Go to Jenkins dashboard
   - Click on `flowgrid-pipeline`
   - Watch the build progress

### Step 3: Verify Deployment

```bash
# Check running containers
docker ps

# Check application
curl http://<EC2-PUBLIC-IP>/api/health
curl http://<EC2-PUBLIC-IP>
```

---

## 🎉 Success! Your Pipeline is Ready

### Pipeline Flow:
1. ✅ Push code to GitHub
2. ✅ GitHub webhook triggers Jenkins
3. ✅ Jenkins runs tests (Unit → API → E2E)
4. ✅ Builds Docker images
5. ✅ Pushes to Docker Hub
6. ✅ Deploys to EC2
7. ✅ Runs smoke tests

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
# On EC2
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
# Just push to GitHub - Jenkins handles the rest!
git push origin main
```

### Manual Deployment
```bash
# On EC2
cd /home/ubuntu/flowgrid
./deploy.sh
```

---

## 💰 Cost Breakdown

### Free Tier (12 months):
- EC2 t2.micro: 750 hours/month (FREE)
- EBS Storage: 30 GB (FREE)
- Data Transfer: 15 GB/month (FREE)
- MongoDB Atlas: 512 MB (FREE forever)

### After Free Tier:
- EC2 t2.micro: ~$8-10/month
- EBS Storage: ~$3/month
- Total: ~$11-13/month

---

## 🔧 Troubleshooting

### Jenkins can't connect to EC2
- Check security group allows port 22 from Jenkins IP
- Verify SSH key is correct in Jenkins credentials

### Docker build fails
- Check Docker Hub credentials in Jenkins
- Verify Dockerfile paths are correct

### Deployment fails
- Check EC2 has enough disk space: `df -h`
- Verify Docker is running: `docker ps`
- Check logs: `docker-compose logs`

### Tests fail
- Run tests locally first
- Check MongoDB connection
- Verify environment variables

---

## 🚀 Next Steps

1. **Setup SSL/HTTPS:**
   - Use Let's Encrypt with Certbot
   - Update nginx configuration

2. **Add Monitoring:**
   - Setup CloudWatch for EC2
   - Add application monitoring (Prometheus/Grafana)

3. **Backup Strategy:**
   - Automated MongoDB backups
   - S3 bucket for backups

4. **Scaling:**
   - Add load balancer
   - Multiple EC2 instances
   - Auto-scaling groups

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2/)
- [Playwright Testing](https://playwright.dev/)

---

**Need Help?** Check the troubleshooting section or review Jenkins build logs for specific errors.
