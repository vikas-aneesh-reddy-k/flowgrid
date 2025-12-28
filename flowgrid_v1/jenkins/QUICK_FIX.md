# Quick Fix for Jenkins Deploy to EC2 Failure

## The Problem
Jenkins "Deploy to EC2" stage is failing because it was trying to use a webhook that doesn't exist.

## The Solution
Updated Jenkinsfile to use direct SSH deployment (like GitHub Actions does).

## What You Need to Do Now

### 1. Add EC2 SSH Key to Jenkins (5 minutes)

1. Open Jenkins: `http://localhost:8080`
2. Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
3. Click: **Add Credentials**
4. Fill in:
   ```
   Kind: SSH Username with private key
   ID: ec2-ssh-key
   Username: ubuntu
   Private Key: [Click "Enter directly" and paste your .pem file content]
   ```
5. Click **Create**

### 2. Set Environment Variables in Jenkins (2 minutes)

1. Go to: **Manage Jenkins** → **System**
2. Find: **Global properties** → Check **Environment variables**
3. Add these:
   ```
   EC2_HOST = 16.170.155.235 (your EC2 IP)
   EC2_USERNAME = ubuntu
   VITE_API_URL = http://16.170.155.235:5000/api
   ```
4. Click **Save**

### 3. Test Your Setup (1 minute)

Run this script to verify everything works:
```cmd
jenkins\test-jenkins-connection.bat
```

### 4. Run Jenkins Build

1. Go to your Jenkins job
2. Click **Build Now**
3. Watch it succeed! 🎉

## If It Still Fails

### Check SSH is installed:
```cmd
ssh -V
```
If not found, install OpenSSH Client from Windows Settings → Apps → Optional Features

### Test manual SSH connection:
```cmd
ssh -i path\to\your-key.pem ubuntu@YOUR_EC2_IP
```

### Check Jenkins credentials:
- Make sure credential ID is exactly: `ec2-ssh-key`
- Make sure you pasted the ENTIRE .pem file (including BEGIN/END lines)

### Check EC2 Security Group:
- Port 22 (SSH) must be open from your Jenkins server IP

## What Changed in Jenkinsfile

**Before** (webhook approach - doesn't work):
```groovy
bat """
    curl -X POST -H "X-Deploy-Token: deploy-secret-token-12345" http://${env.EC2_HOST}:9000/hooks/deploy-flowgrid
"""
```

**After** (direct SSH - works):
```groovy
withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
    bat """
        ssh -i "%SSH_KEY%" ubuntu@${env.EC2_HOST} "cd /home/ubuntu/flowgrid && docker compose pull && docker compose up -d"
    """
}
```

## Full Documentation

For complete setup instructions, see:
- `jenkins/WINDOWS_SETUP.md` - Complete Windows setup guide
- `jenkins/README.md` - General Jenkins documentation

## Quick Commands

### View logs on EC2:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs -f
```

### Manual deployment:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose pull
docker compose down
docker compose up -d
```

### Check container status:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
docker compose ps
```

---

**That's it!** Follow steps 1-4 above and your Jenkins deployment will work.
