# Decap CMS 管理员设置指南

## 当前配置状态

### 认证方式
- **后端**: GitHub
- **仓库**: worldshawn/seacall-news
- **分支**: main
- **认证代理**: https://netlify-cms-oauth-dun.vercel.app

### 当前管理员
- **主管理员**: worldshawn (仓库所有者)

## 添加新管理员的步骤

### 方法一：GitHub 仓库协作者（推荐）

1. **登录 GitHub**，进入仓库 `worldshawn/seacall-news`

2. **添加协作者**：
   - 点击 **Settings** 标签
   - 选择 **Manage access**
   - 点击 **Invite a collaborator**
   - 输入新管理员的 GitHub 用户名
   - 选择权限级别：
     - **Write**: 可以编辑和发布内容
     - **Admin**: 完全管理权限

3. **权限说明**：
   - **Write 权限**: 可以创建、编辑、发布文章
   - **Admin 权限**: 除了内容管理，还可以修改仓库设置

### 方法二：修改配置文件

如果需要更精细的权限控制，可以修改 `admin/config.yml`：

```yaml
# 在 permissions 部分添加用户
permissions:
  users:
    - worldshawn
    - new_admin_username  # 添加新管理员的 GitHub 用户名
    - editor_username     # 添加编辑者用户名
```

## 用户角色说明

### 🔴 超级管理员 (Admin)
- **用户**: worldshawn
- **权限**: 
  - ✅ 创建、编辑、删除所有内容
  - ✅ 发布和取消发布
  - ✅ 管理用户权限
  - ✅ 修改站点配置
  - ✅ 访问所有集合

### 🟡 编辑者 (Editor)
- **权限**:
  - ✅ 创建和编辑文章
  - ✅ 发布文章
  - ✅ 管理页面内容
  - ❌ 不能删除内容
  - ❌ 不能管理用户

### 🟢 作者 (Author)
- **权限**:
  - ✅ 创建和编辑自己的文章
  - ✅ 提交文章等待审核
  - ❌ 不能直接发布
  - ❌ 不能编辑他人文章
  - ❌ 不能删除内容

## 安全建议

### 1. 定期审查权限
- 每月检查协作者列表
- 移除不再需要访问权限的用户
- 确保只有必要的人员拥有 Admin 权限

### 2. 使用工作流
- 启用 `editorial_workflow` 进行内容审核
- 重要内容发布前需要管理员审批
- 保持内容质量和一致性

### 3. 备份和恢复
- GitHub 自动保存所有版本历史
- 可以随时回滚到之前的版本
- 建议定期导出重要内容

## 常见问题

### Q: 如何撤销某个用户的访问权限？
A: 在 GitHub 仓库的 Settings → Manage access 中移除该协作者

### Q: 用户忘记密码怎么办？
A: 用户需要通过 GitHub 重置密码，CMS 使用 GitHub 账号登录

### Q: 如何查看谁编辑了什么内容？
A: 在 GitHub 仓库的 Commits 历史中可以看到所有更改记录

### Q: 可以设置内容审核流程吗？
A: 是的，已启用 `editorial_workflow`，非管理员的更改需要审核后才能发布

## 下一步操作

1. **测试登录**: 访问 https://news.aiwai.net/admin 并使用 GitHub 账号登录
2. **创建测试文章**: 验证所有功能正常工作
3. **添加协作者**: 根据需要添加其他管理员或编辑者
4. **配置工作流**: 根据团队需求调整审核流程

---

如有任何问题，请检查：
- GitHub 仓库权限设置
- OAuth 应用配置
- 网络连接和防火墙设置