/* ========================================
   meridian.js - 面部经络互动功能
   ======================================== */

// 面部点位点击事件初始化
function initMeridianPoints() {
    document.querySelectorAll('.stroke-point').forEach(point => {
        point.addEventListener('click', function() {
            const pointType = this.dataset.point;

            // 获取当前语言
            const activeLang = document.querySelector('.lang-btn.active').dataset.lang;

            // 更新显示信息
            const currentPointEl = document.getElementById('current-point');
            currentPointEl.textContent = this.querySelector('.point-label').textContent;
            currentPointEl.dataset.activePoint = pointType; // 记录当前激活的点位

            document.getElementById('point-desc').innerHTML = pointInfo[pointType][activeLang];

            // 更新多语言显示
            document.getElementById('hi-text').textContent =
                pointInfo[pointType]['hi'].split('<br>')[0];
            document.getElementById('en-text').textContent =
                pointInfo[pointType]['en'].split('<br>')[0];

            // 点击效果
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1.2)';
            }, 300);

            // 添加波纹效果
            createRipple(this);
        });
    });
}

// 创建波纹效果
function createRipple(element) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.background = 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)';
    ripple.style.borderRadius = '50%';
    ripple.style.top = '50%';
    ripple.style.left = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s linear';

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// 更新面部点位信息（语言切换时调用）
function updateMeridianInfo(lang) {
    const activePointEl = document.getElementById('current-point');
    if (activePointEl.dataset.activePoint) {
        const pointType = activePointEl.dataset.activePoint;
        document.getElementById('point-desc').innerHTML = pointInfo[pointType][lang];
    }
}
