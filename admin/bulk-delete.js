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

  // 检测是否在管理页面（更宽松的检测）
  function isAdminPage() {
    const hash = window.location.hash || '';
    const pathname = window.location.pathname || '';
    // 检查是否在admin页面或包含collections的路径
    return pathname.includes('/admin') || 
           hash.includes('#/collections/') || 
           hash.includes('#/') ||
           document.querySelector('[data-testid*="collection"]') ||
           document.querySelector('.cms') ||
           document.querySelector('#nc-root');
  }

  // 获取页面主容器（支持多种CMS结构）
  function getPageMain() {
    // 尝试多种可能的容器选择器
    const candidates = [
      '[data-testid="collection-page"]',
      '.cms',
      '#nc-root',
      '[class*="CollectionPage"]',
      '[class*="CollectionMain"]',
      'main',
      '.main-content'
    ];
    
    for (const selector of candidates) {
      const element = document.querySelector(selector);
      if (element) {
        console.log('找到页面容器:', selector, element);
        return element;
      }
    }
    
    // 如果都没找到，返回body
    console.log('未找到特定容器，使用body');
    return document.body;
  }

  function getItemsContainer() {
    // 列表容器常用的选择器
    const candidates = [
      '[data-testid="collection-items"]',
      '[class*="CollectionMain"] [class*="items"]',
      '[class*="CollectionPage"] [class*="cards"]',
      '[class*="collection"] [class*="list"]',
      '[class*="entries"]',
      '.cms .entries',
      '#nc-root .entries'
    ];
    
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) {
        console.log('找到列表容器:', sel, el);
        return el;
      }
    }
    
    // 退路：在主容器下查找包含卡片的父节点
    const main = getPageMain();
    if (!main) return null;
    
    // 尝试找到包含多个条目的容器
    const firstCard = main.querySelector('[data-testid="collection-card"]') || 
                     main.querySelector('[class*="card"]') ||
                     main.querySelector('[class*="entry"]') ||
                     main.querySelector('article') ||
                     main.querySelector('.post');
    
    if (firstCard) {
      console.log('通过第一个卡片找到容器:', firstCard.parentElement);
      return firstCard.parentElement;
    }
    
    console.log('未找到列表容器，使用主容器');
    return main;
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

  // 为卡片添加复选框（支持多种卡片类型）
  function addCheckboxesToEntries() {
    // 尝试多种可能的卡片选择器
    const cardSelectors = [
      '[data-testid="collection-card"]',
      '[class*="card"]',
      '[class*="entry"]',
      'article',
      '.post',
      '[class*="item"]'
    ];
    
    let cards = [];
    for (const selector of cardSelectors) {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        cards = Array.from(found);
        console.log('找到卡片:', selector, cards.length);
        break;
      }
    }
    
    if (cards.length === 0) {
      console.log('未找到任何卡片');
      return;
    }
    
    cards.forEach((card, index) => {
      if (card.classList.contains('has-bulk-checkbox')) return;
      
      // 确保卡片有相对定位
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      
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
    
    console.log(`为 ${cards.length} 个卡片添加了复选框`);
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
    console.log('批量删除脚本开始运行...');
    
    if (!isAdminPage()) {
      console.log('不在管理页面，跳过初始化');
      teardown();
      return;
    }
    
    console.log('在管理页面，开始初始化批量删除功能');
    
    // 延迟执行，确保CMS完全加载
    setTimeout(() => {
      ensureToolbar();
      addCheckboxesToEntries();
      attachListObserver();
    }, 500);
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

  // 初始化：支持多种触发方式
  function init() {
    if (isInitialized) {
      run();
      return;
    }
    isInitialized = true;

    console.log('批量删除脚本初始化...');

    // 初次运行
    run();

    // 监听路由变化
    window.addEventListener('hashchange', () => {
      console.log('路由变化，重新初始化');
      run();
    });
    
    // 监听页面变化（用于SPA应用）
    const observer = new MutationObserver(() => {
      if (document.querySelector('.cms') || document.querySelector('#nc-root')) {
        console.log('检测到CMS界面变化，重新初始化');
        run();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
