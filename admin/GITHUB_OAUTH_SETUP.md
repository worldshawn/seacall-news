# GitHub OAuth应用设置指南

本指南将帮助您设置GitHub OAuth应用，以便Decap CMS可以使用GitHub后端进行身份验证。

## 1. 创建GitHub OAuth应用

1. 登录到您的GitHub账户
2. 访问 https://github.com/settings/developers
3. 点击"New OAuth App"
4. 填写以下信息：
   - Application name: `seacall News CMS`
   - Homepage URL: `https://www.aiwai.net`
   - Authorization callback URL: `https://netlify-cms-oauth-dun.vercel.app/callback` (使用认证代理的回调URL)
5. 点击"Register application"
6. 记录下生成的`Client ID`和`Client Secret`

## 2. 配置Decap CMS

获取Client ID和Client Secret后，您需要将它们添加到Decap CMS配置中。

在`admin/config.yml`文件中更新以下配置：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news
  branch: main
  auth_endpoint: https://github.com/login/oauth/authorize
  # 使用您获得的Client ID替换下面的值
  app_id: Iv23lioSDAm106VwrrAz
  base_url: https://netlify-cms-oauth-dun.vercel.app  # 添加认证代理URL
```

**重要提示**：GitHub后端不直接在配置文件中存储Client Secret。Client Secret在OAuth流程中由GitHub处理，不会暴露在前端代码中。

## 3. 配置认证代理

您需要在认证代理部署平台（如Vercel）设置以下环境变量：
- `OAUTH_GITHUB_CLIENT_ID`: Iv23lioSDAm106VwrrAz
- `OAUTH_GITHUB_CLIENT_SECRET`: [您的Client Secret]

## 4. 处理认证

由于GitHub后端需要OAuth认证，您需要：

1. 在您的GitHub仓库中确保您有写权限
2. 对于生产环境，确保您的站点使用HTTPS

## 5. 本地开发

对于本地开发，您可以继续使用`local_backend: true`配置。

## 6. 注意事项

1. GitHub API有速率限制
2. 确保您的GitHub账户对仓库有写权限
3. 对于生产环境，建议使用HTTPS
4. 如果遇到CORS问题，可能需要配置代理

## 7. 故障排除

如果遇到问题，请检查：

1. 确认OAuth应用配置正确
2. 确认回调URL与认证代理URL匹配
3. 确认GitHub账户对仓库有适当的权限
4. 检查浏览器控制台是否有错误信息