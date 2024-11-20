#!/bin/bash
# 项目初始化脚本

# 创建目录结构
mkdir -p src/{components,services,utils,config,models,routes,middleware,types}
mkdir -p tests/{unit,integration,e2e}
mkdir -p docs/{api,deployment,database}
mkdir -p scripts
mkdir -p .github/{workflows,ISSUE_TEMPLATE}

# 安装依赖
npm install

# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 设置 Git 配置
git config --local core.autocrlf true
git config --local core.safecrlf true
git config --local core.filemode false 