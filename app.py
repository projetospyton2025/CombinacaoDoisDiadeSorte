from flask import Flask, render_template, jsonify, request
import os
import math
from itertools import combinations
from combinacoes_utils import analisar_combinacao_especifica, analisar_todas_combinacoes
from mega_sena_utils import calcular_palpites_mega_sena, calcular_jogos_mega_sena

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tabela_combinacoes')
def tabela_combinacoes():
    return render_template('tabela_combinacoes.html')

@app.route('/api/combinacoes/<int:tamanho>')
def get_combinacoes(tamanho):
    # Verificar se o tamanho está dentro dos limites permitidos
    if tamanho < 1 or tamanho > 10:
        return jsonify({"error": "Tamanho inválido. Deve ser entre 1 e 10."}), 400
    
    # Gerar todas as combinações possíveis
    digitos = list(range(10))  # dígitos de 0 a 9
    todas_combinacoes = list(combinations(digitos, tamanho))
    
    # Converter combinações para formato de lista
    combinacoes_formatadas = [list(comb) for comb in todas_combinacoes]
    
    # Calcular total
    total = len(combinacoes_formatadas)
    
    # Agrupar por primeiro dígito
    por_primeiro_digito = {}
    for i in range(10):
        por_primeiro_digito[i] = [comb for comb in combinacoes_formatadas if comb[0] == i]
    
    return jsonify({
        "tamanho": tamanho,
        "total": total,
        "por_primeiro_digito": por_primeiro_digito
    })

# Função para calcular o número de combinações de n elementos tomados k a k
def calcular_combinacoes(n, k):
    return math.comb(n, k)

# Função para calcular o número de agrupamentos com duas dezenas
def calcular_agrupamentos_duas_dezenas(tamanho):
    # Para agrupamentos de dois dígitos (0-9), temos 10 escolher 2 = 45 possibilidades
    if tamanho <= 2:
        return tamanho  # Para tamanho 1, apenas 1 agrupamento, para 2, são 2 agrupamentos
    else:
        # Para tamanhos maiores, calculamos quantas combinações de 2 dígitos temos dos 10 dígitos
        return calcular_combinacoes(10, 2)

# Função para calcular combinações de agrupamento em 2
def calcular_combinacoes_agrupadas(tamanho):
    if tamanho <= 2:
        return tamanho
    # Para tamanhos maiores, calculamos com base no número de combinações possíveis dentro de cada agrupamento
    agrupamentos = calcular_agrupamentos_duas_dezenas(tamanho)
    combinacoes_por_agrupamento = calcular_combinacoes(tamanho, 2)
    return agrupamentos * combinacoes_por_agrupamento

@app.route('/api/estatisticas')
def get_estatisticas():
    # Calcular o número de combinações para cada tamanho de 1 a 10
    estatisticas = []
    n = 10  # número total de dígitos (0-9)
    
    for k in range(1, n + 1):
        total_combinacoes = calcular_combinacoes(n, k)
        
        # Calcular os agrupamentos com duas dezenas
        agrupamentos_duas_dezenas = calcular_agrupamentos_duas_dezenas(k)
        
        # Calcular combinações destes agrupamentos
        combinacoes_agrupadas = calcular_combinacoes_agrupadas(k)
        
        estatisticas.append({
            "tamanho": k,
            "total": total_combinacoes,
            "agrupamentos_duas_dezenas": agrupamentos_duas_dezenas,
            "combinacoes_agrupadas": combinacoes_agrupadas
        })
    
    return jsonify(estatisticas)


@app.route('/agrupamento_combinacoes')
def agrupamento_combinacoes():
    """Nova rota para a página de agrupamento de combinações"""
    return render_template('agrupamento_combinacoes.html')


@app.route('/tabela_combinacoes_mega_sena')
def tabela_combinacoes_mega_sena():
    """Nova rota para a página de tabela_combinacoes_mega_sena"""
    return render_template('/tabela_combinacoes_mega_sena.html')


@app.route('/api/combinacao_agrupamentos/<string:combinacao_str>')
def get_combinacao_agrupamentos(combinacao_str):
    """
    Analisa uma combinação específica de dígitos e retorna todos os agrupamentos de 2 em 2.
    
    Args:
        combinacao_str: String com a combinação (ex: "0,1,2,3,4,5,6")
        
    Returns:
        JSON com os dados de agrupamentos
    """
    try:
        # Converter a string para lista de inteiros
        combinacao = [int(d) for d in combinacao_str.replace(' ', '').split(',')]
        
        # Verificar se a combinação é válida
        if len(combinacao) < 2:
            return jsonify({"error": "A combinação deve ter pelo menos 2 dígitos"}), 400
        
        if any(d < 0 or d > 9 for d in combinacao) or len(set(combinacao)) != len(combinacao):
            return jsonify({"error": "Combinação inválida. Use dígitos de 0-9 sem repetição."}), 400
            
        # Calcular agrupamentos de 2 em 2
        agrupamentos_dois = list(combinations(combinacao, 2))
        
        # Formatar para exibição
        agrupamentos_formatados = []
        for ag in agrupamentos_dois:
            agrupamentos_formatados.append({
                "par": list(ag),
                "par_str": f"{ag[0]},{ag[1]}"
            })
        
        # Cálculo correto de palpites para Mega Sena
        palpites_mega = calcular_jogos_mega_sena(len(combinacao))
        
        return jsonify({
            "combinacao": combinacao,
            "tamanho": len(combinacao),
            "tamanho_agrupamento": 2,
            "total_agrupamentos": len(agrupamentos_dois),
            "agrupamentos": agrupamentos_formatados,
            "palpites_mega": palpites_mega
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/combinacoes_agrupadas/<int:tamanho>')
def get_all_combinacoes_agrupadas(tamanho):
    """
    Retorna todas as combinações de um tamanho específico com seus agrupamentos de 2 em 2.
    
    Args:
        tamanho: Tamanho das combinações (número de dígitos)
        
    Returns:
        JSON com todas as combinações e seus agrupamentos
    """
    try:
        # Verificar se o tamanho está dentro dos limites permitidos
        if tamanho < 3 or tamanho > 10:
            return jsonify({"error": "Tamanho inválido. Deve ser entre 3 e 10."}), 400
        
        # Gerar todas as combinações possíveis
        digitos = list(range(10))  # dígitos de 0 a 9
        todas_combinacoes = list(combinations(digitos, tamanho))
        
        # Calcular agrupamentos para cada combinação
        resultados = []
        for comb in todas_combinacoes:
            comb_lista = list(comb)
            agrupamentos_dois = list(combinations(comb_lista, 2))
            
            # Formatar para exibição
            resultados.append({
                "combinacao": comb_lista,
                "combinacao_str": ",".join(map(str, comb_lista)),
                "total_agrupamentos": len(agrupamentos_dois),
                "agrupamentos": [list(ag) for ag in agrupamentos_dois]
            })
        
        return jsonify({
            "tamanho": tamanho,
            "total_combinacoes": len(resultados),
            "resultados": resultados
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/mega_sena/<string:combinacao_str>')
def get_mega_sena_palpites(combinacao_str):
    """
    Calcula o número de palpites possíveis para a Mega Sena
    baseado em uma combinação de dígitos.
    
    Args:
        combinacao_str: String com a combinação (ex: "0,1,2,3,4,5,6")
        
    Returns:
        JSON com os dados de palpites para Mega Sena
    """
    try:
        # Converter a string para lista de inteiros
        combinacao = [int(d) for d in combinacao_str.replace(' ', '').split(',')]
        
        # Verificar se a combinação é válida
        if any(d < 0 or d > 9 for d in combinacao) or len(set(combinacao)) != len(combinacao):
            return jsonify({"error": "Combinação inválida. Use dígitos de 0-9 sem repetição."}), 400
            
        # Cálculo de palpites para Mega Sena
        palpites_mega = calcular_jogos_mega_sena(len(combinacao))
        
        # Total de combinações possíveis na Mega Sena (60 escolher 6)
        total_mega = math.comb(60, 6)  # 50.063.860
        
        # Calcular porcentagem em relação ao total
        porcentagem = (palpites_mega / total_mega) * 100 if total_mega > 0 else 0
        
        return jsonify({
            "combinacao": combinacao,
            "tamanho": len(combinacao),
            "palpites_mega": palpites_mega,
            "total_mega_sena": total_mega,
            "porcentagem_cobertura": round(porcentagem, 6)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400




if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)