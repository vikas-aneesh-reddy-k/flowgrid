#!/bin/bash

#############################################
# GitHub Secrets Setup Helper
# This script helps you prepare the values
# needed for GitHub secrets
#############################################

echo "============================================"
echo "GitHub Secrets Setup Helper"
echo "============================================"
echo ""
echo "This script will help you gather the information"
echo "needed to set up GitHub secrets for CI/CD."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section
print_section() {
    echo ""
    echo "============================================"
    echo "$1"
    echo "============================================"
}

# 1. AWS_EC2_HOST
print_section "1. AWS_EC2_HOST"
echo "This is your EC2 instance's public IP address."
echo ""
echo "To find it:"
echo "  1. Go to AWS EC2 Console"
echo "  2. Select your instance"
echo "  3. Copy the 'Public IPv4 address'"
echo ""
read -p "Enter your EC2 Public IP: " EC2_HOST

if [ -z "$EC2_HOST" ]; then
    echo "⚠️  Warning: EC2 host is empty"
else
    echo "✅ AWS_EC2_HOST: $EC2_HOST"
fi

# 2. AWS_EC2_USER
print_section "2. AWS_EC2_USER"
echo "This is the SSH username for your EC2 instance."
echo "  - Ubuntu instances: ubuntu"
echo "  - Amazon Linux: ec2-user"
echo ""
read -p "Enter SSH username [ubuntu]: " EC2_USER
EC2_USER=${EC2_USER:-ubuntu}
echo "✅ AWS_EC2_USER: $EC2_USER"

# 3. AWS_SSH_KEY
print_section "3. AWS_SSH_KEY"
echo "This is your private SSH key (.pem file)."
echo ""
read -p "Enter the path to your .pem file [./flowgrid-key.pem]: " PEM_FILE
PEM_FILE=${PEM_FILE:-./flowgrid-key.pem}

if [ -f "$PEM_FILE" ]; then
    echo "✅ Found SSH key file: $PEM_FILE"
    echo ""
    echo "SSH Key content (copy this to GitHub secret AWS_SSH_KEY):"
    echo "-----------------------------------------------------------"
    cat "$PEM_FILE"
    echo "-----------------------------------------------------------"
else
    echo "❌ Error: SSH key file not found: $PEM_FILE"
    echo "Please make sure the .pem file exists in the specified location."
fi

# 4. MONGODB_URI
print_section "4. MONGODB_URI"
echo "Choose your MongoDB setup:"
echo "  1. Local MongoDB on EC2 (Recommended)"
echo "  2. MongoDB Atlas (Cloud)"
echo "  3. Custom MongoDB URI"
echo ""
read -p "Enter your choice [1]: " MONGO_CHOICE
MONGO_CHOICE=${MONGO_CHOICE:-1}

case $MONGO_CHOICE in
    1)
        MONGODB_URI="mongodb://localhost:27017/flowgrid"
        echo "✅ MONGODB_URI: $MONGODB_URI"
        ;;
    2)
        echo ""
        echo "Enter your MongoDB Atlas connection string:"
        echo "Example: mongodb+srv://username:password@cluster.mongodb.net/flowgrid"
        read -p "MongoDB Atlas URI: " MONGODB_URI
        echo "✅ MONGODB_URI: $MONGODB_URI"
        ;;
    3)
        echo ""
        read -p "Enter custom MongoDB URI: " MONGODB_URI
        echo "✅ MONGODB_URI: $MONGODB_URI"
        ;;
    *)
        MONGODB_URI="mongodb://localhost:27017/flowgrid"
        echo "✅ MONGODB_URI: $MONGODB_URI (default)"
        ;;
esac

# Summary
print_section "SUMMARY - Add these to GitHub Secrets"
echo ""
echo "Go to: GitHub → Settings → Secrets and variables → Actions"
echo "Click 'New repository secret' for each:"
echo ""
echo "1. Secret name: AWS_EC2_HOST"
echo "   Value: $EC2_HOST"
echo ""
echo "2. Secret name: AWS_EC2_USER"
echo "   Value: $EC2_USER"
echo ""
echo "3. Secret name: AWS_SSH_KEY"
echo "   Value: [Copy the SSH key content shown above]"
echo ""
echo "4. Secret name: MONGODB_URI"
echo "   Value: $MONGODB_URI"
echo ""

# Save to file
print_section "Saving Configuration"
CONFIG_FILE=".github-secrets-config.txt"
cat > "$CONFIG_FILE" << EOF
# GitHub Secrets Configuration
# Generated: $(date)
# DO NOT COMMIT THIS FILE TO GIT!

AWS_EC2_HOST=$EC2_HOST
AWS_EC2_USER=$EC2_USER
MONGODB_URI=$MONGODB_URI

# AWS_SSH_KEY: See the SSH key content above
# Copy the entire content of $PEM_FILE including:
# -----BEGIN RSA PRIVATE KEY-----
# [key content]
# -----END RSA PRIVATE KEY-----
EOF

echo "✅ Configuration saved to: $CONFIG_FILE"
echo "⚠️  IMPORTANT: Do NOT commit this file to Git!"
echo ""

# Add to .gitignore
if ! grep -q ".github-secrets-config.txt" .gitignore 2>/dev/null; then
    echo ".github-secrets-config.txt" >> .gitignore
    echo "✅ Added $CONFIG_FILE to .gitignore"
fi

# Test SSH connection
print_section "Testing SSH Connection"
echo "Would you like to test the SSH connection to your EC2 instance?"
read -p "Test connection? (y/n) [n]: " TEST_SSH
TEST_SSH=${TEST_SSH:-n}

if [ "$TEST_SSH" = "y" ] || [ "$TEST_SSH" = "Y" ]; then
    if [ -f "$PEM_FILE" ]; then
        echo ""
        echo "Testing SSH connection..."
        chmod 400 "$PEM_FILE"
        ssh -i "$PEM_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo '✅ SSH connection successful!'" 2>&1
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SSH connection test passed!"
        else
            echo ""
            echo "❌ SSH connection test failed!"
            echo "Please verify:"
            echo "  - EC2 instance is running"
            echo "  - Security group allows SSH (port 22)"
            echo "  - SSH key is correct"
            echo "  - EC2 IP address is correct"
        fi
    else
        echo "❌ Cannot test: SSH key file not found"
    fi
fi

# Next steps
print_section "Next Steps"
echo ""
echo "1. Add all 4 secrets to GitHub:"
echo "   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "2. Run initial EC2 setup (first time only):"
echo "   ssh -i $PEM_FILE $EC2_USER@$EC2_HOST"
echo "   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   cd YOUR_REPO"
echo "   chmod +x deploy-complete.sh"
echo "   ./deploy-complete.sh"
echo ""
echo "3. Test deployment:"
echo "   git add ."
echo "   git commit -m 'Test CI/CD deployment'"
echo "   git push origin main"
echo ""
echo "4. Monitor deployment:"
echo "   Go to GitHub → Actions tab"
echo ""
echo "5. Access your application:"
echo "   http://$EC2_HOST"
echo ""
echo "============================================"
echo "Setup helper completed!"
echo "============================================"
