#!/bin/bash

# ============================================================
# AWS EC2 Auto-Setup Script
# Real-Time Multi-Agent RL Recommendation Platform
# Run this on your EC2 instance after SSH login
# ============================================================

echo "=============================================="
echo " MTech RL Recommendation Platform - AWS Setup"
echo "=============================================="

# Step 1: Update system packages
echo "[1/7] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Step 2: Install Docker
echo "[2/7] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
echo "Docker installed: $(docker --version)"

# Step 3: Install Docker Compose
echo "[3/7] Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo "Docker Compose installed: $(docker-compose --version)"

# Step 4: Install Git
echo "[4/7] Installing Git..."
sudo apt-get install -y git

# Step 5: Clone or upload project
echo "[5/7] Setting up project directory..."
mkdir -p /home/ubuntu/mtech-project
cd /home/ubuntu/mtech-project

# Step 6: Set environment variables
echo "[6/7] Creating production .env file..."
cat > /home/ubuntu/mtech-project/backend/.env << EOF
PORT=5000
MONGO_URI=mongodb://mongodb:27017/mtech_rl_rec
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

echo ".env file created with secure random JWT_SECRET"

# Step 7: Start application
echo "[7/7] Starting application with Docker Compose..."
cd /home/ubuntu/mtech-project
sudo docker-compose up --build -d

echo ""
echo "=============================================="
echo " Setup Complete!"
echo " Your app is running at:"
echo " http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "=============================================="
