# AWS EC2 Deployment Guide
# Real-Time Multi-Agent RL Recommendation Platform

## Prerequisites
- AWS Account (free tier — https://aws.amazon.com/free)
- Your project zip file

---

## STEP 1 — Create EC2 Instance

1. Login to AWS Console → go to EC2 → Launch Instance
2. Choose:
   - Name: mtech-rl-server
   - OS: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - Instance type: t2.micro (Free Tier — 750 hrs/month free)
   - Key pair: Create new → name it "mtech-key" → Download .pem file
   - Security Group → Add rules:
     - SSH       | Port 22   | Source: My IP
     - HTTP      | Port 80   | Source: Anywhere
     - Custom    | Port 5000 | Source: Anywhere
     - Custom    | Port 3000 | Source: Anywhere
3. Click Launch Instance

---

## STEP 2 — Connect to EC2 via SSH

### On Windows (use PowerShell or Git Bash):
```bash
# Give permission to key file
icacls mtech-key.pem /inheritance:r /grant:r "%username%:R"

# Connect
ssh -i mtech-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### On Mac/Linux (use Terminal):
```bash
chmod 400 mtech-key.pem
ssh -i mtech-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## STEP 3 — Run Setup Script on EC2

Once connected via SSH, run:

```bash
# Download and run the auto-setup script
curl -o aws-setup.sh https://raw.githubusercontent.com/YOUR_REPO/main/deployment/aws/aws-setup.sh
chmod +x aws-setup.sh
./aws-setup.sh
```

OR manually run these commands:

```bash
# Update packages
sudo apt-get update -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

---

## STEP 4 — Upload Project to EC2

### Option A — Using SCP (from your laptop):
```bash
# Upload the zip file to EC2
scp -i mtech-key.pem mtech-rl-project.zip ubuntu@YOUR_EC2_IP:/home/ubuntu/

# SSH into EC2
ssh -i mtech-key.pem ubuntu@YOUR_EC2_IP

# Unzip
sudo apt-get install unzip -y
unzip mtech-rl-project.zip
cd mtech-project
```

### Option B — Using Git:
```bash
# On EC2
sudo apt-get install git -y
git clone https://github.com/YOUR_USERNAME/mtech-project.git
cd mtech-project
```

---

## STEP 5 — Configure Environment

```bash
# Create .env file
cd backend
cp .env.example .env
nano .env

# Update these values:
# MONGO_URI=mongodb://mongodb:27017/mtech_rl_rec
# JWT_SECRET=paste-a-long-random-string-here
# ALLOWED_ORIGINS=http://YOUR_EC2_PUBLIC_IP
# NODE_ENV=production
```

To generate a secure JWT secret:
```bash
openssl rand -hex 32
```

---

## STEP 6 — Deploy with Docker Compose

```bash
cd /home/ubuntu/mtech-project

# Build and start all containers
docker-compose up --build -d

# Check all containers are running
docker-compose ps

# Seed the database
docker exec mtech_backend node scripts/seed.js

# Check logs
docker-compose logs -f
```

---

## STEP 7 — Access Your Live App

Open your browser and go to:
```
http://YOUR_EC2_PUBLIC_IP
```

Login with:
- Admin: admin@mtech.edu / admin123
- Student: student@mtech.edu / student123

---

## Useful Commands After Deployment

```bash
# View running containers
docker-compose ps

# View backend logs
docker-compose logs backend -f

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Update and redeploy
git pull
docker-compose up --build -d
```

---

## Security Group Settings Summary

| Type     | Port | Source    | Purpose              |
|----------|------|-----------|----------------------|
| SSH      | 22   | My IP     | Server management    |
| HTTP     | 80   | 0.0.0.0/0 | Web app access       |
| Custom   | 5000 | 0.0.0.0/0 | Backend API          |
| Custom   | 3000 | 0.0.0.0/0 | React dev (optional) |

---

## Free Tier Limits (12 months)

| Resource       | Free Limit          |
|----------------|---------------------|
| EC2 t2.micro   | 750 hours/month     |
| EBS Storage    | 30 GB               |
| Data Transfer  | 15 GB/month         |
| Elastic IP     | 1 free (when in use)|

---

## Cost After Free Tier

| Resource    | Approx Cost       |
|-------------|-------------------|
| t2.micro    | ~$8.50/month      |
| Storage     | ~$2.40/month      |
| Total       | ~$11/month        |
