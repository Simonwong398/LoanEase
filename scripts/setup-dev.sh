#!/bin/bash
# 开发环境配置脚本

# 创建环境配置文件
cat > .env.development << EOL
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loanease_dev
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=your_jwt_secret_here
API_URL=http://localhost:3000
EOL

# 创建 Docker 开发环境
cat > docker-compose.dev.yml << EOL
version: '3.8'
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: loanease_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  pgdata:
EOL 