#!/bin/bash

# 部署配置
SERVER_HOST="18.191.116.109"
SERVER_USER="ec2-user"
DEPLOY_PATH="/opt/loanease"

echo "Starting deployment..."

# 步骤 1: 构建应用
echo "Building application..."
npm run build

# 步骤 2: 创建部署包
echo "Creating deployment package..."
tar -czf deploy.tar.gz dist/ package.json package-lock.json

# 步骤 3: 上传到服务器
echo "Uploading to server..."
scp deploy.tar.gz $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH

# 步骤 4: 在服务器上执行部署
echo "Deploying on server..."
ssh $SERVER_USER@$SERVER_HOST << EOF
    cd $DEPLOY_PATH
    tar -xzf deploy.tar.gz
    rm deploy.tar.gz
    npm install --production
    pm2 restart loanease || pm2 start dist/index.js --name loanease
EOF

echo "Deployment completed!" 