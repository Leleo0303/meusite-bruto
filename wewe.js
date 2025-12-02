// ==========================================
// 1. CONFIGURAÇÃO E DADOS GERAIS
// ==========================================
const CONFIG = {
    // ⚠️ Em um projeto real, nunca exponha a MASTER_KEY no front-end.
    // Como é um projeto de estudo/portfólio pessoal, tudo bem por enquanto.
    JSONBIN_ID: '692bd93843b1c97be9cdec79',
    MASTER_KEY: '$2a$10$ov57z3Q34REQkIKbvNaM8eEjyuarOvRZaaQYvJev6mqzRtVJpAhUu',
    BASE_URL: 'https://api.jsonbin.io/v3/b'
};

// ==========================================
// 2. LÓGICA DO BANCO DE DADOS (TIMELINE)
// ==========================================

async function getTimeline() {
    if (!CONFIG.JSONBIN_ID) return JSON.parse(localStorage.getItem('timeline_local') || '[]');

    try {
        const response = await fetch(`${CONFIG.BASE_URL}/${CONFIG.JSONBIN_ID}/latest`, {
            headers: { 'X-Master-Key': CONFIG.MASTER_KEY }
        });
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.json();
        return data.record || [];
    } catch (error) {
        console.error("Erro JSONBin:", error);
        return [];
    }
}

async function updateFullTimeline(newItems) {
    if (!CONFIG.JSONBIN_ID) return false;

    try {
        const response = await fetch(`${CONFIG.BASE_URL}/${CONFIG.JSONBIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.MASTER_KEY
            },
            body: JSON.stringify(newItems)
        });
        return response.ok;
    } catch (error) {
        console.error("Erro ao salvar:", error);
        return false;
    }
}

async function saveTimelineItem(newItem) {
    const currentItems = await getTimeline();
    // Adiciona o novo item e filtra nulos
    const updatedItems = currentItems.concat(newItem).filter(i => i && i.title);
    return await updateFullTimeline(updatedItems);
}

// Colaboradores (Usa LocalStorage para simplificar e não misturar com o Bin da Timeline)
const projectUtils = {
    getTimeline,
    saveTimelineItem,
    updateFullTimeline,

    // Colaboradores LocalStorage
    saveCollaborator: (entry) => {
        const list = JSON.parse(localStorage.getItem('collab_v1') || '[]');
        list.unshift(entry);
        localStorage.setItem('collab_v1', JSON.stringify(list));
    },
    getCollaborators: () => JSON.parse(localStorage.getItem('collab_v1') || '[]'),
    exportCollabCSV: () => {
        const list = JSON.parse(localStorage.getItem('collab_v1') || '[]');
        if (!list.length) return alert('Nada para exportar');
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Nome,Email,Msg,Data"].concat(list.map(r => `${r.name},${r.email},${r.message},${r.date}`)).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "metas_colaboradores.csv");
        document.body.appendChild(link);
        link.click();
    }
};

// Expõe para o HTML usar
window.projectUtils = projectUtils;


// ==========================================
// 3. LÓGICA DE INTERFACE (UI)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- A. DROPDOWNS (MENU) ---
    const dropdownButtons = document.querySelectorAll('[data-dd]');

    dropdownButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede fechar ao clicar
            const targetId = btn.getAttribute('data-dd');
            const targetMenu = document.getElementById(`dd-${targetId}`);

            // Fecha todos os outros
            document.querySelectorAll('.dropdown').forEach(d => {
                if (d !== targetMenu) d.classList.remove('show');
            });

            // Alterna o atual
            if (targetMenu) targetMenu.classList.toggle('show');
        });
    });

    // Fecha dropdowns se clicar fora
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
    });


    // --- B. MODAL VISUAL ---
    const openModalBtn = document.getElementById('openVisual');
    const modal = document.getElementById('modalVisual');
    const closeBtns = document.querySelectorAll('#closeVisual, #closeVisual2');

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            renderMapGrid(); // Preenche o conteúdo do modal
        });

        closeBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    function renderMapGrid() {
        const grid = document.getElementById('mapGrid');
        if (!grid || grid.innerHTML.trim() !== "") return; // Se já preencheu, não faz de novo

        const data = [
            { t: 'Docs', d: 'Passaporte, Vistos, Traduções.' },
            { t: 'Moradia', d: 'Aluguel em Toronto/Vancouver.' },
            { t: 'TI Jobs', d: 'Python, Java, React - Faixas salariais.' },
            { t: 'Custo', d: 'Simulação de gastos mensais.' }
        ];

        grid.innerHTML = data.map(item => `
            <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                <h4 style="margin:0; color:var(--accent-2)">${item.t}</h4>
                <p style="margin:5px 0 0; font-size:12px;" class="muted">${item.d}</p>
            </div>
        `).join('');
    }


    // --- C. SIMULADOR FINANCEIRO ---
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const rate = parseFloat(document.getElementById('rate').value) || 0;
            // Exemplo: Salário de 5000 CAD mensais
            const salarioExemplo = 5000;
            const convertido = (salarioExemplo * rate).toFixed(2);
            document.getElementById('simResult').innerHTML =
                `Ex: 5.000 CAD = <strong>R$ ${convertido}</strong> (aprox).`;
            document.getElementById('simResult').style.color = '#fff';
        });
    }


    // --- D. GRÁFICO DE SALÁRIOS (Sem biblioteca externa) ---
    const canvas = document.getElementById('salaryChart');
    if (canvas) {
        // Como o usuário é estagiário, vamos fazer algo simples:
        // Vamos substituir o <canvas> por uma div com barras CSS, é mais fácil de manter e responsivo.
        const parent = canvas.parentElement;
        parent.innerHTML = ''; // Limpa o canvas
        parent.classList.add('chart-wrap'); // Usa o CSS que criamos

        const salarios = [
            { label: 'Python', val: 100 }, // Base 100k
            { label: 'JS/React', val: 90 },
            { label: 'Java', val: 105 },
            { label: 'DevOps', val: 120 },
            { label: 'Engenharia', val: 95 }
        ];

        // Encontra o maior valor para calcular porcentagem
        const max = Math.max(...salarios.map(s => s.val));

        salarios.forEach(item => {
            const height = (item.val / max) * 100; // Altura em %
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            // Começa com altura 0 para animar
            bar.style.height = '0%';

            bar.innerHTML = `
                <span class="chart-value">${item.val}k</span>
                <span class="chart-label">${item.label}</span>
            `;
            parent.appendChild(bar);

            // Animação simples
            setTimeout(() => { bar.style.height = `${height}%`; }, 100);
        });
    }

});