# GitHub后端完整认证配置指南

本指南将帮助您完成Decap CMS使用GitHub后端的完整配置。

## 重要说明

GitHub后端需要一个认证代理来安全处理OAuth流程，因为Client Secret不能直接暴露在前端代码中。

## 方案一：使用Netlify Identity（推荐简单方案）

如果您不介意使用Netlify的服务，这是最简单的方案：

1. 在Netlify上部署您的站点
2. 启用Netlify Identity服务
3. 使用git-gateway后端配置

## 方案二：自托管认证代理（推荐自主方案）

如果您希望完全自主控制，可以自托管认证代理：

### 1. 部署认证代理

您已经成功部署了认证代理到以下域名之一：
- netlify-cms-oauth-dun.vercel.app
- netlify-cms-oauth-git-main-momos-projects-c3fbbf41.vercel.app
- netlify-cms-oauth-q0d8xptho-momos-projects-c3fbbf41.vercel.app

使用的开源项目是：[ublabs/netlify-cms-oauth](https://github.com/ublabs/netlify-cms-oauth)

### 2. 配置认证代理

部署认证代理后，您需要：

1. 设置环境变量：
   - `OAUTH_GITHUB_CLIENT_ID`: 您的GitHub OAuth App Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET`: 您的GitHub OAuth App Client Secret

2. 更新Decap CMS配置：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news
  branch: main
  base_url: https://netlify-cms-oauth-dun.vercel.app  # 您的认证代理URL
```

## 方案三：使用现有的第三方认证服务

有一些第三方服务提供GitHub OAuth代理：

1. [https://github.com/ublabs/netlify-cms-oauth](https://github.com/ublabs/netlify-cms-oauth)

## 本地开发

对于本地开发，您可以继续使用：

```yaml
local_backend: true
```

这将允许您在本地编辑内容而无需认证。

## 当前配置状态

您的当前配置：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news
  branch: main
  site_domain: www.aiwai.net
  auth_endpoint: https://github.com/login/oauth/authorize
  app_id: Iv23lioSDAm106VwrrAz
  base_url: https://netlify-cms-oauth-dun.vercel.app  # 已添加认证代理URL
```

这个配置已经完整，包含了认证代理的设置。

## 推荐步骤

1. 确保在认证代理部署平台（如Vercel）正确设置了环境变量：
   - `OAUTH_GITHUB_CLIENT_ID`: Iv23lioSDAm106VwrrAz
   - `OAUTH_GITHUB_CLIENT_SECRET`: [您的Client Secret]

2. 测试Decap CMS的在线编辑功能

## 故障排除

如果遇到认证问题：

1. 确认GitHub OAuth App配置正确
2. 确认回调URL设置正确
3. 检查是否有CORS问题
4. 确认您有仓库的写权限