/* script.js — comportamento: dropdowns, modal, gráfico animado, conversor */

// DROPDOWNS
document.querySelectorAll('[data-dd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const key = btn.getAttribute('data-dd');
        const el = document.getElementById('dd-' + key);
        // fechar outros
        document.querySelectorAll('.dropdown').forEach(d => { if (d !== el) d.style.display = 'none'; });
        el.style.display = (el.style.display === 'block') ? 'none' : 'block';
        e.stopPropagation();
    });
});

// fecha ao clicar fora
window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    }
});

// MODAL VISUAL
const modal = document.getElementById('modalVisual');
const openVisual = document.getElementById('openVisual');
const closeVisual = document.getElementById('closeVisual');
const closeVisual2 = document.getElementById('closeVisual2');

if (openVisual) {
    openVisual.addEventListener('click', () => { if (modal) modal.style.display = 'flex'; });
}
if (closeVisual) {
    closeVisual.addEventListener('click', () => modal && (modal.style.display = 'none'));
}
if (closeVisual2) {
    closeVisual2.addEventListener('click', () => modal && (modal.style.display = 'none'));
}
if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

// PRINT (se houver)
const printBtn = document.getElementById('printBtn');
if (printBtn) printBtn.addEventListener('click', () => window.print());

// Alternar visual (procura ID visualArea)
const toggleVisualBtn = document.getElementById('toggleVisual');
if (toggleVisualBtn) {
    const visualPanel = document.getElementById('visualArea');
    toggleVisualBtn.addEventListener('click', () => {
        if (!visualPanel) return;
        visualPanel.style.display = (visualPanel.style.display === 'none') ? 'flex' : 'none';
    });
}

/* GRÁFICO DE SALÁRIOS - animação simples sem bibliotecas */
(function drawSalary() {
    const canvas = document.getElementById('salaryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    function resize() {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const labels = ['Python', 'JS/React', 'Java', 'Cloud', 'Data'];
    const values = [102, 88, 100, 120, 95]; // em milhares CAD (ex.: 102k)
    const maxVal = Math.max(...values) * 1.1;
    const padding = 28;

    // animação das barras
    let progress = 0;
    const duration = 900; // ms
    let start = null;
    function animate(ts) {
        if (!start) start = ts;
        progress = Math.min(1, (ts - start) / duration);
        render(progress);
        if (progress < 1) requestAnimationFrame(animate);
    }

    function render(t) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;
        const barW = chartW / (values.length * 1.6);

        // clear
        ctx.clearRect(0, 0, w, h);

        // grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartH / 4) * i;
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(padding + chartW, y); ctx.stroke();
        }

        // bars
        values.forEach((v, i) => {
            const bx = padding + i * (barW * 1.6);
            const targetH = (v / maxVal) * chartH;
            const bh = targetH * t;
            const by = padding + (chartH - bh);

            // shadow fill
            ctx.fillStyle = 'rgba(11,102,195,0.18)';
            roundRect(ctx, bx, by, barW, bh, 8, true, false);

            // label
            ctx.fillStyle = '#e6f0ff';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], bx + barW / 2, padding + chartH + 18);

            // value
            ctx.fillStyle = '#00d1c1';
            ctx.font = '600 12px system-ui';
            ctx.fillText('CAD ' + v + 'k', bx + barW / 2, by - 8);
        });
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    requestAnimationFrame(animate);
})();

// Simulador CAD -> BRL exemplo
const convertBtn = document.getElementById('convertBtn');
if (convertBtn) {
    convertBtn.addEventListener('click', () => {
        const rateInput = document.getElementById('rate');
        const rate = parseFloat(rateInput.value) || 3.1;
        const exampleSalary = 100000; // CAD
        const brl = Math.round((exampleSalary * rate) * 100) / 100;
        const el = document.getElementById('simResult');
        if (el) el.textContent = `Exemplo: CAD ${exampleSalary.toLocaleString()} ≈ BRL ${brl.toLocaleString()}`;
    });
}

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
