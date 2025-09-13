# 认证代理部署指南

本指南将帮助您部署GitHub OAuth认证代理，以支持Decap CMS的GitHub后端。

## 推荐的认证代理项目

### 1. njfamirm/decap-cms-github-backend
- GitHub仓库：https://github.com/njfamirm/decap-cms-github-backend
- 特点：专门为Decap CMS设计，支持Docker部署

### 2. ublabs/netlify-cms-oauth
- GitHub仓库：https://github.com/ublabs/netlify-cms-oauth
- 特点：可在Vercel上轻松部署

### 3. decap-cms-oauth-provider (Python版本)
- GitHub仓库：https://github.com/davidejones/netlify-cms-oauth-provider-python
- 特点：Python实现，可在多种平台上部署

## 部署选项

### 选项1：Vercel部署（推荐）

#### 1. 使用ublabs/netlify-cms-oauth项目
1. Fork仓库：https://github.com/ublabs/netlify-cms-oauth
2. 在Vercel上导入项目
3. 设置环境变量：
   - `OAUTH_GITHUB_CLIENT_ID`: 您的GitHub OAuth App Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET`: 您的GitHub OAuth App Client Secret

#### 2. 获取部署URL
部署完成后，Vercel会提供一个URL，如：`https://your-auth-proxy.vercel.app`

### 选项2：使用Docker部署njfamirm/decap-cms-github-backend

#### 1. 拉取Docker镜像
```bash
docker pull ghcr.io/njfamirm/decap-cms-github-backend:main
```

#### 2. 运行容器
```bash
docker run -d \
  -p 3000:3000 \
  -e OAUTH_GITHUB_CLIENT_ID=your_client_id \
  -e OAUTH_GITHUB_CLIENT_SECRET=your_client_secret \
  --name auth-proxy \
  ghcr.io/njfamirm/decap-cms-github-backend:main
```

### 选项3：Netlify部署

#### 1. 准备项目
您可以使用ublabs/netlify-cms-oauth项目：
1. Fork仓库：https://github.com/ublabs/netlify-cms-oauth
2. 在Netlify上导入项目

#### 2. 设置环境变量
在Netlify项目设置中添加：
- `OAUTH_GITHUB_CLIENT_ID`: 您的GitHub OAuth App Client ID
- `OAUTH_GITHUB_CLIENT_SECRET`: 您的GitHub OAuth App Client Secret

### 选项4：直接部署到VPS

#### 1. 克隆项目并安装依赖
```bash
git clone https://github.com/ublabs/netlify-cms-oauth.git
cd netlify-cms-oauth
npm install
```

#### 2. 设置环境变量
```bash
export OAUTH_GITHUB_CLIENT_ID=your_client_id
export OAUTH_GITHUB_CLIENT_SECRET=your_client_secret
```

#### 3. 启动应用
```bash
npm start
```

## 配置Decap CMS

部署完成后，更新您的`admin/config.yml`：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news
  branch: main
  base_url: https://your-auth-proxy-url.com  # 您的认证代理URL
  app_id: Iv23lioSDAm106VwrrAz
```

## 环境变量说明

- `OAUTH_GITHUB_CLIENT_ID`: 您在GitHub上创建的OAuth App的Client ID
- `OAUTH_GITHUB_CLIENT_SECRET`: 您在GitHub上创建的OAuth App的Client Secret

## 故障排除

1. **认证失败**：
   - 检查环境变量是否正确设置
   - 确认GitHub OAuth App的回调URL与代理URL匹配

2. **CORS错误**：
   - 确保代理服务器正确设置了CORS头
   - 检查base_url是否正确配置

3. **网络连接问题**：
   - 确保代理服务器可以从公网访问
   - 检查防火墙设置