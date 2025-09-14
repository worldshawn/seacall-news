# OAuth App 更新指南

## ✅ 已完成的更新：

### 1. GitHub OAuth App 创建
- **新的 Client ID**: `Ov23lia4oZTqAYE6t4eP`
- **应用名称**: seacall News CMS
- **回调 URL**: https://netlify-cms-oauth-dun.vercel.app/callback

### 2. CMS 配置文件更新
- ✅ 移除了旧的 GitHub App ID (`Iv23lioSDAm106VwrrAz`)
- ✅ 简化了后端配置
- ✅ 使用正确的 OAuth 代理 URL

## 🔄 需要完成的步骤：

### 1. 更新 Vercel 环境变量
在您的 Vercel 项目 `netlify-cms-oauth-dun` 中更新：

```
OAUTH_GITHUB_CLIENT_ID=Ov23lia4oZTqAYE6t4eP
OAUTH_GITHUB_CLIENT_SECRET=[您的新 Client Secret]
```

**重要**: 
- 移除任何 GitLab 相关的环境变量（如果不需要）
- 确保 Client Secret 正确设置

### 2. 重新部署 OAuth 代理
- Vercel 会在环境变量更新后自动重新部署
- 等待部署完成

### 3. 清除浏览器缓存
- 清除 `www.aiwai.net` 的浏览器缓存
- 或使用无痕模式测试

## 🧪 测试步骤：

### 1. 测试登录
1. 访问 `https://www.aiwai.net/admin`
2. 点击 "Login with GitHub"
3. 应该正确跳转到 GitHub 授权页面
4. 授权后应该能成功登录 CMS

### 2. 测试权限
1. 尝试创建新文章
2. 尝试上传图片
3. 尝试保存和发布文章

## 🔍 权限检查：

### OAuth App 应该请求的权限范围：
- `repo` - 完整的仓库访问权限
- `user:email` - 读取用户邮箱

### 如果仍然出现 403 错误：
1. 检查 GitHub → Settings → Applications → Authorized OAuth Apps
2. 确认 "seacall News CMS" 有正确的权限
3. 如果权限不足，撤销并重新授权

## 🚨 故障排除：

### 如果登录失败：
1. 检查 Vercel 环境变量是否正确
2. 检查 OAuth App 的回调 URL 设置
3. 查看浏览器开发者工具的网络请求

### 如果图片上传失败：
1. 确认 OAuth App 有 `repo` 权限
2. 检查仓库的 `assets/images/uploads` 目录是否存在
3. 确认用户对仓库有写入权限

### 如果文章保存失败：
1. 检查 editorial workflow 设置
2. 确认分支权限
3. 查看 GitHub API 限制

## 📝 当前配置摘要：

```yaml
backend:
  name: github
  repo: worldshawn/seacall-news
  branch: main
  base_url: https://netlify-cms-oauth-dun.vercel.app

media_folder: "assets/images/uploads"
public_folder: "/assets/images/uploads"
```

这个配置应该能正确工作，前提是：
- Vercel 环境变量正确设置
- OAuth App 权限充足
- 用户对仓库有适当权限

---

**下一步**: 请更新 Vercel 环境变量，然后测试登录和文件上传功能。