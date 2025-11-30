// ===================================
// ⚠️ CONFIGURAÇÃO DO BANCO DE DADOS (JSONBin.io)
// ATENÇÃO: SUBSTITUA ESSES VALORES PELOS SEUS!
// ===================================
// 1. Crie o Bin no JSONBin.io e coloque o conteúdo inicial.
// 2. Coloque o ID do Bin aqui (Ex: '658141443657519114f16b25')
const JSONBIN_ID = '692bcd5843b1c97be9cddba3';
// 3. Coloque sua Master Key (Chave Secreta) aqui
const MASTER_KEY = '$2a$10$ov57z3Q34REQkIKbvNaM8eEjyuarOvRZaaQYvJev6mqzRtVJpAhUu';

// URL base para ler e escrever
const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

// ===================================
// FUNÇÕES DE BANCO DE DADOS COLABORATIVO (NOVAS)
// ===================================

// Sua função getTimeline() (MANTIDA)
async function getTimeline() {
    // ... (manter o código da função getTimeline) ...
}


/** NOVO: ATUALIZA O BIN INTEIRO com uma nova lista de itens */
async function updateFullTimeline(newItems) {
    if (!JSONBIN_ID || !MASTER_KEY) {
        console.error("Configuração do JSONBin.io ausente. Não é possível salvar/atualizar colaborativamente.");
        return false;
    }
    try {
        const response = await fetch(BASE_URL, {
            method: 'PUT', // PUT sobrescreve o Bin inteiro (essencial para Excluir/Editar)
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(newItems)
        });

        if (!response.ok) throw new Error('Falha ao atualizar a meta: ' + response.statusText);
        console.log("Timeline atualizada colaborativamente.");
        return true;

    } catch (error) {
        console.error("Erro ao salvar no JSONBin:", error);
        return false;
    }
}


/** Salva um novo item da linha do tempo (MODIFICADA para usar updateFullTimeline) */
async function saveTimelineItem(newItem) {
    if (!JSONBIN_ID || !MASTER_KEY) {
        console.error("Configuração do JSONBin.io ausente. Não é possível salvar colaborativamente.");
        return false;
    }
    // 1. Pega os dados atuais (colaborativos)
    const existingItems = await getTimeline(); // Usa a função de cima

    // Filtra itens vazios e adiciona o novo item
    const updatedItems = existingItems.filter(item => item && item.title).concat(newItem);

    // 2. Salva a lista atualizada no JSONBin.io usando a nova função PUT
    return await updateFullTimeline(updatedItems);
}

// ===================================
// LÓGICA EXISTENTE (mantida)
// ===================================

// DROPDOWNS
document.querySelectorAll('[data-dd]').forEach(btn => { /* ... */ });
window.addEventListener('click', (e) => { /* ... */ });

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
function fillMap() { /* ... */ }
fillMap();

if (openVisual) openVisual.addEventListener('click', () => { if (modal) modal.style.display = 'flex'; });
if (closeVisual) closeVisual.addEventListener('click', () => modal && (modal.style.display = 'none'));
if (closeVisual2) closeVisual2.addEventListener('click', () => modal && (modal.style.display = 'none'));
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// LOADING OVERLAY (quando página é aberta)
window.addEventListener('load', () => { /* ... */ });

// IMAGENS REMOTAS (fallback para moradia)
function ensureRemoteImages() { /* ... */ }
ensureRemoteImages();

// CHART SALÁRIOS (inclui Engenharia)
(function drawSalary() { /* ... */ })();

// Simulador CAD -> BRL
const convertBtn = document.getElementById('convertBtn');
if (convertBtn) { /* ... */ }

// Smooth anchors
document.querySelectorAll('a[href^="#"]').forEach(a => { /* ... */ });

// Colaboradores (localStorage + export CSV) - MANTIDAS
function saveCollaborator(entry) { const key = 'collab_entries_v1'; const list = JSON.parse(localStorage.getItem(key) || '[]'); list.unshift(entry); localStorage.setItem(key, JSON.stringify(list)); }
function getCollaborators() { return JSON.parse(localStorage.getItem('collab_entries_v1') || '[]'); }
function exportCollabCSV() { const rows = getCollaborators(); if (!rows.length) return alert('Nenhuma entrada'); const csv = ['nome,email,mensagem,data'].concat(rows.map(r => `${escapeCSV(r.name)},${escapeCSV(r.email)},${escapeCSV(r.message)},${escapeCSV(r.date)}`)).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'colaboradores.csv'; a.click(); URL.revokeObjectURL(url); }
function escapeCSV(s) { if (!s) return ''; return '"' + String(s).replace(/"/g, '""') + '"'; }


// expose small API
// AGORA EXPOS AS NOVAS FUNÇÕES ASYNC 'saveTimelineItem' e 'getTimeline'
window.projectUtils = {
    saveCollaborator,
    getCollaborators,
    exportCollabCSV,
    saveTimelineItem, // Função colaborativa (JSONBin.io)
    getTimeline,      // Função colaborativa (JSONBin.io)
    updateFullTimeline // <--- NOVO: Essencial para excluir/editar
};