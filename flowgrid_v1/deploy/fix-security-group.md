# Fix AWS Security Group for GitHub Actions & Jenkins

## The Problem

Error: `dial tcp ***:22: i/o timeout`

This means your EC2 Security Group is blocking SSH connections from GitHub Actions and Jenkins.

## Quick Fix (5 minutes)

### Option 1: AWS Console (Easiest)

1. **Go to AWS Console**
   - Navigate to: https://console.aws.amazon.com/ec2/
   - Click **Instances** in the left sidebar
   - Select your FlowGrid EC2 instance

2. **Find Security Group**
   - Click the **Security** tab
   - Under "Security groups", click the security group link (e.g., `sg-xxxxx`)

3. **Edit Inbound Rules**
   - Click **Edit inbound rules** button
   - Click **Add rule** for each missing rule below

4. **Add These Rules**

   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | 0.0.0.0/0 | SSH from anywhere |
   | HTTP | TCP | 80 | 0.0.0.0/0 | Frontend access |
   | Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API |
   | Custom TCP | TCP | 27017 | My IP | MongoDB Compass (optional) |

5. **Save Rules**
   - Click **Save rules**
   - Wait 10 seconds for changes to apply

### Option 2: AWS CLI (Advanced)

If you have AWS CLI installed:

```bash
# Get your security group ID
aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId'

# Add SSH rule
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Add HTTP rule
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Add Backend API rule
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5000 \
    --cidr 0.0.0.0/0
```

## Verify the Fix

### Test 1: SSH from Your Computer
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```
Should connect successfully.

### Test 2: Test from GitHub Actions
1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Re-run all jobs** on the failed workflow
4. Watch it succeed!

### Test 3: Test from Jenkins
1. Go to your Jenkins job
2. Click **Build Now**
3. Watch the "Deploy to EC2" stage succeed

## Security Considerations

### ⚠️ SSH Open to World (0.0.0.0/0)

**Why it's needed:**
- GitHub Actions runs from different IPs each time
- Jenkins may run from different IPs
- No way to whitelist specific IPs

**How to secure it:**
1. Use strong SSH keys (you already do)
2. Disable password authentication (already done)
3. Keep your .pem file secure
4. Use AWS Systems Manager Session Manager as alternative
5. Consider using a bastion host for production

### 🔒 Better Security (Optional)

If you want better security, use **AWS Systems Manager Session Manager**:

1. **Install SSM Agent on EC2** (usually pre-installed on Ubuntu)
2. **Attach IAM Role** to EC2 with `AmazonSSMManagedInstanceCore` policy
3. **Remove SSH rule** from Security Group
4. **Connect via SSM**: `aws ssm start-session --target YOUR_INSTANCE_ID`

But this requires updating your deployment scripts.

## MongoDB Security

For MongoDB (port 27017):

### Development
- Source: **My IP** (your current IP only)
- This allows MongoDB Compass from your computer

### Production
- **Remove port 27017** from Security Group entirely
- Access MongoDB only from within EC2 or via SSH tunnel:
  ```bash
  ssh -i your-key.pem -L 27017:localhost:27017 ubuntu@YOUR_EC2_IP
  ```

## Troubleshooting

### Still getting timeout?

1. **Check Security Group is attached to instance**
   ```bash
   aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID \
       --query 'Reservations[0].Instances[0].SecurityGroups'
   ```

2. **Check Network ACLs** (rarely the issue)
   - Go to VPC → Network ACLs
   - Ensure inbound/outbound rules allow traffic

3. **Check EC2 is running**
   ```bash
   aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID \
       --query 'Reservations[0].Instances[0].State.Name'
   ```
   Should return: `running`

4. **Check SSH service on EC2**
   - If you can access via AWS Console → Connect → Session Manager:
     ```bash
     sudo systemctl status ssh
     ```

### GitHub Actions still failing?

1. **Verify GitHub Secrets are set**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Check these exist:
     - `EC2_HOST` (your EC2 public IP)
     - `EC2_USERNAME` (should be `ubuntu`)
     - `EC2_SSH_KEY` (entire .pem file content)
     - `DOCKER_USERNAME`
     - `DOCKER_PASSWORD`
     - `VITE_API_URL`

2. **Check EC2_HOST is correct**
   - Get current public IP:
     ```bash
     aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID \
         --query 'Reservations[0].Instances[0].PublicIpAddress'
     ```
   - Update GitHub secret if IP changed

3. **Check SSH key format**
   - Must include BEGIN/END lines:
     ```
     -----BEGIN RSA PRIVATE KEY-----
     [key content]
     -----END RSA PRIVATE KEY-----
     ```

### Jenkins still failing?

1. **Check Jenkins credentials**
   - Go to: Manage Jenkins → Credentials
   - Verify `ec2-ssh-key` exists and has correct .pem content

2. **Check Jenkins environment variables**
   - Go to: Manage Jenkins → System → Global properties
   - Verify:
     - `EC2_HOST` = Your EC2 IP
     - `EC2_USERNAME` = `ubuntu`

3. **Test SSH from Jenkins server**
   ```cmd
   ssh -i path\to\your-key.pem ubuntu@YOUR_EC2_IP
   ```

## After Fixing

Once Security Group is fixed:

1. **Re-run GitHub Actions**
   - Go to Actions tab
   - Click failed workflow
   - Click "Re-run all jobs"

2. **Re-run Jenkins**
   - Go to your Jenkins job
   - Click "Build Now"

Both should now succeed! 🎉

## Summary

**Root Cause**: AWS Security Group blocking SSH (port 22)

**Solution**: Add inbound rule for SSH from 0.0.0.0/0

**Time to Fix**: 2 minutes

**After Fix**: Both GitHub Actions and Jenkins will deploy successfully

---

**Need Help?**
- AWS Security Groups: https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html
- GitHub Actions SSH: https://github.com/appleboy/ssh-action
