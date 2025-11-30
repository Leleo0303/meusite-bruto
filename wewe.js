// DROPDOWNS
document.querySelectorAll('[data-dd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const key = btn.getAttribute('data-dd');
        const el = document.getElementById('dd-' + key);
        document.querySelectorAll('.dropdown').forEach(d => { if (d !== el) d.style.display = 'none'; });
        el.style.display = (el.style.display === 'block') ? 'none' : 'block';
        e.stopPropagation();
    });
});
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
const mapGrid = document.getElementById('mapGrid');

const mapData = [
    { title: 'Documentação', text: 'Passaporte, antecedentes, traduções, comprovante financeiro.' },
    { title: 'Moradia', text: 'Mississauga, Brampton, Burnaby, Langley — casas 4–5 quartos.' },
    { title: 'Visto', text: 'Work Permit — Job Offer, LMIA (se aplicável), exames e antecedentes.' },
    { title: 'TI & Salários', text: 'Python, JS, Java, Cloud — faixas médias em CAD/ano.' }
];
function fillMap() {
    if (!mapGrid) return;
    mapGrid.innerHTML = '';
    mapData.forEach(m => {
        const n = document.createElement('div'); n.className = 'map-block card';
        n.innerHTML = `<h3>${m.title}</h3><p>${m.text}</p>`;
        mapGrid.appendChild(n);
    })
}
fillMap();

if (openVisual) openVisual.addEventListener('click', () => { if (modal) modal.style.display = 'flex'; });
if (closeVisual) closeVisual.addEventListener('click', () => modal && (modal.style.display = 'none'));
if (closeVisual2) closeVisual2.addEventListener('click', () => modal && (modal.style.display = 'none'));
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// LOADING OVERLAY (quando página é aberta)
window.addEventListener('load', () => {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    setTimeout(() => {
        overlay.style.transition = 'opacity .35s ease, transform .35s ease';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(.98)';
        setTimeout(() => overlay.style.display = 'none', 350);
    }, 900);
});

// IMAGENS REMOTAS (fallback para moradia)
function ensureRemoteImages() {
    const imgs = document.querySelectorAll('.image-grid img');
    const defaultImgs = [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60',
        'https://images.unsplash.com/photo-1572120360610-d971b9b1b1cf?auto=format&fit=crop&w=1200&q=60',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60',
        'https://images.unsplash.com/photo-1505691723518-36a5b5f8f1f7?auto=format&fit=crop&w=1200&q=60'
    ];
    imgs.forEach((img, i) => {
        if (!img.src || img.src.trim() === '') img.src = defaultImgs[i % defaultImgs.length];
        img.addEventListener('error', () => img.src = defaultImgs[i % defaultImgs.length]);
    })
}
ensureRemoteImages();

// CHART SALÁRIOS (inclui Engenharia)
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

    const labels = ['Python', 'JS/React', 'Java', 'Cloud', 'Data', 'Engenharia'];
    const values = [102, 88, 100, 120, 95, 110]; // em milhares CAD
    const maxVal = Math.max(...values) * 1.15;
    const padding = 28;

    let progress = 0;
    const duration = 900;
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

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartH / 4) * i;
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(padding + chartW, y); ctx.stroke();
        }

        values.forEach((v, i) => {
            const bx = padding + i * (barW * 1.6);
            const targetH = (v / maxVal) * chartH;
            const bh = targetH * t;
            const by = padding + (chartH - bh);

            ctx.fillStyle = 'rgba(11,102,195,0.18)';
            roundRect(ctx, bx, by, barW, bh, 8, true, false);

            ctx.fillStyle = '#e6f0ff';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], bx + barW / 2, padding + chartH + 18);

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

// Simulador CAD -> BRL
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

// Smooth anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Colaboradores (localStorage + export CSV)
function saveCollaborator(entry) { const key = 'collab_entries_v1'; const list = JSON.parse(localStorage.getItem(key) || '[]'); list.unshift(entry); localStorage.setItem(key, JSON.stringify(list)); }
function getCollaborators() { return JSON.parse(localStorage.getItem('collab_entries_v1') || '[]'); }
function exportCollabCSV() { const rows = getCollaborators(); if (!rows.length) return alert('Nenhuma entrada'); const csv = ['nome,email,mensagem,data'].concat(rows.map(r => `${escapeCSV(r.name)},${escapeCSV(r.email)},${escapeCSV(r.message)},${escapeCSV(r.date)}`)).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'colaboradores.csv'; a.click(); URL.revokeObjectURL(url); }
function escapeCSV(s) { if (!s) return ''; return '"' + String(s).replace(/"/g, '""') + '"'; }

// Timeline (localStorage)
function saveTimelineItem(item) { const key = 'timeline_v1'; const arr = JSON.parse(localStorage.getItem(key) || '[]'); arr.unshift(item); localStorage.setItem(key, JSON.stringify(arr)); }
function getTimeline() { return JSON.parse(localStorage.getItem('timeline_v1') || '[]'); }

// expose small API
window.projectUtils = { saveCollaborator, getCollaborators, exportCollabCSV, saveTimelineItem, getTimeline };
