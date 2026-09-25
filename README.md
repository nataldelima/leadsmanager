# Lead Extractor Web — Google Maps

Sistema web para **gestão de leads** capturados do Google Maps.

## O que este sistema faz

- Salva leads no **localStorage** do navegador (sem servidor)
- **Deduplicação** automática (nome+endereço, nome+telefone, etc.)
- Tabela interativa: buscar, filtrar por status, editar, excluir, ações em lote
- Status do lead: Novo → Contatado → Interessado → Convertido / Descartado
- Importar JSON/CSV (exportados da extensão original)
- Exportar CSV e JSON
- Fluxo pronto para **Google Sheets** (copiar CSV ou baixar e importar)

## O que ele *não* faz (e por quê)

Não captura automaticamente a lista de resultados do Google Maps.

Navegadores bloqueiam que um site qualquer leia e clique em páginas de outro domínio. Só **extensões** ou **userscripts** (Tampermonkey) conseguem fazer isso. Por isso a captura em massa continua sendo papel da extensão (ou de um userscript).

Este sistema foca em:

1. Organizar e deduplicar os leads
2. Editar e acompanhar status na própria tela
3. Exportar / enviar para planilha

## Como usar

### Opção 1 — Abrir localmente

1. Baixe a pasta `lead-extractor-web`
2. Abra o arquivo `index.html` no Chrome/Edge/Firefox  
   (ou use um servidor local: `npx serve .`)

### Opção 2 — Hospedar

Faça upload da pasta em qualquer hosting estático (Netlify, Vercel, GitHub Pages, etc.).

### Fluxo recomendado com a extensão

1. Use a extensão no Google Maps e capture os leads
2. Exporte em **JSON** ou **CSV**
3. Neste sistema → aba **Importar** → arraste o arquivo ou cole o conteúdo
4. Duplicados são ignorados automaticamente
5. Gerencie status e anotações na aba **Leads**
6. Quando quiser: **Exportar / Sheets** → baixe CSV ou copie e cole no Google Sheets

### Adicionar lead manualmente

Aba **Adicionar** → preencha os campos → Salvar.

Você também pode colar a URL do Maps e abrir o estabelecimento em outra aba para copiar os dados.

## Configurações

- Chave de deduplicação (recomendado: Nome + Endereço)
- Confirmação ao excluir
- Status padrão “Novo”

## Próximos passos possíveis

- Userscript Tampermonkey que extrai o local aberto e copia JSON para colar aqui
- Integração direta com Google Sheets API (OAuth)
- Backend simples para sincronizar entre dispositivos

---

Feito para rodar 100% no navegador, sem dependências externas além das fontes do Google Fonts.
