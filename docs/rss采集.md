# RSS 采集使用与排查教程

本文档说明本仓库的 RSS 采集工作如何运行、如何手动触发、如何查看日志与结果、以及常见问题的排查与增强建议。

最后更新：2025-09-23

---

## 1. 功能概述

- 工作流文件：`.github/workflows/rss-collect.yml`
- 运行方式：
  - 定时：每 8 小时自动运行（按 UTC 计算）
  - 手动：在 GitHub Actions 面板一键运行
- 执行内容：
  - 使用 `rss-parser` 拉取多个越南新闻 RSS 源
  - 通过关键词过滤投资相关内容（可调）
  - 生成 Jekyll 文章到 `_posts/` 目录（包含 front matter）
  - 自动 `git commit` 并 `push` 到仓库
- 文件命名：`YYYY-MM-DD-HHMMSS-<slug>.md`（含时分秒，减少同日碰撞）

---

## 2. 如何手动触发

### 2.1 GitHub 网页端
1) 进入仓库 → “Actions”
2) 选择工作流 “Auto Collect RSS News”
3) 点击 “Run workflow”，选择分支（main）后运行
4) 打开本次运行，查看每一步日志

### 2.2 gh CLI（可选）
前提：安装 GitHub CLI 并登录 `gh auth login`
```
gh workflow run "Auto Collect RSS News"
```

### 2.3 GitHub API（可选）
用于从外部系统触发。需要 PAT（包含 repo + workflow 权限）。
```
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_PERSONAL_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/rss-collect.yml/dispatches \
  -d '{"ref":"main"}'
```

提示：
- 定时任务按 UTC 执行；新加坡/越南为 UTC+8。如需立即执行，建议手动触发。

---

## 3. 日志查看与结果验证

运行页面 → 步骤 “Collect RSS feeds” 日志重点：
- “成功获取RSS源: <url>, 文章数量: N” 表示拉取成功
- “✅ 已创建: <filename>” 表示新文章已生成
- “⏭️ 跳过不相关文章 ...” 可能因关键词过滤导致
- 若报错（如 403/重定向），需要增强 UA/重试（见第6节）

步骤 “Commit new posts”：
- “✅ 新文章已自动发布” 表示推送成功
- “ℹ️ 没有新文章需要发布” 表示这次没有新增

步骤 “Create summary”：
- 汇总执行时间与新增文章数量

结果验证：
- 仓库 `_posts/` 应出现新增 Markdown 文件
- 触发 GitHub Pages/Jekyll 构建后，站点应显示新文章

---

## 4. 源与关键词调整

工作流在运行时生成 `collect-rss.js`，其中包含：
- RSS 源数组 `feeds`（URL、来源名称、分类）
- 关键词数组 `keywords`
- 分类标签映射、front matter 结构

常见操作：
- 只保留你确认可用的 RSS：在 `feeds` 数组内添加/删除项目
- 放宽/收紧过滤：调整 `keywords`；或在排查阶段临时不过滤（仅用于验证链路）
- 分类与标签：`getCategoryTags()` 控制 tags，`category` 会写入 front matter

注意：
- 目前文件名含时分秒，降低同日同题撞名概率
- 可进一步用链接的短 hash 拼入文件名以确保唯一性（需要代码微调）

---

## 5. 常见问题与排查

1) Actions 面板看不到 “Auto Collect RSS News”
- 检查 `.github/workflows/rss-collect.yml` 是否在 `main` 分支，`name:` 是否存在
- 确保 YAML 无语法错误（见下一条）

2) YAML 语法错误（例如指向 `layout: post` 那一行）
- 根因：在 `run:` 的 heredoc 里使用 JavaScript 模板字符串（反引号）嵌入了 Front Matter，YAML 解析器会误判
- 现状：已将模板字符串改为普通字符串拼接，避免冲突
- 作用：消除了第 139 行 `layout: post` 被 YAML 解析的错误

3) 抓不到文章或全部被跳过
- 关键词过滤过严：日志会看到大量 “⏭️ 跳过不相关文章”
  - 方案：放宽 `keywords`，或临时不过滤先验证流程
- RSS 源需要更完整的正文：代码已优先使用 `content:encoded`，提高命中率

4) 某些源 403/重定向，或返回为空
- 可能需要设置浏览器 `User-Agent` 或重试机制（见第6节增强）
- 也可能是源临时异常，可在日志中确认错误信息

5) 同日文件名冲突
- 已在文件名加入 `HHmmss`，若仍冲突，建议额外拼接链接短 hash

6) 汇总统计不准确
- 以前使用 `${#feeds[@]}`（Bash 数组语法）是不正确的，现已清理
- 如需更详尽统计，可在 Node 中写 `$GITHUB_STEP_SUMMARY` 或 `$GITHUB_OUTPUT`

---

## 6. 可选增强（按需）

A. 为 rss-parser 增加 User-Agent 与重试（建议在抓取失败时采用）  
示意（需改写生成的 collect-rss.js）：
```js
const parser = new Parser({
  customFields: { item: ['content:encoded', 'content'] },
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    },
    timeout: 15000
  }
});

// 简单重试封装
async function parseWithRetry(url, times = 3, delayMs = 1000) {
  let lastErr;
  for (let i = 0; i < times; i++) {
    try { return await parser.parseURL(url); }
    catch (e) { lastErr = e; await new Promise(r => setTimeout(r, delayMs * (i + 1))); }
  }
  throw lastErr;
}
```

B. 去重指纹库  
- 写入 `_data/ingested.json`（包含已处理文章的 link/guid hash）
- 采集前先判断，避免跨日重复抓取

C. 后台一键触发  
- 在 workflow 增加：
```yaml
on:
  schedule:
    - cron: '0 */8 * * *'
  workflow_dispatch:
  repository_dispatch:
    types: [run-rss-collect]
```
- 从你的服务（或 Serverless Function）调用：
```
POST https://api.github.com/repos/OWNER/REPO/dispatches
Body: {"event_type":"run-rss-collect"}
```

---

## 7. 变更历史（与本项目相关）

- 2025-09-22
  - 修复 Create summary 中错误的 Bash 数组用法
  - 移除未使用依赖 `openai`
  - 优化文件命名（加入时分秒）
  - 关键词匹配优先使用 `content:encoded`

- 2025-09-23
  - 修复 YAML 模板字符串冲突：将 Markdown 模板从反引号模板字符串改为普通字符串拼接，解决 `layout: post` 行报错
  - 文档新增（本文件）

---

## 8. 快速故障清单

- Actions 未出现：检查分支与文件路径、YAML 语法
- 运行失败：看 “Collect RSS feeds” 日志中的错误（403/超时/空）
- 无新增文件：检查过滤是否过严；查看 “Commit new posts” 步骤
- 站点未更新：确认 Pages/Jekyll 构建是否成功、是否在正确分支

---

## 9. 需要帮助？

如需我直接：
- 加 UA 与重试逻辑
- 加 repository_dispatch 事件
- 增加/调整 RSS 源或关键词
- 添加链接 hash 去重与命名
请创建 Issue 或在提交 PR 时 @维护者，并说明你的期望行为与使用场景。