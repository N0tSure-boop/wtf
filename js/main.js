/* ========================================
   main.js - 主逻辑
   ======================================== */

// 添加Font Awesome图标
function loadFontAwesome() {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
}

// 语言切换函数
function switchLanguage(lang) {
    const t = translations[lang];

    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            // 特殊处理跳跃文字
            if (key === 'makeupHint') {
                const letters = makeupHintTexts[lang];
                el.innerHTML = letters.map((char, i) =>
                    `<span style="animation-delay: ${i * 0.1}s;">${char}</span>`
                ).join('');
            }
            // 特殊处理摄像头按钮（保留图标）
            else if (key === 'openCamera') {
                el.innerHTML = t[key];
            }
            else {
                el.textContent = t[key];
            }
        }
    });

    // 更新页面语言属性
    document.documentElement.lang = lang === 'zh' ? 'zh' : (lang === 'hi' ? 'hi' : 'en');

    // 更新面部点位的默认提示
    const currentPoint = document.getElementById('current-point');
    const pointDesc = document.getElementById('point-desc');
    if (!currentPoint.dataset.activePoint) {
        currentPoint.textContent = t.clickPoint;
        pointDesc.textContent = t.pointDescDefault;
    }

    // 更新当前激活的面部点位信息
    updateMeridianInfo(lang);
}

// 初始化语言切换
function initLanguageSwitch() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            langButtons.forEach(b => b.classList.remove('active'));
            // 添加当前激活状态
            this.classList.add('active');

            // 获取选中的语言
            const selectedLang = this.dataset.lang;

            // 切换语言
            switchLanguage(selectedLang);
        });
    });
}

// 初始化滚动到顶部按钮
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 初始化模块动画
function initModuleAnimations() {
    setTimeout(() => {
        document.querySelectorAll('.module').forEach((module, index) => {
            module.style.animationDelay = `${index * 0.1 + 0.2}s`;
        });
    }, 500);
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载图标库
    loadFontAwesome();

    // 初始化各模块
    initLanguageSwitch();
    initMeridianPoints();
    initCamera();
    initScrollTop();
    initModuleAnimations();
});
