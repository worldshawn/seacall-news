/**
 * 批量删除（仅前端交互版）- 使用外部CSS类，不含任何内联样式
 * 保存为：admin/bulk-delete-ui.js
 *
 * 依赖样式类（需在 admin/bulk-delete.css 中定义或补充）：
 * - 工具栏：.bulk-delete-toolbar, .bulk-delete-controls, .bulk-select-all, .selected-count, .bulk-delete-btn
 * - 复选框：.bulk-checkbox, .checkmark, .entry-checkbox, .has-bulk-checkbox
 * - 弹窗：.bulk-delete-modal, .modal-overlay, .modal-content, .modal-header, .modal-body, .modal-footer,
 *         .modal-close, .btn-cancel, .btn-confirm, .delete-entries, .delete-entry-item
 * - 提示：.bulk-delete-toast.success, .toast-content, .toast-icon, .toast-message, .show
 */
(function () {
  'use strict';

  let isInitialized = false;
  let toolbar = null;
  let routeObserver = null;
  let listObserver = null;

  // 启动入口
  function init() {
    if (isInitialized) return;
    isInitialized = true;

    // 初次路由检查
    checkAndAttach();

    // 监听路由变化（Decap CMS前端为SPA）
    routeObserver = new MutationObserver(() => {
      checkAndAttach();
    });
    routeObserver.observe(document.body, { subtree: true, childList: true });
  }

  // 是否在集合列表页面
  function isCollectionsPage() {
    const hash = window.location.hash || '';
    return hash.includes('#/collections/');
  }

  // 主流程：在集合页挂载工具栏与复选框
  function checkAndAttach() {
    if (!isCollectionsPage()) {
      teardown();
      return;
    }

    // 查找列表容器
    const container = findListContainer();
    if (!container) return;

    // 添加工具栏
    ensureToolbar(container);

    // 为现有条目补充复选框
    addCheckboxesToEntries();

    // 监听列表内容变化（翻页、搜索等）
    if (!listObserver) {
      listObserver = new MutationObserver(() => {
        addCheckboxesToEntries();
        updateToolbarState();
      });
      listObserver.observe(container, { childList: true, subtree: true });
    }
  }

  // 查找 Decap CMS 集合列表容器
  function findListContainer() {
    const selectors = [
      '[data-testid="collection-page"] main',
      'main[role="main"]',
      '.nc-collectionPage-main',
      '[class*="CollectionPage"] [class*="main"]'
    ];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    // 退路：可能是某些主题结构
    return document.querySelector('main') || document.querySelector('[role="main"]');
  }

  // 创建并插入工具栏（若不存在）
  function ensureToolbar(container) {
    if (toolbar && document.body.contains(toolbar)) return;

    toolbar = document.createElement('div');
    toolbar.className = 'bulk-delete-toolbar';
    toolbar.innerHTML = `
      <div class="bulk-delete-controls">
        <label class="bulk-select-all">
          <input type="checkbox" id="bulkSelectAll" />
          <span>全选</span>
        </label>
        <span class="selected-count">已选择: <strong>0</strong> 篇</span>
        <button class="bulk-delete-btn" disabled>删除选中项</button>
      </div>
    `;

    // 插入到列表容器顶部
    container.insertBefore(toolbar, container.firstChild);

    bindToolbarEvents();
    updateToolbarState();
  }

  // 为列表中的每个条目添加选择复选框
  function addCheckboxesToEntries() {
    const entries = findEntries();
    entries.forEach((entry, index) => {
      if (entry.classList.contains('has-bulk-checkbox')) return;

      const label = document.createElement('label');
      label.className = 'bulk-checkbox';
      label.innerHTML = `
        <input type="checkbox" class="entry-checkbox" data-entry-id="${index}" />
        <span class="checkmark"></span>
      `;
      entry.classList.add('has-bulk-checkbox');
      entry.appendChild(label);

      const cb = label.querySelector('.entry-checkbox');
      cb.addEventListener('change', () => updateToolbarState());
    });
  }

  // 查找条目卡片
  function findEntries() {
    // 常见卡片选择器
    const selectors = [
      '[data-testid="collection-card"]',
      '[class*="EntryCard"]',
      '[class*="entry-card"]',
      'article'
    ];
    for (const s of selectors) {
      const list = Array.from(document.querySelectorAll(s));
      if (list.length) return list;
    }
    // 退路：基于结构与文本的朴素筛选
    const candidates = Array.from(document.querySelectorAll('div'))
      .filter((div) => {
        if (div.classList.contains('has-bulk-checkbox')) return false;
        const titleEl = div.querySelector('h1,h2,h3,h4,h5,h6');
        const text = (div.textContent || '').trim();
        const hasTitle = !!titleEl || text.length > 20;
        return hasTitle && text.length < 1200;
      });
    return candidates;
  }

  // 绑定工具栏事件
  function bindToolbarEvents() {
    const selectAll = toolbar.querySelector('#bulkSelectAll');
    const deleteBtn = toolbar.querySelector('.bulk-delete-btn');

    selectAll.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('.entry-checkbox').forEach((cb) => {
        cb.checked = checked;
      });
      updateToolbarState();
    });

    deleteBtn.addEventListener('click', () => {
      const selected = getSelectedItems();
      if (!selected.length) return;
      showDeleteConfirmation(selected);
    });
  }

  // 获取被选中的条目信息（元素与标题）
  function getSelectedItems() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.entry-checkbox:checked'));
    return selectedCheckboxes.map((cb) => {
      const card = cb.closest('[data-testid="collection-card"]')
        || cb.closest('[class*="EntryCard"]')
        || cb.closest('article')
        || cb.closest('div');
      const titleEl = card?.querySelector('h1,h2,h3,h4,h5,h6,[class*="title"], .card-title');
      return {
        element: card,
        title: titleEl ? titleEl.textContent.trim() : '未知标题'
      };
    }).filter(item => !!item.element);
  }

  // 更新工具栏计数与按钮状态
  function updateToolbarState() {
    if (!toolbar) return;
    const count = document.querySelectorAll('.entry-checkbox:checked').length;
    const countEl = toolbar.querySelector('.selected-count strong');
    const deleteBtn = toolbar.querySelector('.bulk-delete-btn');
    if (countEl) countEl.textContent = String(count);
    if (deleteBtn) {
      deleteBtn.disabled = count === 0;
      deleteBtn.classList.toggle('disabled', count === 0);
    }
  }

  // 显示删除确认弹窗（仅前端标记删除）
  function showDeleteConfirmation(items) {
    const modal = document.createElement('div');
    modal.className = 'bulk-delete-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>确认删除</h3>
            <button class="modal-close" aria-label="关闭">&times;</button>
          </div>
          <div class="modal-body">
            <p><strong>您将删除 ${items.length} 篇文章，此操作不可撤销！</strong></p>
            <div class="delete-list">
              <ul class="delete-entries">
                ${items.map(item => `<li class="delete-entry-item">${escapeHtml(item.title)}</li>`).join('')}
              </ul>
            </div>
            <div class="confirmation-input">
              <label>
                请输入 "确认删除" 以继续：
                <input type="text" id="confirmInput" placeholder="确认删除" />
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel">取消</button>
            <button class="btn-confirm" disabled>确认删除</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    const input = modal.querySelector('#confirmInput');

    const closeModal = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    input.addEventListener('input', (e) => {
      confirmBtn.disabled = e.target.value !== '确认删除';
    });
    confirmBtn.addEventListener('click', () => {
      performBulkDelete(items);
      closeModal();
    });
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    setTimeout(() => input.focus(), 50);
  }

  // 执行删除（仅前端移除卡片）
  function performBulkDelete(items) {
    items.forEach(({ element }) => {
      if (!element) return;
      // 移除元素节点（动画交由CSS控制，如需的话）
      element.parentNode && element.parentNode.removeChild(element);
    });
    // 清空已选状态
    document.querySelectorAll('.entry-checkbox:checked').forEach(cb => { cb.checked = false; });
    updateToolbarState();
    showSuccessMessage(`已删除 ${items.length} 篇文章`);
  }

  // 成功提示（使用CSS类）
  function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'bulk-delete-toast success';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">✅</span>
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
    `;
    document.body.appendChild(toast);
    // 进入动画
    requestAnimationFrame(() => toast.classList.add('show'));
    // 自动关闭
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 300);
    }, 2500);
  }

  // 清理（离开集合页）
  function teardown() {
    if (toolbar && toolbar.parentNode) {
      toolbar.parentNode.removeChild(toolbar);
    }
    toolbar = null;

    // 可选：移除所有checkbox（避免残留）
    document.querySelectorAll('.has-bulk-checkbox').forEach((entry) => {
      const cb = entry.querySelector('.bulk-checkbox');
      cb && cb.parentNode && cb.parentNode.removeChild(cb);
      entry.classList.remove('has-bulk-checkbox');
    });

    if (listObserver) {
      listObserver.disconnect();
      listObserver = null;
    }
  }

  // 简单转义
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // 文档就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
