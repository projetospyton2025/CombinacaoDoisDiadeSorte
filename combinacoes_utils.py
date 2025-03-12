from itertools import combinations

def gerar_combinacoes(n, k):
    """
    Gera todas as combinações possíveis de k elementos a partir de n elementos.
    
    Args:
        n: Lista de elementos
        k: Tamanho da combinação
        
    Returns:
        Lista com todas as combinações
    """
    return list(combinations(n, k))

def contar_por_primeiro_digito(combinacoes):
    """
    Conta as combinações agrupadas pelo primeiro dígito.
    
    Args:
        combinacoes: Lista de combinações
        
    Returns:
        Dicionário com contagem por primeiro dígito
    """
    contagem = {}
    for comb in combinacoes:
        primeiro = comb[0]
        if primeiro not in contagem:
            contagem[primeiro] = 0
        contagem[primeiro] += 1
    return contagem

def calcular_total_agrupamentos_dois_em_dois(combinacao):
    """
    Calcula o total de agrupamentos possíveis de dois em dois para uma combinação.
    
    Args:
        combinacao: Lista com os dígitos da combinação
        
    Returns:
        Total de agrupamentos de dois em dois
    """
    # Total de maneiras de escolher 2 elementos dentre len(combinacao)
    return len(list(combinations(combinacao, 2)))

def analisar_combinacao_especifica(combinacao):
    """
    Analisa uma combinação específica de dígitos (ex: [0,1,2,3,4,5,6]).
    Calcula o total de agrupamentos de 2 em 2 possíveis.
    
    Args:
        combinacao: Lista com os dígitos da combinação
        
    Returns:
        Dicionário com os resultados da análise
    """
    # Converter para lista se for uma string ou tupla
    if isinstance(combinacao, str):
        combinacao = [int(d) for d in combinacao.split(',')]
    elif isinstance(combinacao, tuple):
        combinacao = list(combinacao)
    
    # Calcular agrupamentos de 2 em 2
    agrupamentos_dois = list(combinations(combinacao, 2))
    total_agrupamentos = len(agrupamentos_dois)
    
    return {
        "combinacao": combinacao,
        "tamanho_agrupamento": 2,
        "total_combinacoes": total_agrupamentos,
        "agrupamentos": agrupamentos_dois
    }

def analisar_todas_combinacoes(tamanho):
    """
    Analisa todas as combinações de dígitos com o tamanho especificado.
    
    Args:
        tamanho: Tamanho das combinações a analisar
        
    Returns:
        Lista de dicionários com os resultados das análises
    """
    digitos = list(range(10))  # dígitos de 0 a 9
    todas_combinacoes = list(combinations(digitos, tamanho))
    
    resultados = []
    for comb in todas_combinacoes:
        resultado = analisar_combinacao_especifica(comb)
        resultados.append(resultado)
    
    return resultados