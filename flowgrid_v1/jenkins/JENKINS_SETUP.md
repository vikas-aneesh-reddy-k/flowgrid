# Jenkins CI/CD Setup Guide

This guide will help you set up Jenkins for automated building, testing, and deployment of your application to AWS EC2.

## Architecture Overview

```
GitHub Push → Jenkins Webhook → Build & Test → Docker Build → Push to Docker Hub → Deploy to EC2
```

## Prerequisites

- AWS EC2 instance for Jenkins (t2.medium or larger recommended)
- AWS EC2 instance for application deployment
- Docker Hub account
- GitHub repository
- SSH access to both EC2 instances

## Part 1: Install Jenkins

### Option A: On a Separate EC2 Instance (Recommended)

1. Launch a new EC2 instance:
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t2.medium (minimum)
   - Storage: 30GB
   - Security Group: Allow ports 22 (SSH), 8080 (Jenkins), 443 (HTTPS)

2. Connect to the instance and run:
   ```bash
   chmod +x jenkins/install-jenkins.sh
   ./jenkins/install-jenkins.sh
   ```

3. Access Jenkins at `http://YOUR_JENKINS_SERVER_IP:8080`

### Option B: On the Same EC2 Instance as Your App

⚠️ **Not recommended for production** - Jenkins can consume significant resources

```bash
chmod +x jenkins/install-jenkins.sh
./jenkins/install-jenkins.sh
```

## Part 2: Configure Jenkins

### 1. Initial Setup

1. Open Jenkins in browser: `http://YOUR_JENKINS_SERVER_IP:8080`
2. Enter the initial admin password (displayed after installation)
3. Install suggested plugins
4. Create your first admin user

### 2. Install Required Plugins

Go to **Manage Jenkins** → **Plugins** → **Available plugins**

Install these plugins:
- Docker Pipeline
- Docker plugin
- SSH Agent Plugin
- GitHub Integration Plugin
- NodeJS Plugin
- Pipeline
- Git plugin

After installation, restart Jenkins.

### 3. Configure Global Tools

#### Configure Node.js
1. Go to **Manage Jenkins** → **Tools**
2. Scroll to **NodeJS installations**
3. Click **Add NodeJS**
   - Name: `NodeJS 20`
   - Version: Select `NodeJS 20.x`
   - Check "Install automatically"
4. Save

#### Configure Docker
Docker should already be available since we installed it on the system.

### 4. Add Credentials

Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

#### Add Docker Hub Credentials
1. Click **Add Credentials**
2. Kind: `Username with password`
3. Username: Your Docker Hub username
4. Password: Your Docker Hub password or access token
5. ID: `docker-hub-credentials`
6. Description: `Docker Hub`
7. Click **Create**

#### Add EC2 SSH Key
1. Click **Add Credentials**
2. Kind: `SSH Username with private key`
3. ID: `ec2-ssh-key`
4. Description: `EC2 SSH Key`
5. Username: `ubuntu` (or your EC2 username)
6. Private Key: Click **Enter directly** and paste your EC2 private key
7. Click **Create**

### 5. Configure Environment Variables

1. Go to **Manage Jenkins** → **System**
2. Scroll to **Global properties**
3. Check **Environment variables**
4. Add these variables:
   - `EC2_HOST`: Your EC2 application server IP/hostname
   - `EC2_USERNAME`: `ubuntu` (or your EC2 username)
   - `VITE_API_URL`: Your API URL (e.g., `http://YOUR_EC2_IP:5000`)

## Part 3: Create Jenkins Pipeline

### 1. Create New Pipeline Job

1. Click **New Item**
2. Enter name: `flowgrid-pipeline`
3. Select **Pipeline**
4. Click **OK**

### 2. Configure Pipeline

#### General Settings
- Description: `Build, test, and deploy FlowGrid application`
- Check **GitHub project** and enter your repository URL

#### Build Triggers
- Check **GitHub hook trigger for GITScm polling**

#### Pipeline Configuration
1. Definition: `Pipeline script from SCM`
2. SCM: `Git`
3. Repository URL: Your GitHub repository URL
4. Credentials: Add your GitHub credentials if private repo
5. Branch: `*/main` (or `*/master`)
6. Script Path: `Jenkinsfile`
7. Click **Save**

## Part 4: Configure GitHub Webhook

### 1. In GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Payload URL: `http://YOUR_JENKINS_SERVER_IP:8080/github-webhook/`
4. Content type: `application/json`
5. Select: **Just the push event**
6. Check **Active**
7. Click **Add webhook**

### 2. Test Webhook

1. Make a small change to your repository
2. Push to main/master branch
3. Check Jenkins - a build should start automatically

## Part 5: Prepare EC2 Application Server

On your EC2 application server, ensure:

1. Docker and Docker Compose are installed
2. Application directory exists:
   ```bash
   mkdir -p /home/ubuntu/flowgrid
   cd /home/ubuntu/flowgrid
   ```

3. Copy your `docker-compose.yml` and `.env` files:
   ```bash
   # Copy docker-compose.yml to /home/ubuntu/flowgrid/
   # Create .env file with your environment variables
   ```

4. Ensure Jenkins can SSH into this server (test manually first)

## Part 6: Test the Pipeline

### Manual Test
1. Go to your Jenkins pipeline
2. Click **Build Now**
3. Watch the build progress in **Console Output**

### Automatic Test
1. Make a change to your code
2. Commit and push to GitHub
3. Jenkins should automatically start building

## Troubleshooting

### Jenkins Can't Connect to Docker
```bash
# On Jenkins server
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### SSH Connection Issues
```bash
# Test SSH connection manually
ssh -i /path/to/key ubuntu@YOUR_EC2_IP

# Check SSH key permissions
chmod 600 /path/to/key
```

### Docker Permission Denied
```bash
# On Jenkins server
sudo chmod 666 /var/run/docker.sock
```

### Build Fails on Tests
- Check test configuration in `package.json`
- Ensure all test dependencies are installed
- Review test logs in Jenkins console output

### Deployment Fails
- Verify EC2 security groups allow SSH (port 22)
- Check EC2 instance has enough disk space
- Verify Docker Hub credentials are correct

## Pipeline Stages Explained

1. **Checkout**: Clones your repository
2. **Install Dependencies**: Installs npm packages for frontend and backend
3. **Lint & Type Check**: Runs code quality checks
4. **Run Tests**: Executes unit and API tests
5. **Build Docker Images**: Creates Docker images for frontend and backend
6. **Push to Docker Hub**: Uploads images to Docker Hub
7. **Deploy to EC2**: SSHs to EC2 and updates running containers
8. **Health Check**: Verifies application is running correctly

## Security Best Practices

1. **Use HTTPS**: Configure Jenkins with SSL certificate
2. **Restrict Access**: Use Jenkins security realm and authorization
3. **Rotate Credentials**: Regularly update passwords and keys
4. **Backup**: Regularly backup Jenkins configuration
5. **Update**: Keep Jenkins and plugins up to date

## Monitoring and Notifications

### Add Slack Notifications (Optional)

1. Install **Slack Notification Plugin**
2. Configure Slack workspace integration
3. Add to Jenkinsfile:
   ```groovy
   post {
       success {
           slackSend color: 'good', message: "Deployment successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
       }
       failure {
           slackSend color: 'danger', message: "Deployment failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
       }
   }
   ```

### Add Email Notifications

1. Configure SMTP in **Manage Jenkins** → **System** → **E-mail Notification**
2. Add to Jenkinsfile:
   ```groovy
   post {
       failure {
           emailext (
               subject: "Build Failed: ${env.JOB_NAME}",
               body: "Build ${env.BUILD_NUMBER} failed. Check console output.",
               to: "your-email@example.com"
           )
       }
   }
   ```

## Maintenance

### Backup Jenkins
```bash
# Backup Jenkins home directory
sudo tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins/
```

### Update Jenkins
```bash
sudo apt-get update
sudo apt-get upgrade jenkins
```

### Clean Up Docker Images
Jenkins will automatically clean up old images, but you can also run:
```bash
docker system prune -af
```

## Next Steps

1. Set up staging environment for testing before production
2. Implement blue-green deployment for zero downtime
3. Add performance testing stage
4. Set up monitoring with Prometheus/Grafana
5. Implement automated rollback on failure

## Support

For issues or questions:
- Check Jenkins logs: `/var/lib/jenkins/logs/`
- Review build console output in Jenkins UI
- Check application logs on EC2: `docker compose logs`
