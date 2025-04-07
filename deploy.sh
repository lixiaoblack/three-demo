#!/usr/bin/env sh
###
 # @Author: wanglx
 # @Date: 2025-04-02 18:37:19
 # @LastEditors: wanglx
 # @LastEditTime: 2025-04-02 18:49:26
 # @Description: 自动部署脚本
 # 
 # Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
### 

# 确保脚本抛出遇到的错误
set -e

# 构建
pnpm build-only

# 进入构建输出目录
cd dist

# 如果你要部署到自定义域名
# echo 'www.example.com' > CNAME

# 初始化 git 仓库
rm -rf .git
git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'

# 推送到 gh-pages 分支
git push -f git@github.com:lixiaoblack/three-demo.git gh-pages:gh-pages

cd - 