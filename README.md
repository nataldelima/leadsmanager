# Leads Manager — Google Maps

Sistema web para **gestão de leads** capturados do Google Maps, com dashboard,
histórico de interações, relatórios analíticos e análise por IA.

---

## ✨ O que este sistema faz

### Gestão de leads
- **Login com Google** (Firebase Auth) — cada usuário vê apenas os próprios dados
- **Dados no Firestore** — sincroniza automaticamente entre dispositivos
- **Deduplicação automática** (nome + telefone/endereço)
- **Tabela interativa**: busca, filtros (status, nicho, temperatura, WhatsApp, site),
  ordenação por coluna, paginação e ações em lote
- **Status do funil totalmente configurável** (CRUD via interface)
- **Templates de mensagem** editáveis, com variáveis `{{nome}}`, `{{categoria}}`,
  `{{endereco}}`, `{{telefone}}`, `{{cidade}}`

### Fluxo de prospecção
- **Integração com WhatsApp** — abre o app/Web direto na conversa do lead
- **Contador diário de envios** com limites configuráveis (protege o número contra bloqueio)
- **Follow-ups agendados** — define próximo contato ao enviar mensagem
- **Botão "Adiar"** — empurra o próximo contato em N dias (configurável)
- **Temperatura 0–5** calculada automaticamente (telefone, WhatsApp, site, reputação, nicho)
- **Histórico de interações** por lead, com a mensagem exata enviada

### Dashboard e relatórios
- **Dashboard** com métricas, funil de contato, temperatura e próximos contatos
- **Relatórios por período** (7d, 30d, 90d, mês, ano ou personalizado):
  - KPIs (interações, leads tocados, abordagens, follow-ups, convertidos, descartados)
  - Gráfico de interações por dia
  - Funil de status atingidos
  - Top templates, top leads, transições mais comuns
- **Análise inteligente com IA** (Gemini) — gera relatório qualitativo com
  recomendações acionáveis
- **Salvar relatórios** no Firestore e **exportar para PDF** com layout profissional

### Importação e exportação
- **Importar** JSON ou CSV (exportados da extensão)
- **Exportar** CSV ou JSON (backup local)
- **Exportar CSV** de interações do período

### PWA
- Instalável em desktop e mobile
- Funciona com Service Worker e cache para assets estáticos

---

## 🏗️ Arquitetura

```text
Navegador
├── Firebase Auth (login Google)
├── Firestore (dados do usuário, isolados por UID)
├── Cloudflare Worker (proxy seguro para a API Gemini)
└── Service Worker (PWA / cache)
```


### Estrutura de dados no Firestore

```text
users/{uid}/
├── leads/{leadId} → dados do lead
├── templates/{templateId} → templates de mensagem
├── statuses/{statusId} → status do funil (ordem, isFinal)
├── counters/{YYYY-MM-DD} → contador diário de envios
├── settings/app → configurações do usuário
├── interactions/{interactionId}→ histórico de interações
└── reports/{reportId} → relatórios de IA salvos

```


### Por que a chave da IA está protegida

A chave do Gemini **nunca chega ao navegador**. Ela fica criptografada no
Cloudflare Worker (variável de ambiente `GEMINI_API_KEY`), que atua como
proxy entre o app e a API do Google.


App → Cloudflare Worker → Gemini API
(guarda a chave
---

## 🚀 Como usar

### Pré-requisitos

- Node.js (para servir localmente)
- Conta Google (para o login)
- Conta no [Cloudflare](https://cloudflare.com) (para o proxy da IA, gratuito)
- Chave do Gemini via [Google AI Studio](https://aistudio.google.com/app/apikey)

### Rodando localmente

```bash
npx serve .
# ou
firebase serve --only hosting
```
Abra http://localhost:5000 (ou a porta indicada) e faça login com Google.

Não abra por file:// — o popup do Google Auth exige http ou https.


----

## Deploy

```bash
firebase deploy
```
