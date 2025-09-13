# GitHub后端配置指南

本指南将帮助您配置Decap CMS使用GitHub后端，而无需依赖Netlify。

## 1. 创建GitHub OAuth应用

1. 登录到您的GitHub账户
2. 访问 https://github.com/settings/developers
3. 点击"New OAuth App"
4. 填写以下信息：
   - Application name: `seacall News CMS`
   - Homepage URL: `https://news.aiwai.net`
   - Authorization callback URL: `https://netlify-cms-oauth-dun.vercel.app/callback` (使用认证代理的回调URL)
5. 点击"Register application"
6. 记录下生成的`Client ID`和`Client Secret`

## 2. 更新Decap CMS配置

将`admin/config-github.yml`文件重命名为`config.yml`，并更新以下内容：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news  # 替换为您的GitHub仓库
  branch: main
  auth_endpoint: https://github.com/login/oauth/authorize
  api_root: https://api.github.com
  app_id: Iv23lioSDAm106VwrrAz  # 添加Client ID
  base_url: https://netlify-cms-oauth-dun.vercel.app  # 添加认证代理URL
```

## 3. 配置认证代理

您需要在认证代理部署平台（如Vercel）设置以下环境变量：
- `OAUTH_GITHUB_CLIENT_ID`: Iv23lioSDAm106VwrrAz
- `OAUTH_GITHUB_CLIENT_SECRET`: [您的Client Secret]

## 4. 更新HTML配置

在`admin/index.html`中更新CMS初始化配置：

```html
<script>
  // 在admin/index.html中添加
  CMS.init({
    config: {
      backend: {
        name: 'github',
        repo: 'worldshawn/seacall-news',
        branch: 'main',
        auth_endpoint: 'https://github.com/login/oauth/authorize',
        base_url: 'https://netlify-cms-oauth-dun.vercel.app'  // 添加认证代理URL
      }
    }
  });
</script>
```

## 5. 本地开发

对于本地开发，您可以继续使用`local_backend: true`配置。

## 6. 注意事项

1. GitHub API有速率限制
2. 确保您的GitHub账户对仓库有写权限
3. 对于生产环境，建议使用HTTPS
4. 如果遇到CORS问题，可能需要配置代理

## 7. 替代方案

如果GitHub后端配置复杂，您也可以考虑：

1. 继续使用Netlify（免费方案通常足够）
2. 使用其他支持的后端（GitLab、Bitbucket）
3. 自托管Git Gateway