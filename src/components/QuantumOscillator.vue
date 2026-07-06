<template>
    <div class="quantum-oscillator">
        <div class="controls">
            <label>
                能级 n =
                <input type="range" min="0" max="5" v-model.number="n" @input="updatePlot" />
                <span class="n-value">{{ n }}</span>
            </label>
            <label class="auto-toggle">
                <input type="checkbox" v-model="autoPlay" />
                自动切换
            </label>
        </div>
        <canvas ref="canvas" width="700" height="420"></canvas>
        <p class="caption">
            图: 一维量子谐振子的波函数 $\psi_n(x)$（蓝色实线）与概率密度 $|\psi_n(x)|^2$（紫色填充）。
            虚线为经典转折点 $x = \pm\sqrt{2n+1}$。
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

const canvas = ref(null);
const n = ref(0);
const autoPlay = ref(true);
let animId = null;
let autoTimer = null;

// Hermite 多项式递推: H_{n+1} = 2x H_n - 2n H_{n-1}
function hermite(n, x) {
    if (n === 0) return 1;
    if (n === 1) return 2 * x;
    let h0 = 1, h1 = 2 * x;
    for (let k = 1; k < n; k++) {
        [h0, h1] = [h1, 2 * x * h1 - 2 * k * h0];
    }
    return h1;
}

function factorial(n) {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

// 归一化波函数
function psi(n, x) {
    const c = 1 / Math.sqrt(Math.pow(2, n) * factorial(n) * Math.sqrt(Math.PI));
    return c * Math.exp(-x * x / 2) * hermite(n, x);
}

function draw(ctx, w, h, nVal, t) {
    ctx.clearRect(0, 0, w, h);

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const pw = w - margin.left - margin.right;
    const ph = h - margin.top - margin.bottom;

    const xMin = -5, xMax = 5;
    const xToPx = (x) => margin.left + ((x - xMin) / (xMax - xMin)) * pw;
    const yMax = 0.9;
    const yToPy = (y) => margin.top + ph - ((y + yMax) / (2 * yMax)) * ph;

    // 坐标轴
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + ph);
    ctx.lineTo(margin.left + pw, margin.top + ph);
    ctx.stroke();

    // x 轴标签
    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = -4; i <= 4; i += 2) {
        ctx.fillText(i, xToPx(i), margin.top + ph + 18);
    }

    // 势能曲线 V(x) = ½ m ω² x² (取 m=ω=1)
    const classicalTurning = Math.sqrt(2 * nVal + 1);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xToPx(-classicalTurning), margin.top + ph);
    ctx.lineTo(xToPx(-classicalTurning), yToPy(0.75));
    ctx.moveTo(xToPx(classicalTurning), margin.top + ph);
    ctx.lineTo(xToPx(classicalTurning), yToPy(0.75));
    ctx.stroke();
    ctx.setLineDash([]);

    // 势能曲线
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= pw; i++) {
        const x = xMin + (i / pw) * (xMax - xMin);
        const y = 0.15 * x * x;
        const py = yToPy(Math.min(y, yMax));
        if (i === 0) ctx.moveTo(xToPx(x), py);
        else ctx.lineTo(xToPx(x), py);
    }
    ctx.stroke();

    // 能级线
    const E = nVal + 0.5;
    ctx.strokeStyle = '#c44';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(xToPx(-classicalTurning), yToPy(E / 8));
    ctx.lineTo(xToPx(classicalTurning), yToPy(E / 8));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#c44';
    ctx.textAlign = 'left';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText(`E_${nVal}=${(E).toFixed(1)}ℏω`, xToPx(classicalTurning) + 4, yToPy(E / 8) + 4);

    // 概率密度 |ψ|² (填充)
    ctx.fillStyle = 'rgba(128, 0, 200, 0.18)';
    ctx.beginPath();
    const zeroY = yToPy(0);
    ctx.moveTo(xToPx(xMin), zeroY);
    for (let i = 0; i <= pw; i++) {
        const x = xMin + (i / pw) * (xMax - xMin);
        const p = psi(nVal, x) ** 2;
        ctx.lineTo(xToPx(x), yToPy(p * 1.1));
    }
    ctx.lineTo(xToPx(xMax), zeroY);
    ctx.closePath();
    ctx.fill();

    // 波函数 ψ(x)
    ctx.strokeStyle = '#2266cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= pw; i++) {
        const x = xMin + (i / pw) * (xMax - xMin);
        const y = psi(nVal, x);
        if (i === 0) ctx.moveTo(xToPx(x), yToPy(y));
        else ctx.lineTo(xToPx(x), yToPy(y));
    }
    ctx.stroke();

    // 标记经典转折点
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`−√2n+1`, xToPx(-classicalTurning), margin.top + ph + 6);
    ctx.fillText(`+√2n+1`, xToPx(classicalTurning), margin.top + ph + 6);
}

function updatePlot() {
    const cvs = canvas.value;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;
    draw(ctx, w, h, n.value, 0);
}

onMounted(() => {
    updatePlot();

    if (autoPlay.value) {
        autoTimer = setInterval(() => {
            n.value = (n.value + 1) % 6;
        }, 2500);
    }
});

watch(autoPlay, (v) => {
    if (v) {
        autoTimer = setInterval(() => {
            n.value = (n.value + 1) % 6;
        }, 2500);
    } else {
        clearInterval(autoTimer);
        autoTimer = null;
    }
});

watch(n, () => updatePlot());

onUnmounted(() => {
    clearInterval(autoTimer);
});
</script>

<style scoped>
.quantum-oscillator {
    margin: 2rem 0;
    text-align: center;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: #444;
}

.controls label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
}

.controls input[type="range"] {
    width: 120px;
    accent-color: #2266cc;
}

.n-value {
    display: inline-block;
    width: 20px;
    font-weight: bold;
    color: #2266cc;
}

.auto-toggle {
    color: #888;
}

canvas {
    max-width: 100%;
    height: auto;
}

.caption {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.5rem;
}
</style>
