/**
 * 批量删除（性能优化版、正确定位版）- 使用外部CSS类，不含任何内联样式
 * 保存为：admin/bulk-delete-ui-v2.js
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
  let listObserver = null;
  let debounceTimer = null;

  // 仅在集合列表页启用
  function isCollectionsPage() {
    const hash = window.location.hash || '';
    return hash.includes('#/collections/');
  }

  // 精确获取集合页面主容器和列表容器
  function getPageMain() {
    // Decap CMS 常见结构
    const page = document.querySelector('[data-testid="collection-page"]');
    if (!page) return null;
    // main可能在page内部或后代元素中
    return page.querySelector('main') || page;
  }

  function getItemsContainer() {
    // 列表容器常用的testid
    const candidates = [
      '[data-testid="collection-items"]',
      '[class*="CollectionMain"] [class*="items"]',
      '[class*="CollectionPage"] [class*="cards"]'
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // 退路：在主容器下查找包含卡片的父节点
    const main = getPageMain();
    if (!main) return null;
    const firstCard = main.querySelector('[data-testid="collection-card"]');
    return firstCard ? firstCard.parentElement : null;
  }

  // 插入工具栏（一次）
  function ensureToolbar() {
    if (toolbar && document.body.contains(toolbar)) return;
    const main = getPageMain();
    if (!main) return;

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
    // 插到 main 的第一个元素之前，紧贴标题区域下方
    main.insertBefore(toolbar, main.firstChild);
    bindToolbarEvents();
    updateToolbarState();
  }

  // 为卡片添加复选框（只处理 data-testid="collection-card"）
  function addCheckboxesToEntries() {
    const cards = Array.from(document.querySelectorAll('[data-testid="collection-card"]'));
    cards.forEach((card, index) => {
      if (card.classList.contains('has-bulk-checkbox')) return;
      const label = document.createElement('label');
      label.className = 'bulk-checkbox';
      label.innerHTML = `
        <input type="checkbox" class="entry-checkbox" data-entry-id="${index}" />
        <span class="checkmark"></span>
      `;
      card.classList.add('has-bulk-checkbox');
      // 作为卡片的第一个子元素（靠左上角的区域）
      card.insertBefore(label, card.firstChild);

      const cb = label.querySelector('.entry-checkbox');
      cb.addEventListener('change', () => updateToolbarState());
    });
  }

  function bindToolbarEvents() {
    const selectAll = toolbar.querySelector('#bulkSelectAll');
    const deleteBtn = toolbar.querySelector('.bulk-delete-btn');

    selectAll.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('[data-testid="collection-card"] .entry-checkbox').forEach((cb) => {
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

  // 高效更新状态
  function updateToolbarState() {
    if (!toolbar) return;
    const count = document.querySelectorAll('[data-testid="collection-card"] .entry-checkbox:checked').length;
    const countEl = toolbar.querySelector('.selected-count strong');
    const deleteBtn = toolbar.querySelector('.bulk-delete-btn');
    if (countEl) countEl.textContent = String(count);
    if (deleteBtn) {
      deleteBtn.disabled = count === 0;
      deleteBtn.classList.toggle('disabled', count === 0);
    }
  }

  // 仅从卡片抓取标题
  function getSelectedItems() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('[data-testid="collection-card"] .entry-checkbox:checked'));
    return selectedCheckboxes.map((cb) => {
      const card = cb.closest('[data-testid="collection-card"]');
      const titleEl = card?.querySelector('h1,h2,h3,h4,h5,h6,[class*="title"], .card-title');
      return {
        element: card,
        title: titleEl ? titleEl.textContent.trim() : '未知标题'
      };
    }).filter(item => !!item.element);
  }

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

  function performBulkDelete(items) {
    items.forEach(({ element }) => {
      if (!element) return;
      element.parentNode && element.parentNode.removeChild(element);
    });
    document.querySelectorAll('[data-testid="collection-card"] .entry-checkbox:checked').forEach(cb => { cb.checked = false; });
    updateToolbarState();
    showSuccessMessage(`已删除 ${items.length} 篇文章`);
  }

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
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 300);
    }, 2500);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // 仅监听列表容器变化，并做去抖，避免卡顿
  function attachListObserver() {
    const container = getItemsContainer();
    if (!container) return;
    if (listObserver) listObserver.disconnect();

    listObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        addCheckboxesToEntries();
        updateToolbarState();
      }, 150);
    });
    listObserver.observe(container, { childList: true, subtree: true });
  }

  // 主流程入口
  function run() {
    if (!isCollectionsPage()) {
      teardown();
      return;
    }
    ensureToolbar();
    addCheckboxesToEntries();
    attachListObserver();
  }

  function teardown() {
    if (toolbar && toolbar.parentNode) {
      toolbar.parentNode.removeChild(toolbar);
    }
    toolbar = null;
    document.querySelectorAll('[data-testid="collection-card"].has-bulk-checkbox').forEach((card) => {
      const label = card.querySelector('.bulk-checkbox');
      label && label.parentNode && label.parentNode.removeChild(label);
      card.classList.remove('has-bulk-checkbox');
    });
    if (listObserver) {
      listObserver.disconnect();
      listObserver = null;
    }
  }

  // 初始化：仅在路由变化或DOMContentLoaded时运行（不观察整个body）
  function init() {
    if (isInitialized) {
      run();
      return;
    }
    isInitialized = true;

    // 初次运行
    run();

    // 精简的路由监听：只在hash变化时触发
    window.addEventListener('hashchange', () => {
      run();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
