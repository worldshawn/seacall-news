// NewSeaCall News 引流效果追踪
(function() {
    'use strict';

    // 防止重复初始化
    if (window.newseacallAnalyticsInitialized) {
        return;
    }
    window.newseacallAnalyticsInitialized = true;

    // 配置
    const config = {
        // 生产环境下的API端点 - 临时禁用
        apiEndpoint: 'https://api.newseacall.com/analytics/track',
        // 本地测试时使用 console.log
        debugMode: true, // 临时强制开启debug模式
        // 批量发送配置
        batchSize: 10,
        batchTimeout: 30000 // 30秒
    };

    // 事件队列
    let eventQueue = [];
    let batchTimer = null;

    // 用户会话信息
    const sessionInfo = {
        sessionId: generateSessionId(),
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        currentPage: window.location.pathname
    };

    // 生成会话ID
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 获取用户指纹（简化版）
    function getUserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('NewSeaCall Analytics', 2, 2);
        
        return {
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            canvas: canvas.toDataURL().slice(-50), // 取后50个字符
            platform: navigator.platform
        };
    }

    // 发送事件到服务器
    function sendEvent(eventData) {
        if (config.debugMode) {
            console.log('📊 Analytics Event:', eventData);
            return;
        }

        // 添加到队列
        eventQueue.push(eventData);

        // 立即发送重要事件
        if (eventData.priority === 'high') {
            flushEvents();
        } else {
            // 批量发送
            scheduleFlush();
        }
    }

    // 安排批量发送
    function scheduleFlush() {
        if (batchTimer) return;

        batchTimer = setTimeout(() => {
            flushEvents();
        }, config.batchTimeout);

        // 队列满时立即发送
        if (eventQueue.length >= config.batchSize) {
            clearTimeout(batchTimer);
            batchTimer = null;
            flushEvents();
        }
    }

    // 发送所有排队的事件
    function flushEvents() {
        if (eventQueue.length === 0) return;

        const events = eventQueue.splice(0);
        
        // 使用 sendBeacon 确保数据发送
        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                config.apiEndpoint,
                JSON.stringify({
                    events: events,
                    session: sessionInfo,
                    fingerprint: getUserFingerprint(),
                    timestamp: new Date().toISOString()
                })
            );
        } else {
            // 备用方案：fetch
            fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: events,
                    session: sessionInfo,
                    fingerprint: getUserFingerprint(),
                    timestamp: new Date().toISOString()
                }),
                keepalive: true
            }).catch(err => {
                console.warn('Analytics sending failed:', err);
            });
        }

        if (batchTimer) {
            clearTimeout(batchTimer);
            batchTimer = null;
        }
    }

    // 创建基础事件数据
    function createBaseEvent(action, data = {}) {
        return {
            action: action,
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...data
        };
    }

    // 核心追踪函数
    window.trackCTAClick = function(type, source, additional = {}) {
        const eventData = createBaseEvent('cta_click', {
            cta_type: type,
            cta_source: source,
            priority: 'high', // CTA点击是高优先级事件
            conversion_value: type === 'ai_analysis' ? 10 : 5, // 分析页面价值更高
            ...additional
        });

        sendEvent(eventData);

        // 发送给Google Analytics（如果已配置）
        if (typeof gtag === 'function') {
            gtag('event', 'cta_click', {
                'event_category': 'Conversion',
                'event_label': type,
                'value': 1,
                'custom_parameter_1': source
            });
        }

        // 记录到本地存储（用于后续分析）
        const ctaHistory = JSON.parse(localStorage.getItem('newseacall_cta_history') || '[]');
        ctaHistory.push({
            type: type,
            source: source,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        
        // 只保留最近50次点击记录
        if (ctaHistory.length > 50) {
            ctaHistory.splice(0, ctaHistory.length - 50);
        }
        
        localStorage.setItem('newseacall_cta_history', JSON.stringify(ctaHistory));
    };

    // 页面浏览追踪
    function trackPageView() {
        const eventData = createBaseEvent('page_view', {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            scroll_position: 0,
            load_time: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : null
        });

        sendEvent(eventData);
    }

    // 滚动深度追踪
    function initScrollTracking() {
        const scrollDepths = [25, 50, 75, 90, 100];
        const tracked = new Set();
        let maxScroll = 0;

        function trackScroll() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            maxScroll = Math.max(maxScroll, scrollPercent);

            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !tracked.has(depth)) {
                    tracked.add(depth);
                    
                    const eventData = createBaseEvent('scroll_depth', {
                        depth_percent: depth,
                        max_scroll: maxScroll,
                        time_on_page: (Date.now() - sessionInfo.startTime) / 1000
                    });

                    sendEvent(eventData);
                }
            });
        }

        // 节流滚动事件
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            if (scrollTimer) return;
            scrollTimer = setTimeout(() => {
                trackScroll();
                scrollTimer = null;
            }, 100);
        });
    }

    // 页面停留时间追踪
    function initTimeTracking() {
        let trackingStartTime = Date.now();
        let timeSpent = 0;

        function updateTimeSpent() {
            timeSpent = Math.round((Date.now() - trackingStartTime) / 1000);
        }

        function trackTimeSpent() {
            updateTimeSpent();
            
            if (timeSpent >= 10) { // 只追踪停留超过10秒的用户
                const eventData = createBaseEvent('time_on_page', {
                    time_spent: timeSpent,
                    engagement_level: timeSpent < 30 ? 'low' : timeSpent < 120 ? 'medium' : 'high'
                });

                sendEvent(eventData);
            }
        }

        // 页面卸载时追踪
        window.addEventListener('beforeunload', trackTimeSpent);
        
        // 页面隐藏时追踪（用户切换标签页等）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackTimeSpent();
            } else {
                trackingStartTime = Date.now(); // 重新开始计时
            }
        });

        // 30秒后追踪一次（证明用户有一定程度的参与）
        setTimeout(trackTimeSpent, 30000);
    }

    // 搜索行为追踪
    function initSearchTracking() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    const eventData = createBaseEvent('search', {
                        search_query: query,
                        search_source: 'header_search'
                    });

                    sendEvent(eventData);
                }
            });
        }
    }

    // 外链点击追踪
    function initExternalLinkTracking() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            
            if (link && link.hostname !== window.location.hostname) {
                const eventData = createBaseEvent('external_link_click', {
                    link_url: link.href,
                    link_text: link.textContent.trim().substring(0, 100),
                    link_source: 'news_content'
                });

                sendEvent(eventData);
            }
        });
    }

    // 错误追踪
    function initErrorTracking() {
        window.addEventListener('error', (e) => {
            const eventData = createBaseEvent('javascript_error', {
                error_message: e.message,
                error_filename: e.filename,
                error_line: e.lineno,
                error_column: e.colno,
                priority: 'high'
            });

            sendEvent(eventData);
        });

        // 未捕获的Promise错误
        window.addEventListener('unhandledrejection', (e) => {
            const eventData = createBaseEvent('promise_rejection', {
                error_reason: e.reason ? e.reason.toString() : 'Unknown',
                priority: 'high'
            });

            sendEvent(eventData);
        });
    }

    // 性能指标追踪
    function trackPerformanceMetrics() {
        // 等待页面完全加载
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const navigation = performance.navigation;

                const metrics = {
                    dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp_connect: timing.connectEnd - timing.connectStart,
                    request_response: timing.responseEnd - timing.requestStart,
                    dom_processing: timing.domComplete - timing.domLoading,
                    page_load: timing.loadEventEnd - timing.navigationStart,
                    navigation_type: navigation.type // 0: navigate, 1: reload, 2: back_forward
                };

                const eventData = createBaseEvent('performance_metrics', metrics);
                sendEvent(eventData);
            }, 1000);
        });
    }

    // 引流效果分析
    function analyzeTrafficSource() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');

        if (utmSource || utmMedium || utmCampaign) {
            const eventData = createBaseEvent('utm_tracking', {
                utm_source: utmSource,
                utm_medium: utmMedium,
                utm_campaign: utmCampaign,
                landing_page: window.location.pathname,
                priority: 'high'
            });

            sendEvent(eventData);
        }
    }

    // 用户设备信息追踪
    function trackDeviceInfo() {
        const eventData = createBaseEvent('device_info', {
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            device_pixel_ratio: window.devicePixelRatio,
            color_depth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        });

        sendEvent(eventData);
    }

    // 初始化所有追踪功能
    function initTracking() {
        // 基础追踪
        trackPageView();
        trackDeviceInfo();
        analyzeTrafficSource();
        
        // 行为追踪
        initScrollTracking();
        initTimeTracking();
        initSearchTracking();
        initExternalLinkTracking();
        
        // 技术追踪
        initErrorTracking();
        trackPerformanceMetrics();

        console.log('🎯 NewSeaCall Analytics initialized');
    }

    // 页面卸载时确保所有事件都被发送
    window.addEventListener('beforeunload', () => {
        flushEvents();
    });

    // 页面隐藏时也发送事件（移动端用户切换应用等）
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flushEvents();
        }
    });

    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

})();