// Elementos do DOM
const tabelaCorpo = document.getElementById('estatisticas-corpo');
const tamanhoTabelaSelect = document.getElementById('tamanho-tabela');
const atualizarBtn = document.getElementById('atualizar-tabela');

// Dados para armazenar as estatísticas
let estatisticasData = [];
let combinacoesData = {};

// Carregar os dados iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Carregar estatísticas para todos os tamanhos
    carregarEstatisticas();
    
    // Pré-carregar combinações para todos os tamanhos de 1 a 10
    for (let i = 1; i <= 10; i++) {
        carregarCombinacoes(i);
    }
});

// Event listener para o botão de atualizar
atualizarBtn.addEventListener('click', () => {
    atualizarTabelaComDados();
});

// Função para carregar estatísticas da API
async function carregarEstatisticas() {
    try {
        const response = await fetch('/api/estatisticas');
        if (response.ok) {
            estatisticasData = await response.json();
            preencherTabelaEstatisticas();
        } else {
            console.error('Erro ao carregar estatísticas:', response.status);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Função para carregar combinações para um tamanho específico
async function carregarCombinacoes(tamanho) {
    try {
        const response = await fetch(`/api/combinacoes/${tamanho}`);
        if (response.ok) {
            const data = await response.json();
            combinacoesData[tamanho] = data;
            // Atualizar a tabela com as combinações carregadas
            atualizarCombinacoes(tamanho);
        } else {
            console.error(`Erro ao carregar combinações para tamanho ${tamanho}:`, response.status);
        }
    } catch (error) {
        console.error(`Erro ao carregar combinações para tamanho ${tamanho}:`, error);
    }
}

// Função para gerar todas as combinações de tamanho k
function gerarTodasCombinacoes(k) {
    const digitos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const resultado = [];
    
    function combinar(inicio, atual) {
        if (atual.length === k) {
            resultado.push([...atual]);
            return;
        }
        
        for (let i = inicio; i < digitos.length; i++) {
            atual.push(digitos[i]);
            combinar(i + 1, atual);
            atual.pop();
        }
    }
    
    combinar(0, []);
    return resultado;
}

// Função para preencher a tabela com estatísticas
function preencherTabelaEstatisticas() {
    if (!estatisticasData || estatisticasData.length === 0) return;
    
    tabelaCorpo.innerHTML = '';
    
    estatisticasData.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-tamanho', item.tamanho);
        
        // Coluna "Combinações com"
        const colCombCom = document.createElement('td');
        colCombCom.textContent = item.tamanho;
        row.appendChild(colCombCom);
        
        // Coluna "Dígitos" (total de combinações)
        const colDigitos = document.createElement('td');
        colDigitos.textContent = item.total;
        row.appendChild(colDigitos);
        
        // Coluna "Agrupamento com duas dezenas"
        const colAgrupamento = document.createElement('td');
        colAgrupamento.textContent = item.agrupamentos_duas_dezenas;
        row.appendChild(colAgrupamento);
        
        // Coluna "Combinações destas dezenas (agrupada em 2)"
        const colCombAgrupadas = document.createElement('td');
        colCombAgrupadas.textContent = item.combinacoes_agrupadas;
        row.appendChild(colCombAgrupadas);
        
        // Colunas para cada primeiro dígito (0-4)
        for (let i = 0; i <= 4; i++) {
            const colDigito = document.createElement('td');
            colDigito.className = 'combo-cell';
            colDigito.setAttribute('data-digito', i);
            
            // Inicialmente colocamos "Carregando..." até termos os dados reais
            colDigito.textContent = "Carregando...";
            
            row.appendChild(colDigito);
        }
        
        // Coluna "..."
        const colEtc = document.createElement('td');
        colEtc.textContent = 'Mais combinações...';
        colEtc.className = 'etc-cell';
        colEtc.title = 'Clique para ver mais combinações';
        colEtc.style.cursor = 'pointer';
        colEtc.addEventListener('click', () => {
            mostrarTodasCombinacoes(item.tamanho);
        });
        row.appendChild(colEtc);
        
        tabelaCorpo.appendChild(row);
    });
}

// Função para atualizar as células com combinações reais
function atualizarCombinacoes(tamanho) {
    if (!combinacoesData[tamanho]) return;
    
    const data = combinacoesData[tamanho];
    
    // Encontrar a linha correta
    const row = document.querySelector(`tr[data-tamanho="${tamanho}"]`);
    if (!row) return;
    
    // Atualizar as células para cada dígito inicial (0-4)
    for (let i = 0; i <= 4; i++) {
        const cell = row.querySelector(`td[data-digito="${i}"]`);
        if (!cell) continue;
        
        const combsPorDigito = data.por_primeiro_digito[i] || [];
        
        if (combsPorDigito.length > 0) {
            // Mostrar a primeira combinação (ou até 3 se couber)
            const combs = combsPorDigito.slice(0, 1);
            cell.textContent = combs.map(comb => comb.join(',')).join('\n');
            
            // Adicionar evento de clique para mostrar todas as combinações deste dígito
            cell.style.cursor = 'pointer';
            cell.title = 'Clique para ver todas as combinações';
            
            // Importante: remover listeners antigos para evitar duplicação
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
            
            // Adicionar novo evento
            newCell.addEventListener('click', () => {
                mostrarCombinacoesPorDigito(tamanho, i);
            });
        } else {
            cell.textContent = 'N/A';
        }
    }
}



// Função para mostrar modal com todas as combinações por dígito
function mostrarCombinacoesPorDigito(tamanho, primeiroDigito) {
	console.log("Abrindo modal para:", tamanho, primeiroDigito);
    console.log("Dados disponíveis:", combinacoesData[tamanho]);
    if (!combinacoesData[tamanho]) {
        alert('Dados não disponíveis para este tamanho.');
        return;
    }
    
    const data = combinacoesData[tamanho];
    const combsPorDigito = data.por_primeiro_digito[primeiroDigito] || [];
    
    if (combsPorDigito.length === 0) {
        alert('Não há combinações começando com este dígito.');
        return;
    }
    
    // Criar o modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Cabeçalho do modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = `Combinações com ${tamanho} dígitos começando com ${primeiroDigito}`;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Corpo do modal
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const totalText = document.createElement('p');
    totalText.textContent = `Total de combinações: ${combsPorDigito.length}`;
    modalBody.appendChild(totalText);
    
    // Tabela de combinações
    const comboTable = document.createElement('table');
    comboTable.className = 'combo-table';
    
    // Criar linhas para exibir as combinações em uma grade
    const combsPerRow = 6;
    const rows = Math.ceil(combsPorDigito.length / combsPerRow);
    
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < combsPerRow; j++) {
            const index = i * combsPerRow + j;
            
            if (index < combsPorDigito.length) {
                const cell = document.createElement('td');
                cell.textContent = combsPorDigito[index].join(',');
                row.appendChild(cell);
            } else {
                const cell = document.createElement('td');
                row.appendChild(cell);
            }
        }
        
        comboTable.appendChild(row);
    }
    
    modalBody.appendChild(comboTable);
    
    // Adicionar tudo ao modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    
    // Adicionar o modal à página
    document.body.appendChild(modalOverlay);
}

// Função para mostrar modal com TODAS as combinações de um tamanho específico
function mostrarTodasCombinacoes(tamanho) {
    if (!combinacoesData[tamanho]) {
        alert('Dados não disponíveis para este tamanho.');
        return;
    }
    
    const data = combinacoesData[tamanho];
    
    // Criar o modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content modal-large';
    
    // Cabeçalho do modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = `Todas as combinações com ${tamanho} dígitos`;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Corpo do modal
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const totalText = document.createElement('p');
    totalText.textContent = `Total de combinações: ${data.total}`;
    modalBody.appendChild(totalText);
    
    // Criar tabs para cada dígito inicial
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    const tabsNav = document.createElement('div');
    tabsNav.className = 'tabs-nav';
    
    const tabsContent = document.createElement('div');
    tabsContent.className = 'tabs-content';
    
    // Criar uma tab para cada dígito inicial
    for (let i = 0; i <= 9; i++) {
        const combsPorDigito = data.por_primeiro_digito[i] || [];
        
        // Skip if no combinations for this digit
        if (combsPorDigito.length === 0) continue;
        
        // Tab button
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.textContent = `Início ${i} (${combsPorDigito.length})`;
        tabBtn.dataset.target = `tab-${i}`;
        if (i === 0) tabBtn.classList.add('active');
        
        tabBtn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            // Show the target tab content
            document.getElementById(e.target.dataset.target).style.display = 'block';
        });
        
        tabsNav.appendChild(tabBtn);
        
        // Tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = `tab-${i}`;
        tabContent.style.display = i === 0 ? 'block' : 'none';
        
        // Create table for combinations
        const comboTable = document.createElement('table');
        comboTable.className = 'combo-table';
        
        // Create rows to display combinations in a grid
        const combsPerRow = 6;
        const rows = Math.ceil(combsPorDigito.length / combsPerRow);
        
        for (let j = 0; j < rows; j++) {
            const row = document.createElement('tr');
            
            for (let k = 0; k < combsPerRow; k++) {
                const index = j * combsPerRow + k;
                
                if (index < combsPorDigito.length) {
                    const cell = document.createElement('td');
                    cell.textContent = combsPorDigito[index].join(',');
                    row.appendChild(cell);
                } else {
                    const cell = document.createElement('td');
                    row.appendChild(cell);
                }
            }
            
            comboTable.appendChild(row);
        }
        
        tabContent.appendChild(comboTable);
        tabsContent.appendChild(tabContent);
    }
    
    tabsContainer.appendChild(tabsNav);
    tabsContainer.appendChild(tabsContent);
    modalBody.appendChild(tabsContainer);
    
    // Adicionar tudo ao modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    
    // Adicionar o modal à página
    document.body.appendChild(modalOverlay);
}

// Função para atualizar a tabela com os dados de combinações específicas
function atualizarTabelaComDados() {
    const tamanho = parseInt(tamanhoTabelaSelect.value);
    if (tamanho >= 1 && tamanho <= 10) {
        // Se já não temos esses dados, temos que carregá-los
        if (!combinacoesData[tamanho]) {
            carregarCombinacoes(tamanho);
        } else {
            // Caso contrário, apenas atualizamos a exibição
            atualizarCombinacoes(tamanho);
        }
    }
}