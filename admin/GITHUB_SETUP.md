# GitHub后端配置指南

本指南将帮助您配置Decap CMS使用GitHub后端，而无需依赖Netlify。

## 1. 创建GitHub OAuth应用

1. 登录到您的GitHub账户
2. 访问 https://github.com/settings/developers
3. 点击"New OAuth App"
4. 填写以下信息：
   - Application name: `seacall News CMS`
   - Homepage URL: `https://news.aiwai.net`
   - Authorization callback URL: `https://news.aiwai.net/admin/` (确保以斜杠结尾)
5. 点击"Register application"
6. 记录下生成的`Client ID`和`Client Secret`

## 2. 更新Decap CMS配置

将`admin/config-github.yml`文件重命名为`config.yml`，并更新以下内容：

```yaml
backend:
  name: github
  repo: your-username/seacall-news  # 替换为您的GitHub仓库
  branch: main
  auth_endpoint: https://github.com/login/oauth/authorize
  api_root: https://api.github.com
```

## 3. 配置认证

由于GitHub后端需要OAuth认证，您需要：

1. 在您的GitHub仓库中创建一个`_config.yml`文件（如果还没有）
2. 或者在HTML中添加认证配置：

```html
<script>
  // 在admin/index.html中添加
  CMS.init({
    config: {
      backend: {
        name: 'github',
        repo: 'your-username/seacall-news',
        branch: 'main',
        auth_endpoint: 'https://github.com/login/oauth/authorize'
      }
    }
  });
</script>
```

## 4. 本地开发

对于本地开发，您可以继续使用`local_backend: true`配置。

## 5. 注意事项

1. GitHub API有速率限制
2. 确保您的GitHub账户对仓库有写权限
3. 对于生产环境，建议使用HTTPS
4. 如果遇到CORS问题，可能需要配置代理

## 6. 替代方案

如果GitHub后端配置复杂，您也可以考虑：

1. 继续使用Netlify（免费方案通常足够）
2. 使用其他支持的后端（GitLab、Bitbucket）
3. 自托管Git Gateway