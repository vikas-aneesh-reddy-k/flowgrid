# 🚨 Deployment Troubleshooting Guide

## Current Issues

### 1. GitHub Actions Failing ❌
**Error**: `dial tcp ***:22: i/o timeout`

### 2. Jenkins Failing ❌
**Stage**: Deploy to EC2

## Root Cause

**AWS Security Group is blocking SSH connections (port 22)**

Both GitHub Actions and Jenkins need to SSH into your EC2 instance to deploy, but the Security Group firewall is blocking them.

---

## 🔧 Quick Fix (5 Minutes)

### Step 1: Fix AWS Security Group

1. **Open AWS Console**
   - Go to: https://console.aws.amazon.com/ec2/
   - Click **Instances** → Select your instance
   - Click **Security** tab
   - Click the **Security Group** link

2. **Edit Inbound Rules**
   - Click **Edit inbound rules**
   - Click **Add rule**

3. **Add SSH Rule**
   - Type: **SSH**
   - Protocol: **TCP**
   - Port: **22**
   - Source: **0.0.0.0/0** (Anywhere IPv4)
   - Description: **SSH for GitHub Actions and Jenkins**
   - Click **Save rules**

### Step 2: Verify Other Required Ports

Make sure these rules also exist:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |
| Custom TCP | 27017 | My IP | MongoDB Compass (optional) |

### Step 3: Test Connection

Run this script:
```cmd
deploy\test-ec2-connection.bat
```

If all tests pass, you're good to go!

### Step 4: Re-run Deployments

**GitHub Actions:**
1. Go to your repo → **Actions** tab
2. Click the failed workflow
3. Click **Re-run all jobs**

**Jenkins:**
1. Go to your Jenkins job
2. Click **Build Now**

---

## 📋 Detailed Troubleshooting

### Issue: "dial tcp ***:22: i/o timeout"

**Cause**: Security Group blocking SSH

**Solution**: Add SSH rule (see Quick Fix above)

**Verify**:
```cmd
# Test SSH manually
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Test port 22
powershell Test-NetConnection -ComputerName YOUR_EC2_IP -Port 22
```

### Issue: "Permission denied (publickey)"

**Cause**: Wrong SSH key in GitHub Secrets or Jenkins credentials

**Solution for GitHub Actions**:
1. Go to: Repository → Settings → Secrets → Actions
2. Update `EC2_SSH_KEY` with your entire .pem file content:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   [all the lines]
   -----END RSA PRIVATE KEY-----
   ```

**Solution for Jenkins**:
1. Go to: Manage Jenkins → Credentials
2. Update `ec2-ssh-key` credential
3. Make sure you paste the ENTIRE .pem file

### Issue: "Host key verification failed"

**Cause**: SSH fingerprint not accepted

**Solution**: SSH to EC2 manually once:
```cmd
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
# Type "yes" when prompted
exit
```

### Issue: "docker: command not found" on EC2

**Cause**: Docker not installed on EC2

**Solution**: Run setup script on EC2:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/deploy/setup-ec2.sh
chmod +x setup.sh
./setup.sh
```

### Issue: "docker compose: command not found"

**Cause**: Old Docker version

**Solution**: Update Docker on EC2:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
sudo apt-get update
sudo apt-get install -y docker-compose-plugin
```

### Issue: EC2 IP Changed

**Cause**: EC2 was stopped/started (public IP changes)

**Solution**: 
1. Get new IP from AWS Console
2. Update GitHub Secrets:
   - `EC2_HOST` = new IP
   - `VITE_API_URL` = `http://NEW_IP:5000/api`
3. Update Jenkins environment variables:
   - `EC2_HOST` = new IP
   - `VITE_API_URL` = `http://NEW_IP:5000/api`
4. Update `.env` on EC2:
   ```bash
   ssh -i your-key.pem ubuntu@NEW_IP
   cd /home/ubuntu/flowgrid
   nano .env
   # Update CORS_ORIGIN=http://NEW_IP
   docker compose restart
   ```

### Issue: "No space left on device"

**Cause**: EC2 disk full

**Solution**: Clean up Docker:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
docker system prune -af --volumes
```

### Issue: Containers not starting

**Cause**: Various (check logs)

**Solution**: Check logs:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs -f
```

Common fixes:
- Missing .env file: Copy from .env.production
- Wrong MongoDB password: Update in .env
- Port already in use: Stop conflicting service

---

## 🧪 Diagnostic Tools

### Tool 1: Test EC2 Connection
```cmd
deploy\test-ec2-connection.bat
```
Tests network, SSH port, and SSH connection.

### Tool 2: Test Jenkins Connection
```cmd
jenkins\test-jenkins-connection.bat
```
Tests Jenkins-specific SSH setup.

### Tool 3: Manual SSH Test
```cmd
ssh -v -i your-key.pem ubuntu@YOUR_EC2_IP
```
Verbose output shows where connection fails.

### Tool 4: Check Security Group
```bash
aws ec2 describe-security-groups --group-ids YOUR_SG_ID
```
Shows all inbound/outbound rules.

### Tool 5: Check EC2 Status
```bash
aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID
```
Shows instance state, IP, security groups.

---

## ✅ Verification Checklist

After fixing, verify everything works:

### GitHub Actions
- [ ] Go to Actions tab
- [ ] Re-run failed workflow
- [ ] All stages pass (green checkmarks)
- [ ] "Deploy to EC2" stage succeeds
- [ ] Frontend accessible at `http://YOUR_EC2_IP`
- [ ] Backend accessible at `http://YOUR_EC2_IP:5000/health`

### Jenkins
- [ ] Go to Jenkins job
- [ ] Click "Build Now"
- [ ] All stages pass
- [ ] "Deploy to EC2" stage succeeds
- [ ] Console output shows successful deployment
- [ ] No errors in logs

### EC2 Containers
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose ps
```
- [ ] 3 containers running
- [ ] All show "healthy" status
- [ ] No "restarting" containers

### Application
- [ ] Frontend loads: `http://YOUR_EC2_IP`
- [ ] Backend responds: `http://YOUR_EC2_IP:5000/health`
- [ ] Can register/login
- [ ] All features work

### MongoDB
- [ ] Can connect with Compass (if port 27017 open)
- [ ] Database `flowgrid` exists
- [ ] Collections exist: users, products, orders, customers, inventory

---

## 🔒 Security Best Practices

### After Deployment Works

1. **Restrict SSH Access** (Optional but recommended)
   - Instead of 0.0.0.0/0, use specific IPs if possible
   - Or use AWS Systems Manager Session Manager

2. **Close MongoDB Port**
   - Remove port 27017 from Security Group
   - Use SSH tunnel for MongoDB Compass:
     ```cmd
     ssh -i your-key.pem -L 27017:localhost:27017 ubuntu@YOUR_EC2_IP
     ```

3. **Enable HTTPS**
   - Install Let's Encrypt SSL certificate
   - Update Security Group to allow port 443
   - Configure nginx for HTTPS

4. **Use Elastic IP**
   - Prevents IP from changing when EC2 stops/starts
   - Update DNS to point to Elastic IP

5. **Enable CloudWatch Monitoring**
   - Monitor CPU, memory, disk usage
   - Set up alarms for issues

6. **Automated Backups**
   - Set up MongoDB backups
   - Store in S3
   - Test restore process

---

## 📞 Getting Help

### Documentation
- **Security Group Fix**: `deploy/fix-security-group.md`
- **Jenkins Setup**: `jenkins/WINDOWS_SETUP.md`
- **Deployment Guide**: `deploy/README.md`

### Test Scripts
- **EC2 Connection**: `deploy/test-ec2-connection.bat`
- **Jenkins Connection**: `jenkins/test-jenkins-connection.bat`

### Useful Commands

**View GitHub Actions logs**:
- Go to: Repository → Actions → Click workflow → Click job

**View Jenkins logs**:
- Go to: Jenkins job → Click build number → Console Output

**View EC2 logs**:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs -f [service]
```

**Check container status**:
```bash
docker compose ps
docker compose top
```

**Restart services**:
```bash
docker compose restart
# or
docker compose down && docker compose up -d
```

---

## 🎯 Summary

**Problem**: SSH timeout (port 22 blocked)

**Solution**: Add SSH rule to AWS Security Group

**Steps**:
1. AWS Console → EC2 → Security Groups
2. Edit inbound rules
3. Add SSH rule (port 22, source 0.0.0.0/0)
4. Save rules
5. Re-run deployments

**Time**: 5 minutes

**Result**: Both GitHub Actions and Jenkins will deploy successfully! 🎉

---

**Last Updated**: December 28, 2024
