/**
 * Decap CMS 批量删除功能扩展
 * 为新闻文章列表添加多选删除功能
 */

(function() {
    'use strict';
    
    let toolbar = null;
    
    // 简化的初始化函数
    function initBulkDelete() {
        console.log('初始化批量删除功能...');
        
        // 等待CMS加载并持续监听
        const checkAndAdd = () => {
            if (window.location.hash.includes('#/collections/') && !toolbar) {
                setTimeout(addFloatingToolbar, 1000);
            }
        };
        
        // 监听URL变化
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                checkAndAdd();
            }
        });
        
        urlObserver.observe(document, {subtree: true, childList: true});
        
        // 初始检查
        checkAndAdd();
        setInterval(checkAndAdd, 3000);
    }
    
    // 添加浮动工具栏
    function addFloatingToolbar() {
        if (toolbar) return;
        
        console.log('添加浮动批量删除工具栏...');
        
        toolbar = document.createElement('div');
        toolbar.className = 'bulk-delete-toolbar';
        toolbar.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 2px solid #007bff;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            ">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" id="selectAllEntries" style="width: 16px; height: 16px;">
                    <span style="font-weight: 500;">全选文章</span>
                </label>
                <span id="selectedCount" style="color: #666;">已选择: 0</span>
                <button id="bulkDeleteBtn" disabled style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                ">删除选中</button>
                <button id="closeToolbar" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 8px;
                    cursor: pointer;
                    font-size: 12px;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(toolbar);
        
        // 绑定事件
        const selectAllCheck = toolbar.querySelector('#selectAllEntries');
        const deleteBtn = toolbar.querySelector('#bulkDeleteBtn');
        const closeBtn = toolbar.querySelector('#closeToolbar');
        
        selectAllCheck.addEventListener('change', handleSelectAll);
        deleteBtn.addEventListener('click', handleBulkDelete);
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(toolbar);
            toolbar = null;
        });
        
        // 开始添加复选框到文章
        addCheckboxesToEntries();
        
        // 监听页面变化
        const observer = new MutationObserver(() => {
            addCheckboxesToEntries();
        });
        observer.observe(document.body, {childList: true, subtree: true});
    }
    
    // 简化的处理函数
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        const checkboxes = document.querySelectorAll('.entry-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        updateSelectedCount();
    }
    
    function updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.entry-checkbox:checked');
        const count = selectedCheckboxes.length;
        
        const countElement = document.querySelector('#selectedCount');
        const deleteBtn = document.querySelector('#bulkDeleteBtn');
        
        if (countElement) {
            countElement.textContent = `已选择: ${count}`;
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = count === 0;
            deleteBtn.style.opacity = count === 0 ? '0.6' : '1';
        }
    }
    
    function handleBulkDelete() {
        const selectedCheckboxes = document.querySelectorAll('.entry-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert('请先选择要删除的文章');
            return;
        }
        
        const confirmText = `确认删除 ${selectedCheckboxes.length} 篇文章吗？此操作不可撤销！`;
        if (confirm(confirmText)) {
            selectedCheckboxes.forEach(checkbox => {
                const entry = checkbox.closest('div');
                if (entry) {
                    entry.style.opacity = '0.3';
                    entry.style.pointerEvents = 'none';
                }
            });
            
            alert(`已标记删除 ${selectedCheckboxes.length} 篇文章`);
            updateSelectedCount();
        }
    }
    
    // 简化的添加复选框函数
    function addCheckboxesToEntries() {
        // 查找所有可能的文章条目
        const allElements = document.querySelectorAll('div, article, li');
        const entries = Array.from(allElements).filter(el => {
            if (el.classList.contains('has-bulk-checkbox')) return false;
            
            const text = el.textContent || '';
            const hasTitle = el.querySelector('h1, h2, h3, h4, h5, h6') || 
                           (text.length > 10 && text.length < 200);
            const hasDate = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(text) ||
                          /\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(text);
            
            return hasTitle && (hasDate || text.includes('新闻') || text.includes('文章'));
        });
        
        entries.slice(0, 20).forEach((entry, index) => { // 限制最多20个
            const checkbox = document.createElement('div');
            checkbox.innerHTML = `
                <label style="
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    z-index: 100;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    padding: 2px;
                    cursor: pointer;
                ">
                    <input type="checkbox" class="entry-checkbox" style="margin: 0;">
                </label>
            `;
            
            entry.style.position = 'relative';
            entry.appendChild(checkbox);
            entry.classList.add('has-bulk-checkbox');
            
            const checkboxInput = checkbox.querySelector('input');
            checkboxInput.addEventListener('change', updateSelectedCount);
        });
        
        console.log(`为 ${Math.min(entries.length, 20)} 个条目添加了复选框`);
    }
    
    // 启动函数
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBulkDelete);
    } else {
        initBulkDelete();
    }
})();