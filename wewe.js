// ==========================================
// 1. CONFIGURAÇÃO E DADOS
// ==========================================
const CONFIG = {
    JSONBIN_ID: '692bd93843b1c97be9cdec79', // Seu ID
    MASTER_KEY: '$2a$10$ov57z3Q34REQkIKbvNaM8eEjyuarOvRZaaQYvJev6mqzRtVJpAhUu', // Sua Key
    BASE_URL: 'https://api.jsonbin.io/v3/b'
};

const DICAS_CANADA = [
    "Dica: O inverno em Vancouver é chuvoso, mas raramente neva muito.",
    "Dica: Em Toronto, o sistema PATH subterrâneo conecta o centro todo.",
    "Dica: Profissionais de TI no Canadá muitas vezes são contratados via LinkedIn.",
    "Dica: O 'Credit Score' é vital para alugar casas. Pague contas em dia!",
    "Dica: Tim Hortons é lei. O café 'Double Double' é um clássico."
];

// ==========================================
// 2. LÓGICA GERAL & UTILITÁRIOS
// ==========================================
const projectUtils = {
    // --- BANCO DE DADOS (JSONBin) ---
    async getTimeline() {
        if (!CONFIG.JSONBIN_ID) return JSON.parse(localStorage.getItem('timeline_local') || '[]');
        try {
            const r = await fetch(`${CONFIG.BASE_URL}/${CONFIG.JSONBIN_ID}/latest`, { headers: { 'X-Master-Key': CONFIG.MASTER_KEY } });
            if (!r.ok) throw new Error('Erro DB');
            const d = await r.json();
            return d.record || [];
        } catch (e) { console.error(e); return []; }
    },

    async updateFullTimeline(items) {
        if (!CONFIG.JSONBIN_ID) return false;
        try {
            await fetch(`${CONFIG.BASE_URL}/${CONFIG.JSONBIN_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': CONFIG.MASTER_KEY },
                body: JSON.stringify(items)
            });
            return true;
        } catch (e) { return false; }
    },

    async saveTimelineItem(item) {
        const current = await this.getTimeline();
        const updated = current.concat(item).filter(i => i && i.title);
        return await this.updateFullTimeline(updated);
    },

    // --- CHECKLIST INTERATIVO (LocalStorage) ---
    toggleCheck: (id) => {
        const checks = JSON.parse(localStorage.getItem('docs_checks') || '{}');
        checks[id] = !checks[id];
        localStorage.setItem('docs_checks', JSON.stringify(checks));
        return checks[id];
    },
    getChecks: () => JSON.parse(localStorage.getItem('docs_checks') || '{}'),

    // --- CRS CALCULATOR (Lógica Simplificada) ---
    calculateCRS: (age, education, english, exp) => {
        let score = 0;
        // Idade (pico aos 20-29)
        if (age >= 20 && age <= 29) score += 110;
        else if (age > 29) score += Math.max(0, 110 - ((age - 29) * 5));
        else score += 100;

        // Educação
        if (education === 'master') score += 135;
        else if (education === 'bachelor') score += 120;
        else if (education === 'college') score += 98;
        else score += 30;

        // Inglês (CLB aproximado)
        if (english === 'high') score += 136; // CLB 9+
        else if (english === 'mid') score += 80;
        else score += 0;

        // Experiência
        if (exp >= 3) score += 50; // Simplificado (Skill Transferability)
        else if (exp >= 1) score += 25;

        // Bônus Educação + Inglês forte
        if (education !== 'school' && english === 'high') score += 50;

        return score;
    }
};
window.projectUtils = projectUtils;

// ==========================================
// 3. EVENTOS DA DOM (INTERFACE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // A. LOADING SCREEN COM DICAS
    const tipEl = document.getElementById('loadingTip');
    if (tipEl) {
        tipEl.innerText = DICAS_CANADA[Math.floor(Math.random() * DICAS_CANADA.length)];
    }

    // B. MENU DROPDOWN
    document.querySelectorAll('[data-dd]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = document.getElementById(`dd-${btn.dataset.dd}`);
            document.querySelectorAll('.dropdown').forEach(d => d !== menu && d.classList.remove('show'));
            if (menu) menu.classList.toggle('show');
        });
    });
    window.addEventListener('click', () => document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show')));

    // C. DASHBOARD COUNTDOWN (Index)
    const countEl = document.getElementById('daysCount');
    if (countEl) {
        const target = new Date('2030-01-01');
        const diff = target - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        countEl.innerText = days + " dias";
    }

    // D. CHECKLIST SYSTEM (Documentos)
    const checkBoxes = document.querySelectorAll('.chk-doc');
    if (checkBoxes.length) {
        const saved = projectUtils.getChecks();
        // Restaura estado
        checkBoxes.forEach(chk => {
            if (saved[chk.dataset.id]) chk.checked = true;
            chk.addEventListener('change', () => projectUtils.toggleCheck(chk.dataset.id));
        });
    }

    // E. CRS CALCULATOR FORM (Nova Página)
    const crsForm = document.getElementById('crsForm');
    if (crsForm) {
        crsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const age = parseInt(document.getElementById('c-age').value);
            const edu = document.getElementById('c-edu').value;
            const eng = document.getElementById('c-eng').value;
            const exp = parseInt(document.getElementById('c-exp').value);

            const result = projectUtils.calculateCRS(age, edu, eng, exp);

            const resBox = document.getElementById('crsResult');
            resBox.innerHTML = `
                <h2 style="color:var(--accent-2); margin-bottom:5px">${result} Pontos</h2>
                <small class="muted">Estimativa não oficial. O corte médio é ~480-500.</small>
                <div style="margin-top:10px; width:100%; background:#333; height:10px; border-radius:5px; overflow:hidden">
                    <div style="width:${(result / 600) * 100}%; background:var(--accent); height:100%"></div>
                </div>
            `;
            resBox.classList.add('elevated'); // Animação
        });
    }
});