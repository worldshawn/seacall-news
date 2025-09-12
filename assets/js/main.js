// NewSeaCall News 网站交互功能
(function() {
    'use strict';

    // 防止重复初始化
    if (window.newseacallMainInitialized) {
        return;
    }
    window.newseacallMainInitialized = true;

    // DOM 元素
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const backToTop = document.getElementById('back-to-top');

    // 移动端导航切换
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // 动画效果
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        });

        // 点击导航链接时关闭菜单
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });
    }

    // 搜索功能
    if (searchInput && searchBtn) {
        // 简单的客户端搜索
        function performSearch(query) {
            if (!query.trim()) return [];

            // 从页面上的新闻标题和内容中搜索
            const newsItems = document.querySelectorAll('.news-item, .featured-item');
            const results = [];

            newsItems.forEach(item => {
                const title = item.querySelector('.news-title, .featured-title');
                const excerpt = item.querySelector('.news-excerpt, .featured-excerpt');
                const link = title ? title.querySelector('a') : null;

                if (title && link) {
                    const titleText = title.textContent.toLowerCase();
                    const excerptText = excerpt ? excerpt.textContent.toLowerCase() : '';
                    const searchQuery = query.toLowerCase();

                    if (titleText.includes(searchQuery) || excerptText.includes(searchQuery)) {
                        results.push({
                            title: title.textContent.trim(),
                            excerpt: excerptText.substring(0, 100) + '...',
                            url: link.href,
                            image: item.querySelector('img')?.src
                        });
                    }
                }
            });

            return results;
        }

        function displaySearchResults(results, query) {
            const searchResults = document.getElementById('search-results');
            if (!searchResults) return;

            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        <p>没有找到包含"${query}"的内容</p>
                        <p class="search-tips">搜索建议：</p>
                        <ul class="search-tips">
                            <li>检查输入的关键词是否正确</li>
                            <li>尝试使用不同的关键词</li>
                            <li>使用更通用的搜索词</li>
                        </ul>
                    </div>
                `;
                return;
            }

            const resultsHTML = results.map(result => `
                <div class="search-result-item">
                    ${result.image ? `<img src="${result.image}" alt="${result.title}" class="result-image">` : ''}
                    <div class="result-content">
                        <h4><a href="${result.url}">${result.title}</a></h4>
                        <p>${result.excerpt}</p>
                    </div>
                </div>
            `).join('');

            searchResults.innerHTML = `
                <div class="search-summary">
                    <p>找到 ${results.length} 条相关结果</p>
                </div>
                ${resultsHTML}
            `;
        }

        // 搜索事件
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                const results = performSearch(query);
                displaySearchResults(results, query);
                if (searchOverlay) {
                    searchOverlay.classList.add('active');
                }
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });

        // 关闭搜索
        if (closeSearch && searchOverlay) {
            closeSearch.addEventListener('click', function() {
                searchOverlay.classList.remove('active');
            });

            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.remove('active');
                }
            });
        }
    }

    // 回到顶部功能
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 图片懒加载
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.src; // 触发加载
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // 平滑滚动到锚点
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // 外链新窗口打开
    function initExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        
        links.forEach(link => {
            if (!link.hostname.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    // 页面加载进度条
    function showLoadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress < 90) {
                progressBar.style.width = progress + '%';
            } else {
                clearInterval(interval);
            }
        }, 100);

        window.addEventListener('load', () => {
            clearInterval(interval);
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.remove();
            }, 500);
        });
    }

    // 文章阅读时间估算
    function calculateReadingTime() {
        const content = document.querySelector('.post-content');
        if (content) {
            const text = content.textContent;
            const wordsPerMinute = 200; // 中文约200字/分钟
            const words = text.length;
            const readingTime = Math.ceil(words / wordsPerMinute);
            
            // 添加阅读时间显示
            const postMeta = document.querySelector('.post-meta');
            if (postMeta) {
                const readingTimeEl = document.createElement('span');
                readingTimeEl.className = 'reading-time';
                readingTimeEl.innerHTML = `📖 约${readingTime}分钟阅读`;
                postMeta.appendChild(readingTimeEl);
            }
        }
    }

    // 打印样式优化
    function initPrintStyles() {
        window.addEventListener('beforeprint', function() {
            // 隐藏不需要打印的元素
            const hideElements = document.querySelectorAll('.site-header, .site-footer, .investment-cta, .post-share, .search-overlay');
            hideElements.forEach(el => {
                el.style.display = 'none';
            });
        });

        window.addEventListener('afterprint', function() {
            // 恢复隐藏的元素
            const hideElements = document.querySelectorAll('.site-header, .site-footer, .investment-cta, .post-share, .search-overlay');
            hideElements.forEach(el => {
                el.style.display = '';
            });
        });
    }

    // 键盘快捷键
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // ESC 关闭搜索覆盖层
            if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // 页面初始化
    function init() {
        // 只在非生产环境显示加载进度条
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            showLoadingProgress();
        }
        
        initLazyLoading();
        initSmoothScrolling();
        initExternalLinks();
        calculateReadingTime();
        initPrintStyles();
        initKeyboardShortcuts();
        
        console.log('NewSeaCall News 网站已初始化');
    }

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();