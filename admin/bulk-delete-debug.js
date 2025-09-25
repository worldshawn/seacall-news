/**
 * 批量删除功能调试版本
 * 用于诊断为什么批量删除功能不生效
 */
(function () {
  'use strict';

  console.log('🔍 批量删除调试脚本启动');

  // 检查页面基本信息
  function debugPageInfo() {
    console.log('📄 页面信息:');
    console.log('- URL:', window.location.href);
    console.log('- Hash:', window.location.hash);
    console.log('- Pathname:', window.location.pathname);
    console.log('- Title:', document.title);
  }

  // 检查DOM结构
  function debugDOMStructure() {
    console.log('🏗️ DOM结构检查:');
    
    // 检查常见的CMS容器
    const cmsContainers = [
      '.cms',
      '#nc-root',
      '[data-testid*="collection"]',
      '[class*="Collection"]',
      'main',
      '.main-content'
    ];
    
    cmsContainers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`- ${selector}: 找到 ${elements.length} 个元素`);
      if (elements.length > 0) {
        console.log('  元素:', elements[0]);
      }
    });
    
    // 检查可能的卡片元素
    const cardSelectors = [
      '[data-testid="collection-card"]',
      '[class*="card"]',
      '[class*="entry"]',
      'article',
      '.post',
      '[class*="item"]'
    ];
    
    console.log('📋 卡片元素检查:');
    cardSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`- ${selector}: 找到 ${elements.length} 个元素`);
      if (elements.length > 0) {
        console.log('  第一个元素:', elements[0]);
        console.log('  元素类名:', elements[0].className);
        console.log('  元素ID:', elements[0].id);
      }
    });
  }

  // 检查脚本加载状态
  function debugScriptStatus() {
    console.log('📜 脚本加载状态:');
    
    // 检查CSS文件
    const cssLink = document.querySelector('link[href*="bulk-delete.css"]');
    console.log('- CSS文件:', cssLink ? '已加载' : '未找到');
    
    // 检查JS文件
    const jsScripts = document.querySelectorAll('script[src*="bulk-delete"]');
    console.log('- JS文件数量:', jsScripts.length);
    jsScripts.forEach((script, index) => {
      console.log(`  脚本 ${index + 1}:`, script.src);
    });
  }

  // 检查控制台错误
  function debugConsoleErrors() {
    console.log('❌ 控制台错误检查:');
    
    // 重写console.error来捕获错误
    const originalError = console.error;
    console.error = function(...args) {
      console.log('🚨 捕获到错误:', ...args);
      originalError.apply(console, args);
    };
  }

  // 检查页面是否在管理界面
  function debugAdminDetection() {
    console.log('🔐 管理界面检测:');
    
    const hash = window.location.hash || '';
    const pathname = window.location.pathname || '';
    
    console.log('- 路径包含 /admin:', pathname.includes('/admin'));
    console.log('- Hash包含 #/collections/:', hash.includes('#/collections/'));
    console.log('- Hash包含 #/:', hash.includes('#/'));
    console.log('- 找到CMS容器:', !!document.querySelector('.cms'));
    console.log('- 找到nc-root:', !!document.querySelector('#nc-root'));
    console.log('- 找到collection元素:', !!document.querySelector('[data-testid*="collection"]'));
  }

  // 运行所有调试检查
  function runDebugChecks() {
    console.log('🚀 开始调试检查...');
    debugPageInfo();
    debugDOMStructure();
    debugScriptStatus();
    debugConsoleErrors();
    debugAdminDetection();
    console.log('✅ 调试检查完成');
    console.log('💡 如果批量删除功能正常工作，可以注释掉调试脚本');
  }

  // 立即运行调试检查
  runDebugChecks();

  // 延迟运行（等待页面完全加载）
  setTimeout(() => {
    console.log('⏰ 延迟调试检查（页面完全加载后）...');
    debugDOMStructure();
    debugAdminDetection();
  }, 2000);

  // 监听页面变化
  const observer = new MutationObserver(() => {
    console.log('🔄 页面发生变化，重新检查...');
    debugDOMStructure();
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

})();
