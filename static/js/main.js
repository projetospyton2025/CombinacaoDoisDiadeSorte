// Elementos do DOM
const tamanhoSelect = document.getElementById('tamanho');
const gerarBtn = document.getElementById('gerar');
const resultadoTitulo = document.getElementById('resultado-titulo');
const totalInfo = document.getElementById('total-info');
const combinacoesContainer = document.getElementById('combinacoes');
const anteriorBtn = document.getElementById('anterior');
const proximoBtn = document.getElementById('proximo');
const paginaInfo = document.getElementById('pagina-info');
const verEstatisticasBtn = document.getElementById('ver-estatisticas');

// Variáveis para controle da paginação
let todasCombinacoes = [];
let paginaAtual = 1;
const itensPorPagina = 30;

// Função para gerar combinações
function gerarCombinacoes(conjunto, tamanho) {
    const combinacoes = [];
    
    function combinar(inicio, atual) {
        if (atual.length === tamanho) {
            combinacoes.push([...atual]);
            return;
        }
        
        for (let i = inicio; i < conjunto.length; i++) {
            atual.push(conjunto[i]);
            combinar(i + 1, atual);
            atual.pop();
        }
    }
    
    combinar(0, []);
    return combinacoes;
}

// Função para mostrar combinações na página atual
function mostrarCombinacoes() {
    combinacoesContainer.innerHTML = '';
    
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = Math.min(inicio + itensPorPagina, todasCombinacoes.length);
    
    for (let i = inicio; i < fim; i++) {
        const combDiv = document.createElement('div');
        combDiv.classList.add('comb-item');
        combDiv.textContent = todasCombinacoes[i].join(',');
        combinacoesContainer.appendChild(combDiv);
    }
    
    // Atualizar informações de paginação
    paginaInfo.textContent = `Página ${paginaAtual} de ${Math.ceil(todasCombinacoes.length / itensPorPagina)}`;
    anteriorBtn.disabled = paginaAtual === 1;
    proximoBtn.disabled = paginaAtual === Math.ceil(todasCombinacoes.length / itensPorPagina);
    
    // Habilitar o botão de estatísticas quando houver combinações
    if (verEstatisticasBtn) {
        verEstatisticasBtn.disabled = todasCombinacoes.length === 0;
    }
}

// Função para criar popup de estatísticas rápidas
function mostrarEstatisticasRapidas() {
    if (todasCombinacoes.length === 0) {
        alert('Gere combinações primeiro para ver estatísticas.');
        return;
    }
    
    const tamanho = parseInt(tamanhoSelect.value);
    
    // Agrupar combinações por primeiro dígito
    const porPrimeiroDigito = {};
    for (let i = 0; i < 10; i++) {
        porPrimeiroDigito[i] = todasCombinacoes.filter(comb => comb[0] === i);
    }
    
    // Criar o popup
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Cabeçalho do popup
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = `Estatísticas para ${tamanho} dígito(s)`;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Corpo do popup
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Adicionar resumo das estatísticas
    const estatisticasDiv = document.createElement('div');
    estatisticasDiv.className = 'estatisticas-resumo';
    
    // Total de combinações
    const totalDiv = document.createElement('div');
    totalDiv.className = 'estatistica-item';
    totalDiv.innerHTML = `<strong>Total de combinações:</strong> ${todasCombinacoes.length}`;
    estatisticasDiv.appendChild(totalDiv);
    
    // Combinações por primeiro dígito
    const porDigitoDiv = document.createElement('div');
    porDigitoDiv.className = 'estatistica-por-digito';
    porDigitoDiv.innerHTML = '<strong>Combinações por primeiro dígito:</strong>';
    
    const digitsTable = document.createElement('table');
    digitsTable.className = 'digitos-table';
    
    // Cabeçalho da tabela
    const headerRow = document.createElement('tr');
    for (let i = 0; i < 10; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        headerRow.appendChild(th);
    }
    digitsTable.appendChild(headerRow);
    
    // Valores
    const valuesRow = document.createElement('tr');
    for (let i = 0; i < 10; i++) {
        const td = document.createElement('td');
        td.textContent = porPrimeiroDigito[i] ? porPrimeiroDigito[i].length : 0;
        valuesRow.appendChild(td);
    }
    digitsTable.appendChild(valuesRow);
    
    porDigitoDiv.appendChild(digitsTable);
    estatisticasDiv.appendChild(porDigitoDiv);
    
    // Adicionar link para estatísticas completas
    const linkCompleto = document.createElement('div');
    linkCompleto.className = 'link-completo';
    const linkBtn = document.createElement('a');
    linkBtn.href = '/tabela_combinacoes';
    linkBtn.className = 'btn-link';
    linkBtn.textContent = 'Ver Tabela Completa de Estatísticas';
    linkCompleto.appendChild(linkBtn);
    
    modalBody.appendChild(estatisticasDiv);
    modalBody.appendChild(linkCompleto);
    
    // Adicionar ao modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    
    // Adicionar à página
    document.body.appendChild(modalOverlay);
}

// Event listeners
gerarBtn.addEventListener('click', () => {
    const tamanho = parseInt(tamanhoSelect.value);
    const digitos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Gerar todas as combinações
    todasCombinacoes = gerarCombinacoes(digitos, tamanho);
    
    // Resetar paginação
    paginaAtual = 1;
    
    // Atualizar interface
    resultadoTitulo.textContent = `Combinações com ${tamanho} dígito(s)`;
    totalInfo.textContent = `Total de combinações: ${todasCombinacoes.length}`;
    
    // Mostrar combinações
    mostrarCombinacoes();
    
    // Também armazenar no localStorage para uso na página de estatísticas
    try {
        localStorage.setItem('ultimo_tamanho', tamanho);
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
    }
});

anteriorBtn.addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        mostrarCombinacoes();
    }
});

proximoBtn.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(todasCombinacoes.length / itensPorPagina)) {
        paginaAtual++;
        mostrarCombinacoes();
    }
});

// Verificar se o botão de estatísticas existe e adicionar evento
if (verEstatisticasBtn) {
    verEstatisticasBtn.addEventListener('click', mostrarEstatisticasRapidas);
}

// Inicializar as combinações quando a página carrega (opcional)
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar botão de estatísticas se não existir no HTML
    if (!verEstatisticasBtn) {
        const estatisticasBtn = document.createElement('button');
        estatisticasBtn.id = 'ver-estatisticas';
        estatisticasBtn.textContent = 'Ver Estatísticas';
        estatisticasBtn.className = 'btn-estatisticas';
        estatisticasBtn.disabled = true;
        estatisticasBtn.addEventListener('click', mostrarEstatisticasRapidas);
        
        // Adicionar após o botão gerar
        gerarBtn.parentElement.appendChild(estatisticasBtn);
    }
    
    // Também poderíamos carregar automaticamente o mesmo tamanho da página de estatísticas
    try {
        const ultimoTamanho = localStorage.getItem('ultimo_tamanho');
        if (ultimoTamanho) {
            tamanhoSelect.value = ultimoTamanho;
        }
    } catch (e) {
        console.error('Erro ao ler do localStorage:', e);
    }
});