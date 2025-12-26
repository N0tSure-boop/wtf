/* ========================================
   camera.js - AR试妆/摄像头功能 (优化版)
   ======================================== */

// 全局变量
let cameraActive = false;
let currentMakeup = 'tang';
let stream = null;
let animationId = null;

// 初始化AR试妆系统
function initCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const placeholder = document.getElementById('placeholder');
    const toggleCameraBtn = document.getElementById('toggleCamera');
    const makeupButtons = document.querySelectorAll('.makeup-btn');

    // 设置画布尺寸
    canvas.width = 320;
    canvas.height = 320;

    // 摄像头控制
    toggleCameraBtn.addEventListener('click', async () => {
        const t = getT();
        if (!cameraActive) {
            try {
                // 尝试获取高清流
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 }, // 请求更高分辨率以获得更好的清晰度
                        height: { ideal: 640 }
                    }
                });

                video.srcObject = stream;
                placeholder.style.display = 'none';
                video.style.display = 'block';
                toggleCameraBtn.innerHTML = t.closeCamera;
                cameraActive = true;

                // 开始渲染循环
                renderLoop(ctx, canvas);

            } catch (err) {
                console.error("Camera Error:", err);
                // 模拟模式
                placeholder.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">👤</div>
                        <p>${t.simulateMode}</p>
                        <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">${t.currentMakeup}: ${getMakeupName(currentMakeup)}</p>
                    </div>
                `;
                toggleCameraBtn.innerHTML = t.simulateMode;
                cameraActive = true;
                // 即使是模拟模式，也运行渲染循环以展示妆容效果
                renderLoop(ctx, canvas);
            }
        } else {
            // 关闭摄像头
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            video.style.display = 'none';
            placeholder.style.display = 'flex';

            // 恢复初始提示
            placeholder.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📱</div>
                    <p>${t.clickToOpen}</p>
                    <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">${t.experienceCulture}</p>
                </div>
            `;
            toggleCameraBtn.innerHTML = t.openCamera;
            cameraActive = false;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    // 妆容选择
    makeupButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            makeupButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMakeup = btn.dataset.makeup;

            // 如果在模拟模式下，更新文字提示
            if (cameraActive && !stream) {
                const t = getT();
                // 简单更新提示，实际绘制由 loop 处理
                const currentName = getMakeupName(currentMakeup);
            }
        });
    });
}

// 获取妆容名称
function getMakeupName(type) {
    const lang = document.querySelector('.lang-btn.active').dataset.lang;
    const names = {
        zh: { 'tang': '唐代花钿妆', 'egypt': '埃及眼线妆', 'fusion': '融合妆容', 'none': '无妆容' },
        en: { 'tang': 'Tang Dynasty', 'egypt': 'Egyptian Kohl', 'fusion': 'Fusion Look', 'none': 'No Makeup' },
        hi: { 'tang': 'तांग राजवंश', 'egypt': 'मिस्री शैली', 'fusion': 'फ्यूजन लुक', 'none': 'कोई मेकअप नहीं' }
    };
    return names[lang] ? names[lang][type] : type;
}

// 渲染循环
function renderLoop(ctx, canvas) {
    if (!cameraActive) return;

    drawScene(ctx, canvas);
    animationId = requestAnimationFrame(() => renderLoop(ctx, canvas));
}

// 主绘制函数
function drawScene(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 1. 绘制面部对位引导 (帮助用户找准位置，解决"假"的关键)
    if (currentMakeup !== 'none') {
        drawFaceGuide(ctx, centerX, centerY);
    }

    // 2. 根据类型绘制妆容
    if (currentMakeup === 'tang') {
        drawTangMakeup(ctx, centerX, centerY);
    } else if (currentMakeup === 'egypt') {
        drawEgyptMakeup(ctx, centerX, centerY);
    } else if (currentMakeup === 'fusion') {
        drawTangMakeup(ctx, centerX, centerY); // 融合妆：唐妆底
        drawEgyptEyes(ctx, centerX, centerY);  // 叠加埃及眼妆
    }
}

// 绘制面部引导线
function drawFaceGuide(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 虚线

    // 脸部轮廓
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 110, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 眼睛参考线
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 60, y - 20);
    ctx.lineTo(x + 60, y - 20);
    ctx.stroke();

    // 提示文字
    ctx.font = '12px Microsoft YaHei';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('请将面部对准虚线框', x, y + 140);

    ctx.restore();
}

// 绘制唐代妆容 (优化：使用混合模式和渐变)
function drawTangMakeup(ctx, x, y) {
    ctx.save();

    // 1. 面靥 (腮红) - 使用 Multiply 混合模式模拟真实腮红渗入皮肤的效果
    ctx.globalCompositeOperation = 'multiply';
    // 左腮红
    const blushL = ctx.createRadialGradient(x - 50, y + 20, 0, x - 50, y + 20, 35);
    blushL.addColorStop(0, 'rgba(255, 100, 120, 0.4)'); // 中心浓
    blushL.addColorStop(1, 'rgba(255, 100, 120, 0)');   // 边缘淡化
    ctx.fillStyle = blushL;
    ctx.beginPath();
    ctx.ellipse(x - 50, y + 20, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 右腮红
    const blushR = ctx.createRadialGradient(x + 50, y + 20, 0, x + 50, y + 20, 35);
    blushR.addColorStop(0, 'rgba(255, 100, 120, 0.4)');
    blushR.addColorStop(1, 'rgba(255, 100, 120, 0)');
    ctx.fillStyle = blushR;
    ctx.beginPath();
    ctx.ellipse(x + 50, y + 20, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 花钿 (额头) - 使用 source-over 但添加阴影增加立体感
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#D81E06';

    // 绘制梅花形花钿 (比简单的圆更真实)
    drawFlowerShape(ctx, x, y - 60, 10);

    // 3. 点唇 (嘴唇) - 使用 Soft-light 柔光混合
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(200, 20, 20, 0.8)';
    ctx.beginPath();
    // 蝴蝶唇形
    ctx.moveTo(x, y + 55);
    ctx.bezierCurveTo(x - 10, y + 50, x - 15, y + 60, x, y + 70);
    ctx.bezierCurveTo(x + 15, y + 60, x + 10, y + 50, x, y + 55);
    ctx.fill();

    ctx.restore();
}

// 绘制花朵形状辅助函数
function drawFlowerShape(ctx, x, y, size) {
    ctx.beginPath();
    // 上花瓣
    ctx.ellipse(x, y - size, size / 1.5, size, 0, 0, Math.PI * 2);
    // 下花瓣
    ctx.ellipse(x, y + size, size / 1.5, size, 0, 0, Math.PI * 2);
    // 左花瓣
    ctx.ellipse(x - size, y, size, size / 1.5, 0, 0, Math.PI * 2);
    // 右花瓣
    ctx.ellipse(x + size, y, size, size / 1.5, 0, 0, Math.PI * 2);
    // 中心花蕊
    ctx.fillStyle = '#FFD700'; // 金色花蕊
    ctx.ellipse(x, y, size / 2, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 恢复红色
    ctx.fillStyle = '#D81E06';
    ctx.globalCompositeOperation = 'source-over'; // 确保花瓣覆盖
}

// 绘制埃及妆容
function drawEgyptMakeup(ctx, x, y) {
    drawEgyptEyes(ctx, x, y);
    // 埃及也可以有唇彩，用金色叠加
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.3)'; // 金色微光
    ctx.beginPath();
    ctx.ellipse(x, y + 60, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// 绘制埃及眼妆 (独立出来方便融合妆调用)
function drawEgyptEyes(ctx, x, y) {
    ctx.save();

    // 1. 眼影 (孔雀石绿) - 使用 Overlay 叠加模式
    ctx.globalCompositeOperation = 'overlay';
    const eyeShadowGradient = ctx.createLinearGradient(x - 60, y - 40, x + 60, y - 40);
    eyeShadowGradient.addColorStop(0, 'rgba(0, 100, 0, 0.0)');
    eyeShadowGradient.addColorStop(0.2, 'rgba(0, 168, 107, 0.5)'); // 孔雀石绿
    eyeShadowGradient.addColorStop(0.8, 'rgba(0, 168, 107, 0.5)');
    eyeShadowGradient.addColorStop(1, 'rgba(0, 100, 0, 0.0)');

    ctx.fillStyle = eyeShadowGradient;
    ctx.filter = 'blur(2px)'; // 模糊滤镜，模拟粉末晕染
    ctx.beginPath();
    ctx.rect(x - 50, y - 50, 100, 25);
    ctx.fill();

    // 2. 眼线 (Kohl) - 深黑色，边缘锐利
    ctx.filter = 'none'; // 关闭模糊
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#0F0F0F';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 左眼 (荷鲁斯之眼风格)
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 20); // 内眼角
    ctx.quadraticCurveTo(x - 30, y - 28, x - 45, y - 22); // 上眼线
    ctx.quadraticCurveTo(x - 60, y - 25, x - 70, y - 30); // 眼尾上挑延伸
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 15, y - 20); // 内眼角
    ctx.quadraticCurveTo(x - 30, y - 12, x - 45, y - 22); // 下眼线
    ctx.lineTo(x - 65, y - 22); // 下眼线平拉延伸
    ctx.stroke();

    // 右眼 (镜像)
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 20);
    ctx.quadraticCurveTo(x + 30, y - 28, x + 45, y - 22);
    ctx.quadraticCurveTo(x + 60, y - 25, x + 70, y - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 15, y - 20);
    ctx.quadraticCurveTo(x + 30, y - 12, x + 45, y - 22);
    ctx.lineTo(x + 65, y - 22);
    ctx.stroke();

    ctx.restore();
}