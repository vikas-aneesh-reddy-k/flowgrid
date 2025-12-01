# Jenkins CI/CD for FlowGrid

This directory contains Jenkins configuration files for automated CI/CD pipeline.

## Quick Start

### 1. Install Jenkins
```bash
chmod +x jenkins/install-jenkins.sh
./jenkins/install-jenkins.sh
```

### 2. Access Jenkins
Open `http://YOUR_SERVER_IP:8080` in your browser

### 3. Complete Setup
Follow the detailed instructions in [JENKINS_SETUP.md](./JENKINS_SETUP.md)

## Files

- `install-jenkins.sh` - Automated Jenkins installation script
- `JENKINS_SETUP.md` - Complete setup and configuration guide
- `../Jenkinsfile` - Pipeline definition (in project root)

## Pipeline Flow

```
GitHub Push
    ↓
Jenkins Webhook Triggered
    ↓
Checkout Code
    ↓
Install Dependencies (Frontend & Backend in parallel)
    ↓
Lint & Type Check (in parallel)
    ↓
Run Tests (Unit & API in parallel)
    ↓
Build Docker Images (Frontend & Backend in parallel)
    ↓
Push to Docker Hub
    ↓
Deploy to EC2
    ↓
Health Check
    ↓
Success/Failure Notification
```

## Requirements

- Ubuntu 22.04 LTS
- 2+ CPU cores
- 4GB+ RAM
- 30GB+ disk space
- Docker Hub account
- AWS EC2 instance for deployment
- GitHub repository

## Environment Variables

Configure these in Jenkins:
- `EC2_HOST` - Your EC2 instance IP/hostname
- `EC2_USERNAME` - SSH username (usually 'ubuntu')
- `VITE_API_URL` - Your API URL

## Credentials Required

1. **Docker Hub** (ID: `docker-hub-credentials`)
   - Username and password/token

2. **EC2 SSH Key** (ID: `ec2-ssh-key`)
   - Private key for EC2 access

## Testing

### Manual Build
1. Go to Jenkins dashboard
2. Select your pipeline
3. Click "Build Now"

### Automatic Build
1. Push code to GitHub
2. Jenkins will automatically trigger build

## Troubleshooting

See [JENKINS_SETUP.md](./JENKINS_SETUP.md#troubleshooting) for common issues and solutions.
