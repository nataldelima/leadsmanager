// assets/js/gemini-service.js

const GEMINI_PROXY_URL = 'https://gemini-proxy.nataldelima.workers.dev';

async function generateAnalyticalReport(interactionsData) {
    const sanitized = interactionsData.map(function (i) {
        return {
            lead: i.leadName || '(lead sem nome)',
            category: i.leadCategory || '(sem nicho)',
            from: i.fromStatus || '(novo)',
            to: i.toStatus || '',
            template: i.templateName || '',
            message: i.message ? i.message.slice(0, 300) : '',
            when: i.timestamp
        };
    });

    const prompt = `Você é um analista de vendas especialista em prospecção B2B. Analise os dados de interação fornecidos abaixo e gere um relatório analítico detalhado.

**REGRAS OBRIGATÓRIAS DE FORMATAÇÃO:**
- Identifique cada lead SEMPRE pelo nome (campo "lead"). Nunca use IDs, códigos ou hashes.
- Ao citar um lead no texto, use negrito: **Nome do Lead**.
- Use markdown limpo: títulos com "##" (nunca duplique, tipo "## ##"), listas com "-", negrito com "**".
- NÃO use cabeçalhos com numeração duplicada. Exemplo correto: "## 1. Resumo Executivo". Exemplo errado: "## ## 1. Resumo Executivo".
- Não use tabelas markdown complexas; prefira listas.
- Se um lead aparecer várias vezes, agrupe e cite uma vez.

**Dados de Interações do Período:**
${sanitized.map(function (i) { return JSON.stringify(i); }).join('\n')}

**Instruções para o Relatório:**

## 1. Resumo Executivo
Um parágrafo resumindo os resultados gerais do período. Cite os leads pelo nome.

## 2. Análise de Funil
Com base nos status "de" e "para", descreva o fluxo dos leads. Quantos avançaram para cada etapa? Onde está o maior gargalo? Cite leads pelo nome.

## 3. Análise de Oportunidades
Identifique os leads com maior potencial (nome, não ID). Quais são as principais objeções ou motivos de perda? Use o campo "template" para inferir a abordagem.

## 4. Principais Métricas
Calcule a taxa de resposta (leads que responderam / total contatados) e a taxa de conversão para "Proposta".

## 5. Pontos de Melhoria e Recomendações
Sugira 3 melhorias acionáveis para o próximo ciclo, baseadas nos dados.`;

    const MAX_TRIES = 4;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
        try {
            const response = await fetch(GEMINI_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt }),   // ⬅️ formato que o Worker espera
            });

            if (response.ok) {
                const result = await response.json();
                return result.text;                          // ⬅️ formato que o Worker devolve
            }

            if (response.status === 429 || response.status === 503) {
                const errorBody = await response.text();
                lastError = new Error(`Erro ${response.status} (tentativa ${attempt}/${MAX_TRIES}): ${errorBody}`);
                console.warn(lastError.message);
                if (attempt < MAX_TRIES) {
                    const waitMs = Math.pow(2, attempt) * 1000;
                    await new Promise(r => setTimeout(r, waitMs));
                    continue;
                }
                throw lastError;
            }

            const errorBody = await response.text();
            throw new Error(`Erro no proxy (${response.status}): ${errorBody}`);

        } catch (error) {
            if (attempt < MAX_TRIES && !lastError) {
                lastError = error;
                const waitMs = Math.pow(2, attempt) * 1000;
                console.warn(`Erro de rede. Aguardando ${waitMs / 1000}s...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            throw error;
        }
    }

    throw lastError || new Error('Falha após múltiplas tentativas');
}

// Expõe a função globalmente para o app.js
window.gemini = {
    generateAnalyticalReport,
};