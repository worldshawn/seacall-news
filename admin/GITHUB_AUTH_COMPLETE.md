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

您可以使用以下开源项目之一：

1. [ublabs/netlify-cms-oauth](https://github.com/ublabs/netlify-cms-oauth) - 可在Vercel上轻松部署
2. [njfamirm/decap-cms-github-backend](https://github.com/njfamirm/decap-cms-github-backend) - 支持Docker部署
3. [davidejones/netlify-cms-oauth-provider-python](https://github.com/davidejones/netlify-cms-oauth-provider-python) - Python实现

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
  base_url: https://your-auth-proxy-url.com  # 您的认证代理URL
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
  site_domain: news.aiwai.net
  auth_endpoint: https://github.com/login/oauth/authorize
  app_id: Iv23lioSDAm106VwrrAz
```

这个配置还不完整，缺少认证代理的设置。

## 推荐步骤

1. 如果您希望简单快速上线，建议暂时使用`local_backend: true`进行内容管理
2. 如果您需要完整的在线编辑功能，建议：
   - 使用Netlify Identity方案（最简单）
   - 或者部署自己的认证代理（更自主）

## 故障排除

如果遇到认证问题：

1. 确认GitHub OAuth App配置正确
2. 确认回调URL设置正确
3. 检查是否有CORS问题
4. 确认您有仓库的写权限