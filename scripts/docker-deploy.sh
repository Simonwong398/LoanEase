#!/bin/bash

# 构建 Docker 镜像
docker build -t loanease .

# 保存镜像
docker save loanease > loanease.tar

# 上传到服务器
scp loanease.tar ec2-user@18.191.116.109:/opt/loanease

# 在服务器上部署
ssh ec2-user@18.191.116.109 << 'EOF'
    cd /opt/loanease
    docker load < loanease.tar
    docker-compose down
    docker-compose up -d
EOF 