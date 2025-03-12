// Função para criar e mostrar o modal com combinações detalhadas
function mostrarModalCombinacoes(primeiroDigito, tamanho) {
    // Verificar se temos os dados de combinações
    if (!combinacoesData || combinacoesData.tamanho !== tamanho) {
        alert('Primeiro selecione o tamanho correto e clique em "Atualizar Tabela"');
        return;
    }
    
    // Obter todas as combinações para este dígito inicial
    const combsPorDigito = combinacoesData.por_primeiro_digito[primeiroDigito] || [];
    
    if (combsPorDigito.length === 0) {
        alert('Não há combinações para este dígito inicial.');
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
    
    // Conteúdo do modal
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

// Adicionar listeners para as células da tabela
function adicionarListenersCelulas() {
    const células = document.querySelectorAll('.combo-cell');
    
    células.forEach((célula, index) => {
        // Calcular qual linha e coluna (dígito) esta célula representa
        const linha = Math.floor(index / 5);
        const coluna = index % 5;
        
        // Não adicionar listener para linhas 8-10 (índices 7-9, que são "?")
        if (linha >= 7) return;
        
        célula.style.cursor = 'pointer';
        célula.title = 'Clique para ver todas as combinações';
        
        célula.addEventListener('click', () => {
            mostrarModalCombinacoes(coluna, linha + 1);
        });
    });
}

// Adicionar os listeners após carregar a tabela
document.addEventListener('DOMContentLoaded', () => {
    // Aguarde a tabela ser preenchida
    setTimeout(() => {
        adicionarListenersCelulas();
    }, 500);
});

// Adicionar listener para atualizar os listeners das células quando a tabela é atualizada
atualizarBtn.addEventListener('click', () => {
    setTimeout(() => {
        adicionarListenersCelulas();
    }, 500);
});