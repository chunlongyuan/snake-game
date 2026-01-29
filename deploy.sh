#!/bin/bash
set -e

# 进入构建文件夹
cd /home/clawdbot-user/clawd/snake-game

# 如果是一个新的 Git 仓库，初始化并设置远程仓库
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/Miqiao/snake-game.git
fi

# 配置 Git 用户信息
git config user.name "Miqiao"
git config user.email "miqiao.assistant@example.com"

# 添加所有文件
git add .

# 提交更改
git commit -m "Deploy Snake Game to GitHub Pages"

# 推送到 GitHub
git push -u origin main

echo "部署完成！"