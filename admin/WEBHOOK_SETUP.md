# Webhook配置指南

本指南说明如何为Decap CMS配置Webhook，以实现内容更新后的自动操作。

## 什么是Webhook？

Webhook是一种允许应用程序在特定事件发生时向其他应用程序发送实时通知的方式。对于Decap CMS，Webhook可以在内容更新时触发操作。

## 是否需要配置Webhook？

对于大多数情况，**不需要**配置Webhook，因为：

1. Decap CMS直接使用GitHub API与仓库交互
2. GitHub Actions已经配置为在推送到main分支时自动部署
3. 基本的CMS功能不需要Webhook

## 如果需要Webhook的场景

您可能需要Webhook如果：

1. 需要在内容更新时执行特定操作（如发送通知）
2. 需要与其他服务集成
3. 需要更复杂的部署流程

## 如何配置Webhook

### 1. GitHub仓库Webhook设置

1. 访问您的GitHub仓库设置页面
2. 点击"Webhooks"选项卡
3. 点击"Add webhook"
4. 填写以下信息：
   - Payload URL: 您的处理端点URL
   - Content type: application/json
   - Secret: （可选）用于验证请求的密钥
   - Events: 选择"Push events"或其他相关事件
5. 点击"Add webhook"

### 2. 处理Webhook请求

您需要创建一个端点来处理Webhook请求：

```javascript
// 示例：Node.js端点处理Webhook
app.post('/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  
  if (event === 'push') {
    // 处理推送事件
    console.log('Content updated, triggering actions...');
    // 在这里添加您需要执行的操作
  }
  
  res.status(200).send('OK');
});
```

## 推荐方案

对于seacall-news项目，推荐使用现有的GitHub Actions工作流：

1. 当通过Decap CMS更新内容时，更改将直接推送到main分支
2. 现有的deploy.yml工作流会自动触发重新部署
3. 无需额外配置Webhook

这种方案简单、可靠，且充分利用了GitHub Pages和GitHub Actions的功能。