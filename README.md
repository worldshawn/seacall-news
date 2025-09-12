# NewSeaCall News - 越南投资资讯站点

专注越南市场的AI驱动投资分析与新闻资讯平台

## 🎯 项目概述

NewSeaCall News是一个基于GitHub Pages + Jekyll + Decap CMS的轻量化新闻资讯系统，专为越南投资市场服务。通过智能化的内容管理和引流机制，为主应用NewSeaCall导流并提供投资价值。

### 核心特性

- ✅ **完全免费**：基于GitHub Pages，零运维成本
- ✅ **智能引流**：内置AI驱动的引流组件
- ✅ **自动化运维**：RSS自动采集，GitHub Actions部署
- ✅ **移动优先**：响应式设计，优秀的移动端体验
- ✅ **SEO优化**：静态站点，搜索引擎友好
- ✅ **高性能**：CDN加速，全球快速访问

## 🏗️ 技术架构

```
技术栈:
  前端: Jekyll (静态站点生成器)
  CMS: Decap CMS (前身Netlify CMS)
  托管: GitHub Pages
  数据库: Git仓库 (Markdown文件)
  自动化: GitHub Actions
  样式: CSS Grid + Flexbox
  交互: Vanilla JavaScript
```

## 📁 项目结构

```
newseacall-news/
├── _config.yml              # Jekyll配置
├── _layouts/                # 页面布局模板
│   ├── default.html         # 默认布局
│   ├── home.html           # 首页布局
│   └── post.html           # 文章页面布局
├── _includes/               # 可复用组件
│   ├── header.html         # 页头
│   ├── footer.html         # 页脚
│   ├── investment-cta.html # 引流组件
│   └── analytics.html      # 统计代码
├── _posts/                 # 文章目录
├── _data/                  # 数据文件
├── admin/                  # Decap CMS管理界面
│   ├── index.html         # CMS入口
│   └── config.yml         # CMS配置
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── images/            # 图片资源
├── .github/workflows/     # GitHub Actions
│   ├── deploy.yml         # 自动部署
│   └── rss-collect.yml    # RSS采集
├── index.html             # 首页
├── about.md               # 关于页面
├── Gemfile                # Ruby依赖
└── README.md             # 项目文档
```

## 🚀 快速开始

### 1. 环境要求

- Ruby 3.1+
- Bundler
- Git
- 现代浏览器

### 2. 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd newseacall-news

# 安装依赖
bundle install

# 启动本地服务器
bundle exec jekyll serve

# 访问本地站点
# http://localhost:4000
```

### 3. 内容管理

访问 `/admin/` 路径进入Decap CMS管理界面，可以：

- 创建和编辑新闻文章
- 管理分类和标签
- 上传图片和媒体文件
- 预览文章效果

### 4. 自动化功能

- **自动部署**：推送到main分支时自动部署到GitHub Pages
- **RSS采集**：每8小时自动采集相关新闻源
- **引流追踪**：自动追踪用户行为和转化效果

## 📊 引流机制

### 智能引流组件

每篇文章都包含智能引流组件，根据文章分类动态调整推荐内容：

- **越南政策**：政策解读专家建议
- **市场分析**：市场机会洞察
- **投资新闻**：投资机会预警
- **行业洞察**：行业深度分析

### 追踪参数

所有引流链接都包含UTM参数：

```
utm_source=news
utm_medium=cta
utm_campaign=investment_insights
```

### 效果监控

- Google Analytics集成
- 自定义事件追踪
- 转化漏斗分析
- 用户行为热图

## 🎨 内容分类

### 主要分类

1. **vietnam-policy** - 越南政策
   - 政府政策解读
   - 法规变化分析
   - 投资政策影响

2. **market-analysis** - 市场分析
   - 宏观经济分析
   - 行业趋势研究
   - 市场数据解读

3. **investment-news** - 投资新闻
   - 投资动态报道
   - 企业融资信息
   - 项目进展更新

4. **industry-insights** - 行业洞察
   - 深度行业研究
   - 创新技术分析
   - 商业模式探讨

## 🔧 配置说明

### Jekyll配置 (_config.yml)

```yaml
# 基本站点信息
title: NewSeaCall 越南投资资讯
description: 专注越南市场的AI驱动投资分析与新闻资讯
url: https://news.newseacall.com

# NewSeaCall主应用配置
newseacall:
  main_site: https://newseacall.com
  api_endpoint: https://api.newseacall.com
  contact_email: contact@newseacall.com
```

### CMS配置 (admin/config.yml)

```yaml
backend:
  name: git-gateway
  branch: main

collections:
  - name: "news"
    label: "新闻文章"
    folder: "_posts"
    create: true
```

## 📈 SEO优化

### 内置SEO功能

- Jekyll SEO Tag插件
- 结构化数据标记
- 自动生成sitemap.xml
- RSS feed自动生成
- 社交媒体元标签

### 性能优化

- 图片懒加载
- CSS/JS压缩
- CDN加速
- 缓存策略优化

## 🔒 安全考虑

### 内容安全

- Markdown内容自动清理
- 用户上传文件检查
- XSS防护措施
- CSRF令牌验证

### 数据保护

- 不存储用户个人信息
- 统计数据匿名化
- GDPR合规性考虑

## 📱 移动端优化

### 响应式设计

- 移动优先设计原则
- 触摸友好的交互元素
- 快速加载优化
- 离线阅读支持

### 性能指标

- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Time to Interactive < 3.5s

## 🛠️ 运维管理

### 监控指标

- 站点可用性监控
- 性能指标追踪
- 错误日志分析
- 用户体验监控

### 备份策略

- Git仓库自动备份
- 定期数据导出
- 配置文件版本控制
- 图片资源备份

## 🔄 持续集成

### GitHub Actions工作流

1. **部署流程**
   - 代码检查
   - Jekyll构建
   - 自动部署到GitHub Pages

2. **内容更新**
   - RSS源监控
   - 自动内容采集
   - 智能内容筛选
   - 自动发布流程

3. **质量保证**
   - 链接有效性检查
   - 图片优化
   - SEO验证
   - 性能测试

## 📞 支持与贡献

### 获取帮助

- 查看Issues获取常见问题解答
- 邮件联系：contact@newseacall.com
- 查看Wiki文档了解详细信息

### 贡献指南

1. Fork项目仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [NewSeaCall主应用](https://newseacall.com)
- [Jekyll文档](https://jekyllrb.com/)
- [Decap CMS文档](https://decapcms.org/)
- [GitHub Pages文档](https://pages.github.com/)

---

**版本**: v1.0.0  
**更新时间**: 2025年1月12日  
**维护团队**: NewSeaCall开发团队