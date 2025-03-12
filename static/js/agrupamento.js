// Elementos do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Tabs de navegação
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Tab de combinação específica
    const combinacaoInput = document.getElementById('combinacao-input');
    const analisarBtn = document.getElementById('analisar-btn');
    const infoCombinacao = document.getElementById('info-combinacao');
    const totalAgrupamentos = document.getElementById('total-agrupamentos');
    const agrupamentosContainer = document.getElementById('agrupamentos-container');
    const palpitesInfo = document.getElementById('palpites-info');
    
    // Tab de todas as combinações
    const tamanhoSelect = document.getElementById('tamanho-select');
    const carregarTodasBtn = document.getElementById('carregar-todas-btn');
    const filtroPrimeiro = document.getElementById('filtro-primeiro');
    const buscaInput = document.getElementById('busca-input');
    const buscaBtn = document.getElementById('busca-btn');
    const totalCombinacoes = document.getElementById('total-combinacoes');
    const combinacoesBody = document.getElementById('combinacoes-body');
    const anteriorBtn = document.getElementById('anterior-btn');
    const proximoBtn = document.getElementById('proximo-btn');
    const paginaInfo = document.getElementById('pagina-info');
    
    // Variáveis de controle
    let todasCombinacoes = [];
    let combinacoesFiltradas = [];
    let paginaAtual = 1;
    const itensPorPagina = 20;
    
    // Função para trocar entre tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover classe active de todos os botões
            tabBtns.forEach(b => b.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            btn.classList.add('active');
            
            // Esconder todos os conteúdos
            tabContents.forEach(content => content.classList.add('hidden'));
            // Mostrar o conteúdo correspondente
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
    
    // Função para analisar uma combinação específica
    analisarBtn.addEventListener('click', analisarCombinacao);
    
    function analisarCombinacao() {
        const combinacao = combinacaoInput.value.trim();
        
        // Validar a entrada
        if (!combinacao) {
            alert('Por favor, digite uma combinação válida.');
            return;
        }
        
        // Limpar os resultados anteriores
        infoCombinacao.innerHTML = '<div class="loader"></div>';
        totalAgrupamentos.innerHTML = '';
        agrupamentosContainer.innerHTML = '';
        palpitesInfo.innerHTML = '';
        
        // Fazer a requisição à API
        fetch(`/api/combinacao_agrupamentos/${combinacao}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao analisar a combinação.');
                }
                return response.json();
            })
            .then(data => {
                // Exibir informações da combinação
                infoCombinacao.innerHTML = `
                    <p><strong>Combinação:</strong> ${data.combinacao.join(', ')}</p>
                    <p><strong>Tamanho:</strong> ${data.tamanho} dígitos</p>
                `;
                
                // Exibir total de agrupamentos
                totalAgrupamentos.innerHTML = `
                    <p>Total de agrupamentos de dois em dois: <strong>${data.total_agrupamentos}</strong></p>
                `;
                
                // Exibir os agrupamentos
                agrupamentosContainer.innerHTML = '';
                data.agrupamentos.forEach(ag => {
                    const agItem = document.createElement('div');
                    agItem.className = 'agrupamento-item';
                    agItem.textContent = ag.par_str;
                    agrupamentosContainer.appendChild(agItem);
                });
                
                // Exibir palpites (se disponível)
                if (data.palpites_mega) {
                    palpitesInfo.innerHTML = `
                        <p><strong>Palpites Mega Sena:</strong> ${data.palpites_mega.toLocaleString()}</p>
                    `;
                } else {
                    palpitesInfo.innerHTML = `
                        <p>Não há informações de palpites disponíveis para esta combinação.</p>
                    `;
                }
                
                // Adicionar tabela de resumo
                const tabelaResumo = criarTabelaResumo(data);
                palpitesInfo.appendChild(tabelaResumo);
            })
            .catch(error => {
                infoCombinacao.innerHTML = `<p class="error">Erro: ${error.message}</p>`;
            });
    }
    
    // Função para criar tabela de resumo
    function criarTabelaResumo(data) {
        const tabela = document.createElement('table');
        tabela.className = 'tabela-combinacoes';
        
        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Dígitos', 'Tamanho Agrupamento', 'Total de Combinações', 'Palpites Mega Sena'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        tabela.appendChild(thead);
        
        // Criar corpo da tabela
        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        
        // Coluna Dígitos
        const tdDigitos = document.createElement('td');
        tdDigitos.textContent = data.combinacao.join(',');
        tdDigitos.className = 'destaque';
        row.appendChild(tdDigitos);
        
        // Coluna Tamanho Agrupamento
        const tdTamanho = document.createElement('td');
        tdTamanho.textContent = data.tamanho_agrupamento;
        row.appendChild(tdTamanho);
        
        // Coluna Total de Combinações
        const tdTotal = document.createElement('td');
        tdTotal.textContent = data.total_agrupamentos;
        tdTotal.className = 'destaque';
        row.appendChild(tdTotal);
        
        // Coluna Palpites Mega Sena
        const tdPalpites = document.createElement('td');
        if (data.palpites_mega) {
            tdPalpites.textContent = data.palpites_mega.toLocaleString();
            tdPalpites.className = 'valor-conhecido';
        } else {
            tdPalpites.textContent = '?';
            tdPalpites.className = 'valor-desconhecido';
        }
        row.appendChild(tdPalpites);
        
        tbody.appendChild(row);
        tabela.appendChild(tbody);
        
        return tabela;
    }
    
    // Função para carregar todas as combinações
    carregarTodasBtn.addEventListener('click', carregarTodasCombinacoes);
    
    function carregarTodasCombinacoes() {
        const tamanho = parseInt(tamanhoSelect.value);
        
        // Limpar os resultados anteriores
        totalCombinacoes.innerHTML = '<div class="loader"></div>';
        combinacoesBody.innerHTML = '';
        
        // Fazer a requisição à API
        fetch(`/api/combinacoes_agrupadas/${tamanho}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar as combinações.');
                }
                return response.json();
            })
            .then(data => {
                // Armazenar todas as combinações
                todasCombinacoes = data.resultados;
                combinacoesFiltradas = [...todasCombinacoes];
                
                // Exibir total
                totalCombinacoes.innerHTML = `
                    <p>Total de combinações com ${tamanho} dígitos: <strong>${data.total_combinacoes}</strong></p>
                `;
                
                // Resetar paginação
                paginaAtual = 1;
                
                // Mostrar combinações
                mostrarCombinacoesPaginadas();
            })
            .catch(error => {
                totalCombinacoes.innerHTML = `<p class="error">Erro: ${error.message}</p>`;
            });
    }
    
    // Função para mostrar combinações paginadas
    function mostrarCombinacoesPaginadas() {
        combinacoesBody.innerHTML = '';
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, combinacoesFiltradas.length);
        
        // Verificar se há combinações para mostrar
        if (combinacoesFiltradas.length === 0) {
            combinacoesBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">Nenhuma combinação encontrada.</td>
                </tr>
            `;
            paginaInfo.textContent = 'Página 0 de 0';
            anteriorBtn.disabled = true;
            proximoBtn.disabled = true;
            return;
        }
        
        // Mostrar as combinações da página atual
        for (let i = inicio; i < fim; i++) {
            const comb = combinacoesFiltradas[i];
            const row = document.createElement('tr');
            
            // Coluna Combinação
            const tdComb = document.createElement('td');
            tdComb.textContent = comb.combinacao_str;
            row.appendChild(tdComb);
            
            // Coluna Total de Agrupamentos
            const tdTotal = document.createElement('td');
            tdTotal.textContent = comb.total_agrupamentos;
            row.appendChild(tdTotal);
            
            // Coluna Ações
            const tdAcoes = document.createElement('td');
            
            const verBtn = document.createElement('button');
            verBtn.className = 'acao-btn';
            verBtn.textContent = 'Ver Detalhes';
            verBtn.addEventListener('click', () => mostrarDetalhesCombinacao(comb.combinacao_str));
            tdAcoes.appendChild(verBtn);
            
            row.appendChild(tdAcoes);
            
            combinacoesBody.appendChild(row);
        }
        
        // Atualizar informações de paginação
        paginaInfo.textContent = `Página ${paginaAtual} de ${Math.ceil(combinacoesFiltradas.length / itensPorPagina)}`;
        anteriorBtn.disabled = paginaAtual === 1;
        proximoBtn.disabled = paginaAtual === Math.ceil(combinacoesFiltradas.length / itensPorPagina);
    }
    
    // Evento de clique para os botões de paginação
    anteriorBtn.addEventListener('click', () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            mostrarCombinacoesPaginadas();
        }
    });
    
    proximoBtn.addEventListener('click', () => {
        if (paginaAtual < Math.ceil(combinacoesFiltradas.length / itensPorPagina)) {
            paginaAtual++;
            mostrarCombinacoesPaginadas();
        }
    });
    
    // Filtrar por primeiro dígito
    filtroPrimeiro.addEventListener('change', filtrarCombinacoes);
    
    function filtrarCombinacoes() {
        const filtro = filtroPrimeiro.value;
        
        if (filtro === 'todos') {
            combinacoesFiltradas = [...todasCombinacoes];
        } else {
            const digito = parseInt(filtro);
            combinacoesFiltradas = todasCombinacoes.filter(comb => comb.combinacao[0] === digito);
        }
        
        // Resetar paginação
        paginaAtual = 1;
        
        // Mostrar combinações filtradas
        mostrarCombinacoesPaginadas();
    }
    
    // Buscar combinação
    buscaBtn.addEventListener('click', buscarCombinacao);
    
    function buscarCombinacao() {
        const busca = buscaInput.value.trim();
        
        if (!busca) {
            // Restaurar todas as combinações
            combinacoesFiltradas = [...todasCombinacoes];
        } else {
            // Filtrar combinações que contêm a busca
            combinacoesFiltradas = todasCombinacoes.filter(comb => 
                comb.combinacao_str.includes(busca)
            );
        }
        
        // Resetar paginação
        paginaAtual = 1;
        
        // Mostrar combinações filtradas
        mostrarCombinacoesPaginadas();
    }
    
    // Função para mostrar detalhes de uma combinação específica
    function mostrarDetalhesCombinacao(combinacao) {
        // Fazer a requisição à API
        fetch(`/api/combinacao_agrupamentos/${combinacao}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar os detalhes da combinação.');
                }
                return response.json();
            })
            .then(data => {
                // Criar modal
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';
                
                const modalContent = document.createElement('div');
                modalContent.className = 'modal-content modal-detalhes';
                
                // Cabeçalho do modal
                const modalHeader = document.createElement('div');
                modalHeader.className = 'modal-header';
                
                const modalTitle = document.createElement('h2');
                modalTitle.textContent = `Detalhes da Combinação ${data.combinacao.join(',')}`;
                
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
                
                // Informações gerais
                const infoGeral = document.createElement('div');
                infoGeral.className = 'info-geral';
                
                infoGeral.innerHTML = `
                    <h3>Informações da Combinação</h3>
                    <p><strong>Combinação:</strong> ${data.combinacao.join(', ')}</p>
                    <p><strong>Tamanho:</strong> ${data.tamanho} dígitos</p>
                    <p><strong>Total de agrupamentos de dois em dois:</strong> ${data.total_agrupamentos}</p>
                `;
                
                if (data.palpites_mega) {
                    infoGeral.innerHTML += `
                        <p><strong>Palpites Mega Sena:</strong> ${data.palpites_mega.toLocaleString()}</p>
                    `;
                }
                
                modalBody.appendChild(infoGeral);
                
                // Tabela de resumo
                const tabelaResumo = criarTabelaResumo(data);
                modalBody.appendChild(tabelaResumo);
                
                // Agrupamentos
                const agrupamentosTitle = document.createElement('h3');
                agrupamentosTitle.textContent = 'Agrupamentos de Dois em Dois';
                modalBody.appendChild(agrupamentosTitle);
                
                const detalhesGrid = document.createElement('div');
                detalhesGrid.className = 'detalhes-grid';
                
                data.agrupamentos.forEach(ag => {
                    const detalheItem = document.createElement('div');
                    detalheItem.className = 'detalhe-item';
                    detalheItem.textContent = ag.par_str;
                    detalhesGrid.appendChild(detalheItem);
                });
                
                modalBody.appendChild(detalhesGrid);
                
                // Adicionar tudo ao modal
                modalContent.appendChild(modalHeader);
                modalContent.appendChild(modalBody);
                modalOverlay.appendChild(modalContent);
                
                // Adicionar o modal à página
                document.body.appendChild(modalOverlay);
            })
            .catch(error => {
                alert(`Erro ao carregar os detalhes: ${error.message}`);
            });
    }
    
    // Executar funções iniciais
    // Se houver uma combinação padrão no input, analisar ela
    if (combinacaoInput.value.trim()) {
        analisarCombinacao();
    }
    
    // Exemplo de combinações populares
    const exemplosCombinacoes = {
        "7 dígitos": [
            "0,1,2,3,4,5,6",
            "0,1,2,3,4,5,7",
            "0,1,2,3,4,5,8",
            "0,1,2,3,4,5,9",
            "0,1,2,3,4,6,7"
        ]
    };
    
    // Função para criar tabela de exemplo para a página inicial
    function criarTabelaExemplos() {
        // Criar a tabela de exemplos
        const tabelaExemplos = document.createElement('div');
        tabelaExemplos.className = 'exemplos-container';
        tabelaExemplos.innerHTML = `
            <h2>Exemplos de Combinações</h2>
            <p>Clique em uma combinação para analisá-la:</p>
        `;
        
        const tabela = document.createElement('table');
        tabela.className = 'tabela-combinacoes';
        
        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Dígitos', 'Tamanho Agrupamento', 'Total Combinações', 'Palpites Mega Sena'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        tabela.appendChild(thead);
        
        // Criar corpo da tabela com exemplos
        const tbody = document.createElement('tbody');
        
        const exemplos = [
            {
                combinacao: "0,1,2,3,4,5,6",
                tamanho_agrupamento: 2,
                total_combinacoes: 21,
                palpites_mega: 35280
            },
            {
                combinacao: "0,1,2,3,4,5,7",
                tamanho_agrupamento: 2,
                total_combinacoes: 21,
                palpites_mega: 35280
            },
            {
                combinacao: "0,1,2,3,4,6,7",
                tamanho_agrupamento: 2,
                total_combinacoes: 21,
                palpites_mega: 35280
            },
            {
                combinacao: "0,1,2,3,4,6,8",
                tamanho_agrupamento: 2,
                total_combinacoes: 21,
                palpites_mega: 35280
            },
            {
                combinacao: "0,1,2,3,4,6,9",
                tamanho_agrupamento: 2,
                total_combinacoes: 21,
                palpites_mega: 35280
            }
        ];
        
        exemplos.forEach(exemplo => {
            const row = document.createElement('tr');
            
            // Coluna Dígitos (clicável)
            const tdDigitos = document.createElement('td');
            tdDigitos.textContent = exemplo.combinacao;
            tdDigitos.className = 'combo-cell';
            tdDigitos.style.cursor = 'pointer';
            tdDigitos.addEventListener('click', () => {
                // Preencher o input com esta combinação
                combinacaoInput.value = exemplo.combinacao;
                // Mudar para a tab de combinação específica
                document.querySelector('.tab-btn[data-tab="combinacao"]').click();
                // Analisar a combinação
                analisarCombinacao();
            });
            row.appendChild(tdDigitos);
            
            // Coluna Tamanho Agrupamento
            const tdTamanho = document.createElement('td');
            tdTamanho.textContent = exemplo.tamanho_agrupamento;
            row.appendChild(tdTamanho);
            
            // Coluna Total de Combinações
            const tdTotal = document.createElement('td');
            tdTotal.textContent = exemplo.total_combinacoes;
            row.appendChild(tdTotal);
            
            // Coluna Palpites Mega Sena
            const tdPalpites = document.createElement('td');
            tdPalpites.textContent = exemplo.palpites_mega.toLocaleString();
            row.appendChild(tdPalpites);
            
            tbody.appendChild(row);
        });
        
        tabela.appendChild(tbody);
        tabelaExemplos.appendChild(tabela);
        
        // Adicionar à página
        document.querySelector('.info-box').appendChild(tabelaExemplos);
    }
    
    // Criar a tabela de exemplos
    setTimeout(criarTabelaExemplos, 500);
});