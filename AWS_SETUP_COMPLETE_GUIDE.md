# 🚀 AWS Account & EC2 Setup - Complete Guide

## Part 1: Create AWS Account (10 minutes)

### Step 1: Go to AWS Website
1. Open browser: https://aws.amazon.com
2. Click **"Create an AWS Account"** (orange button, top right)

### Step 2: Enter Account Details
**Page 1 - Root user email:**
- Email address: your-email@example.com
- AWS account name: FlowGridERP (or any name)
- Click **"Verify email address"**
- Check your email for verification code
- Enter the code

**Page 2 - Password:**
- Create a strong password
- Confirm password
- Click **"Continue"**

**Page 3 - Contact Information:**
- Account type: **Personal** (or Business if you prefer)
- Full name: Your Name
- Phone number: +1-XXX-XXX-XXXX
- Country: Your Country
- Address: Your Address
- City, State, Postal Code
- Click **"Continue"**

**Page 4 - Payment Information:**
- Enter credit/debit card details
- AWS will charge $1 for verification (refunded immediately)
- Billing address (same as above)
- Click **"Verify and Continue"**

**Page 5 - Identity Verification:**
- Choose verification method: **Text message (SMS)** or **Voice call**
- Enter phone number
- Enter security check code
- You'll receive a 4-digit code
- Enter the code
- Click **"Continue"**

**Page 6 - Select Support Plan:**
- Choose **"Basic support - Free"**
- Click **"Complete sign up"**

### Step 3: Wait for Account Activation
- You'll see: "Congratulations! Your account is being activated"
- This takes 5-10 minutes
- You'll receive email when ready
- Click **"Go to the AWS Management Console"**

---

## Part 2: Launch EC2 Instance (15 minutes)

### Step 1: Sign in to AWS Console
1. Go to: https://console.aws.amazon.com
2. Sign in with your email and password
3. You'll see the AWS Management Console dashboard

### Step 2: Navigate to EC2
1. In the search bar at top, type: **EC2**
2. Click **"EC2"** (Virtual Servers in the Cloud)
3. You'll see the EC2 Dashboard

### Step 3: Launch Instance
1. Click orange button: **"Launch instance"**
2. You'll see "Launch an instance" page

### Step 4: Configure Instance

**Name and tags:**
- Name: `flowgrid-production`

**Application and OS Images (Amazon Machine Image):**
- Click **"Quick Start"** tab
- Select: **Ubuntu**
- Amazon Machine Image (AMI): **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Architecture: **64-bit (x86)**
- ✅ Make sure it says "Free tier eligible"

**Instance type:**
- Select: **t2.micro**
- ✅ Make sure it says "Free tier eligible"
- (1 vCPU, 1 GiB Memory)

**Key pair (login):**
- Click **"Create new key pair"**
- Key pair name: `flowgrid-key`
- Key pair type: **RSA**
- Private key file format: **`.pem`** (for Mac/Linux) or **`.ppk`** (for Windows PuTTY)
- Click **"Create key pair"**
- ⚠️ **IMPORTANT:** File will download automatically - SAVE IT SAFELY!
- You'll need this file to connect to your server

**Network settings:**
- Click **"Edit"** button
- Auto-assign public IP: **Enable**
- Firewall (security groups): **Create security group**
- Security group name: `flowgrid-security-group`
- Description: `Security group for FlowGrid ERP`

**Add these rules (click "Add security group rule" for each):**

| Type | Protocol | Port Range | Source Type | Source | Description |
|------|----------|------------|-------------|--------|-------------|
| SSH | TCP | 22 | My IP | (auto-filled) | SSH access |
| HTTP | TCP | 80 | Anywhere | 0.0.0.0/0 | Web access |
| HTTPS | TCP | 443 | Anywhere | 0.0.0.0/0 | Secure web |
| Custom TCP | TCP | 8080 | My IP | (auto-filled) | Jenkins |
| Custom TCP | TCP | 5000 | My IP | (auto-filled) | Backend API |

**Configure storage:**
- Size: **30 GiB** (Free tier allows up to 30 GB)
- Volume type: **gp3** (General Purpose SSD)
- ✅ Free tier eligible

**Advanced details:**
- Leave everything as default

### Step 5: Review and Launch
1. On the right side, see **"Summary"** panel
2. Number of instances: **1**
3. Click orange button: **"Launch instance"**
4. You'll see: "Successfully initiated launch of instance"
5. Click **"View all instances"**

### Step 6: Wait for Instance to Start
1. You'll see your instance in the list
2. Instance State: **Pending** → wait 1-2 minutes → **Running** ✅
3. Status check: **Initializing** → wait 2-3 minutes → **2/2 checks passed** ✅

### Step 7: Get Instance Details
1. Click on your instance (checkbox)
2. In the details panel below, note these:
   - **Public IPv4 address**: (e.g., 54.123.45.67) ← You'll need this!
   - **Instance ID**: (e.g., i-0123456789abcdef)
   - **Instance state**: Running

---

## Part 3: Connect to Your EC2 Instance

### For Windows Users:

**Option A: Using PowerShell (Recommended)**
```powershell
# Navigate to where you saved the .pem file
cd C:\Users\YourName\Downloads

# Set permissions (if needed)
icacls flowgrid-key.pem /inheritance:r
icacls flowgrid-key.pem /grant:r "%username%:R"

# Connect
ssh -i flowgrid-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

**Option B: Using PuTTY**
1. Download PuTTY: https://www.putty.org/
2. Convert .pem to .ppk using PuTTYgen
3. Open PuTTY
4. Host Name: ubuntu@YOUR-EC2-PUBLIC-IP
5. Connection → SSH → Auth → Browse for .ppk file
6. Click Open

### For Mac/Linux Users:
```bash
# Navigate to where you saved the .pem file
cd ~/Downloads

# Set permissions
chmod 400 flowgrid-key.pem

# Connect
ssh -i flowgrid-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

### First Connection:
- You'll see: "Are you sure you want to continue connecting?"
- Type: **yes**
- Press Enter
- You're now connected! You'll see: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

---

## Part 4: Install Software on EC2 (10 minutes)

Copy and paste these commands one by one:

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```
(Takes 2-3 minutes)

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

### 3. Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Install Java (for Jenkins)
```bash
sudo apt install -y openjdk-17-jdk
```

### 5. Install Jenkins
```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins
```

### 6. Start Jenkins
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### 7. Get Jenkins Password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
**⚠️ COPY THIS PASSWORD!** You'll need it in the next step.

### 8. Verify Everything
```bash
docker --version
docker-compose --version
java -version
sudo systemctl status jenkins
```

All should show version numbers and Jenkins should be "active (running)"

### 9. Logout and Login Again
```bash
exit
```
Then reconnect (to apply docker group):
```bash
ssh -i flowgrid-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

### 10. Test Docker
```bash
docker ps
```
Should show empty list (no error)

---

## Part 5: Access Jenkins (5 minutes)

### Step 1: Open Jenkins in Browser
1. Open browser
2. Go to: `http://YOUR-EC2-PUBLIC-IP:8080`
3. You should see Jenkins "Unlock Jenkins" page

### Step 2: Unlock Jenkins
1. Paste the password you copied earlier
2. Click **"Continue"**

### Step 3: Install Plugins
1. Click **"Install suggested plugins"**
2. Wait 3-5 minutes for installation
3. You'll see progress bars

### Step 4: Create Admin User
1. Username: `admin`
2. Password: (create a strong password)
3. Confirm password
4. Full name: `Admin`
5. Email: your-email@example.com
6. Click **"Save and Continue"**

### Step 5: Instance Configuration
1. Jenkins URL: `http://YOUR-EC2-PUBLIC-IP:8080/`
2. Click **"Save and Finish"**
3. Click **"Start using Jenkins"**

### Step 6: Install Additional Plugins
1. Click **"Manage Jenkins"** (left sidebar)
2. Click **"Plugins"**
3. Click **"Available plugins"** tab
4. Search and install these (check the box, then click "Install"):
   - Docker Pipeline
   - SSH Agent
   - GitHub Integration
   - HTML Publisher

5. Check **"Restart Jenkins when installation is complete"**
6. Wait 2-3 minutes for restart

---

## ✅ YOU'RE DONE WITH AWS SETUP!

### What You Have Now:
- ✅ AWS Account created
- ✅ EC2 t2.micro instance running
- ✅ Docker installed
- ✅ Docker Compose installed
- ✅ Jenkins installed and running
- ✅ Jenkins accessible at: `http://YOUR-EC2-PUBLIC-IP:8080`

### Save These Details:
```
EC2 Public IP: ___________________
Jenkins URL: http://___________________:8080
Jenkins Admin Password: ___________________
SSH Key Location: ___________________
```

---

## 🎯 NEXT STEPS:

Now go back to your local computer and follow:
**EXECUTE_NOW.md** - Section "Step 5: Configure Jenkins"

You'll add credentials and create the pipeline!

---

## 💰 Cost Reminder:
- **FREE** for 12 months (750 hours/month)
- After 12 months: ~$8-10/month
- To avoid charges: Stop instance when not using (don't terminate!)

---

## 🆘 Troubleshooting:

**Can't connect via SSH?**
- Check security group allows port 22 from your IP
- Verify you're using correct .pem file
- Check instance is "Running"

**Can't access Jenkins (port 8080)?**
- Check security group allows port 8080 from your IP
- Verify Jenkins is running: `sudo systemctl status jenkins`
- Wait 2-3 minutes after starting Jenkins

**Docker permission denied?**
- Logout and login again: `exit` then reconnect
- Or run: `newgrp docker`

---

**You're ready for the next step!** 🚀
