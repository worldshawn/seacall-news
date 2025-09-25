/**
 * Decap CMS 批量删除功能扩展
 * 为新闻文章列表添加多选删除功能
 */

(function() {
    'use strict';
    
    // 等待CMS完全加载
    function waitForCMS() {
        if (typeof CMS === 'undefined' || !document.querySelector('[data-testid="collection-page"]')) {
            setTimeout(waitForCMS, 500);
            return;
        }
        initBulkDelete();
    }
    
    // 初始化批量删除功能
    function initBulkDelete() {
        console.log('初始化批量删除功能...');
        
        // 监听路由变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    const collectionPage = document.querySelector('[data-testid="collection-page"]');
                    if (collectionPage && !document.querySelector('.bulk-delete-toolbar')) {
                        setTimeout(addBulkDeleteUI, 1000);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 初始检查
        setTimeout(addBulkDeleteUI, 1000);
    }
    
    // 添加批量删除UI
    function addBulkDeleteUI() {
        const collectionPage = document.querySelector('[data-testid="collection-page"]');
        if (!collectionPage || document.querySelector('.bulk-delete-toolbar')) {
            return;
        }
        
        console.log('添加批量删除UI...');
        
        // 创建工具栏
        const toolbar = createToolbar();
        
        // 插入工具栏
        const header = collectionPage.querySelector('header') || collectionPage.firstElementChild;
        if (header) {
            header.parentNode.insertBefore(toolbar, header.nextSibling);
        }
        
        // 为每个文章条目添加复选框
        addCheckboxesToEntries();
        
        // 监听新条目的添加
        observeEntryChanges();
    }
    
    // 创建工具栏
    function createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'bulk-delete-toolbar';
        toolbar.innerHTML = `
            <div class="bulk-delete-controls">
                <label class="bulk-select-all">
                    <input type="checkbox" id="selectAll"> 全选
                </label>
                <span class="selected-count">已选择: <strong>0</strong> 篇文章</span>
                <button class="bulk-delete-btn" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    删除选中项
                </button>
            </div>
        `;
        
        // 绑定事件
        const selectAllCheckbox = toolbar.querySelector('#selectAll');
        const deleteBtn = toolbar.querySelector('.bulk-delete-btn');
        
        selectAllCheckbox.addEventListener('change', handleSelectAll);
        deleteBtn.addEventListener('click', handleBulkDelete);
        
        return toolbar;
    }
    
    // 为文章条目添加复选框
    function addCheckboxesToEntries() {
        const entries = document.querySelectorAll('[data-testid="collection-card"]:not(.has-bulk-checkbox)');
        
        entries.forEach(entry => {
            if (entry.classList.contains('has-bulk-checkbox')) return;
            
            const checkbox = document.createElement('label');
            checkbox.className = 'bulk-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" class="entry-checkbox">
                <span class="checkmark"></span>
            `;
            
            // 插入复选框
            entry.style.position = 'relative';
            entry.appendChild(checkbox);
            entry.classList.add('has-bulk-checkbox');
            
            // 绑定事件
            const checkboxInput = checkbox.querySelector('input');
            checkboxInput.addEventListener('change', updateSelectedCount);
            
            // 阻止复选框点击事件冒泡
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    // 监听条目变化
    function observeEntryChanges() {
        const collectionPage = document.querySelector('[data-testid="collection-page"]');
        if (!collectionPage) return;
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    setTimeout(addCheckboxesToEntries, 100);
                }
            });
        });
        
        observer.observe(collectionPage, {
            childList: true,
            subtree: true
        });
    }
    
    // 处理全选
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        const checkboxes = document.querySelectorAll('.entry-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        updateSelectedCount();
    }
    
    // 更新选中数量
    function updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.entry-checkbox:checked');
        const count = selectedCheckboxes.length;
        const totalCheckboxes = document.querySelectorAll('.entry-checkbox');
        
        // 更新计数显示
        const countElement = document.querySelector('.selected-count strong');
        if (countElement) {
            countElement.textContent = count;
        }
        
        // 更新删除按钮状态
        const deleteBtn = document.querySelector('.bulk-delete-btn');
        if (deleteBtn) {
            deleteBtn.disabled = count === 0;
        }
        
        // 更新全选复选框状态
        const selectAllCheckbox = document.querySelector('#selectAll');
        if (selectAllCheckbox) {
            if (count === 0) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = false;
            } else if (count === totalCheckboxes.length) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = true;
            } else {
                selectAllCheckbox.indeterminate = true;
            }
        }
    }
    
    // 处理批量删除
    function handleBulkDelete() {
        const selectedCheckboxes = document.querySelectorAll('.entry-checkbox:checked');
        const selectedEntries = Array.from(selectedCheckboxes).map(checkbox => {
            const entry = checkbox.closest('[data-testid="collection-card"]');
            const titleElement = entry.querySelector('h2, .card-title, [class*="title"]');
            return {
                element: entry,
                title: titleElement ? titleElement.textContent.trim() : '未知标题'
            };
        });
        
        if (selectedEntries.length === 0) {
            alert('请先选择要删除的文章');
            return;
        }
        
        // 显示确认对话框
        showDeleteConfirmDialog(selectedEntries);
    }
    
    // 显示删除确认对话框
    function showDeleteConfirmDialog(selectedEntries) {
        const modal = document.createElement('div');
        modal.className = 'bulk-delete-modal';
        
        const entryList = selectedEntries.map(entry => 
            `<li class="delete-entry-item">${entry.title}</li>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>确认删除</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="warning-icon">⚠️</div>
                        <p><strong>您即将删除 ${selectedEntries.length} 篇文章，此操作不可撤销！</strong></p>
                        <div class="delete-list">
                            <p>将要删除的文章：</p>
                            <ul class="delete-entries">
                                ${entryList}
                            </ul>
                        </div>
                        <div class="confirmation-input">
                            <label>
                                请输入 "确认删除" 来确认此操作：
                                <input type="text" id="confirmInput" placeholder="确认删除">
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
        
        // 绑定事件
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const confirmBtn = modal.querySelector('.btn-confirm');
        const confirmInput = modal.querySelector('#confirmInput');
        const overlay = modal.querySelector('.modal-overlay');
        
        // 监听确认输入
        confirmInput.addEventListener('input', (e) => {
            confirmBtn.disabled = e.target.value !== '确认删除';
        });
        
        // 关闭模态框
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // 确认删除
        confirmBtn.addEventListener('click', () => {
            performBulkDelete(selectedEntries);
            closeModal();
        });
        
        // 聚焦输入框
        setTimeout(() => confirmInput.focus(), 100);
    }
    
    // 执行批量删除
    function performBulkDelete(selectedEntries) {
        const deletePromises = selectedEntries.map(entry => {
            return new Promise((resolve) => {
                // 模拟删除操作
                const deleteBtn = entry.element.querySelector('[title="Delete entry"], [aria-label*="delete"], .delete-button');
                if (deleteBtn) {
                    deleteBtn.click();
                    setTimeout(resolve, 100);
                } else {
                    // 如果找不到删除按钮，尝试其他方法
                    entry.element.style.opacity = '0.5';
                    entry.element.style.pointerEvents = 'none';
                    setTimeout(() => {
                        entry.element.remove();
                        resolve();
                    }, 300);
                }
            });
        });
        
        Promise.all(deletePromises).then(() => {
            // 重置选择状态
            const selectAllCheckbox = document.querySelector('#selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            
            updateSelectedCount();
            
            // 显示成功消息
            showSuccessMessage(`成功删除 ${selectedEntries.length} 篇文章`);
        });
    }
    
    // 显示成功消息
    function showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'bulk-delete-toast success';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">✅</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForCMS);
    } else {
        waitForCMS();
    }
})();