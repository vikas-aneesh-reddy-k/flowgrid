#!/bin/bash

# Deployment Webhook Script for EC2
# This script will be run on your EC2 instance to handle deployments

# Create deployment script
cat > /home/ubuntu/flowgrid/deploy.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/flowgrid
echo "Pulling latest Docker images..."
docker compose pull
echo "Restarting services..."
docker compose up -d
echo "Deployment complete!"
docker compose ps
EOF

chmod +x /home/ubuntu/flowgrid/deploy.sh

# Install webhook listener (using webhook package)
sudo apt-get update
sudo apt-get install -y webhook

# Create webhook configuration
sudo mkdir -p /etc/webhook
sudo cat > /etc/webhook/hooks.json << 'EOF'
[
  {
    "id": "deploy-flowgrid",
    "execute-command": "/home/ubuntu/flowgrid/deploy.sh",
    "command-working-directory": "/home/ubuntu/flowgrid",
    "response-message": "Deployment triggered successfully",
    "trigger-rule": {
      "match": {
        "type": "value",
        "value": "deploy-secret-token-12345",
        "parameter": {
          "source": "header",
          "name": "X-Deploy-Token"
        }
      }
    }
  }
]
EOF

# Create systemd service for webhook
sudo cat > /etc/systemd/system/webhook.service << 'EOF'
[Unit]
Description=Webhook Service
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -port 9000 -verbose
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start webhook service
sudo systemctl daemon-reload
sudo systemctl enable webhook
sudo systemctl start webhook

echo "Webhook service installed and started on port 9000"
echo "Make sure to open port 9000 in your EC2 security group"
