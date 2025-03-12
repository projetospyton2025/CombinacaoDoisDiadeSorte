import math
from itertools import combinations

def calcular_combinacoes(n, k):
    """
    Calcula o número de combinações de n elementos tomados k a k.
    Usa a fórmula matemática de combinação: C(n,k) = n! / (k! * (n-k)!)
    
    Args:
        n: Número total de elementos
        k: Tamanho do subconjunto
        
    Returns:
        Número de combinações possíveis
    """
    return math.comb(n, k)

def calcular_palpites_mega_sena(combinacao):
    """
    Calcula o número de palpites possíveis para a Mega Sena
    baseado em uma combinação de dígitos.
    
    A Mega Sena usa 6 números de 1 a 60.
    
    Args:
        combinacao: Lista ou string contendo a combinação de dígitos
        
    Returns:
        Número de palpites possíveis
    """
    # Converter para lista se for uma string
    if isinstance(combinacao, str):
        combinacao = [int(d) for d in combinacao.split(',')]
    
    # Converter para set para garantir valores únicos
    digitos = set(combinacao)
    
    # Número total de dezenas da Mega Sena
    total_dezenas = 60
    
    # Número de dezenas que formam um jogo (6 para a Mega Sena padrão)
    dezenas_jogo = 6
    
    # Total de combinações possíveis (60 escolher 6)
    total_combinacoes = calcular_combinacoes(total_dezenas, dezenas_jogo)
    
    # Para este exemplo, vamos calcular um valor baseado no tamanho da combinação
    if len(digitos) <= 6:
        # Se temos menos de 6 dígitos, não temos jogos completos
        return 0
    
    # Número de formas de escolher 6 dígitos dentre os disponíveis
    combinacoes_digitos = calcular_combinacoes(len(digitos), 6)
    
    # Número de palpites por combinação de dígitos (exemplo)
    palpites_por_combinacao = 720  # 6! (possíveis ordenações)
    
    # Total estimado de palpites
    total_palpites = combinacoes_digitos * palpites_por_combinacao
    
    # Ajustar para não exceder o total de combinações da Mega Sena
    return min(total_palpites, total_combinacoes)

def calcular_jogos_mega_sena(tamanho_combinacao):
    """
    Calcula o número estimado de jogos da Mega Sena possíveis
    para uma combinação de dígitos de um tamanho específico.
    
    Args:
        tamanho_combinacao: Tamanho da combinação de dígitos
        
    Returns:
        Número estimado de jogos possíveis
    """
    # Total de combinações possíveis na Mega Sena (60 escolher 6)
    total_mega = calcular_combinacoes(60, 6)  # 50.063.860
    
    # Número de combinações de tamanho_combinacao 
    # de dígitos (0-9) tomados tamanho_combinacao a tamanho_combinacao
    total_combinacoes_tamanho = calcular_combinacoes(10, tamanho_combinacao)
    
    # Fator de proporção (ajustável conforme a estratégia)
    if tamanho_combinacao < 6:
        return 0  # Impossível formar jogos completos
    
    # Fórmula ajustada para cada tamanho (exemplo)
    if tamanho_combinacao == 6:
        return 720  # 6! (possíveis arranjos de 6 dígitos)
    elif tamanho_combinacao == 7:
        return calcular_combinacoes(7, 6) * 720  # 7 escolher 6 * 6! = 35.280
    else:
        # Fórmula geral
        combinacoes_6_digitos = calcular_combinacoes(tamanho_combinacao, 6)
        mapeamentos_possiveis = min(10**6, total_mega // combinacoes_6_digitos)
        return combinacoes_6_digitos * mapeamentos_possiveis