#!/usr/bin/env sh
###
 # @Author: wanglx
 # @Date: 2025-04-02 18:37:19
 # @LastEditors: wanglx
 # @LastEditTime: 2025-04-02 18:44:59
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

git init
git add -A
git commit -m 'deploy'

# 部署到 GitHub Pages
git push -f git@github.com:lixiaoblack/three-demo.git main:gh-pages

cd - 