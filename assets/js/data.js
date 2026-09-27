/**
 * Lead Manager — Data layer foundation
 *
 * Etapa 0/1:
 * - Mantém Google Sheets como backend da versão Demo.
 * - Isola o transporte de dados do restante da aplicação.
 * - Prepara o contrato para um futuro provider Firebase/Firestore.
 *
 * O frontend não precisa conhecer fetch, Apps Script ou Firestore.
 */
(function (global) {
  'use strict';

  var provider = null;

  function createSheetsProvider(config) {
    return {
      async request(payload) {
        var url = (config.getUrl ? config.getUrl() : '').trim();
        if (!url) {
          throw new Error('URL do Web App não configurada (Configurações).');
        }

        var body = Object.assign({}, payload, {
          sheetName: config.getSheetName ? config.getSheetName() : 'leads',
          userEmail: config.getUserEmail ? config.getUserEmail() : ''
        });

        var res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(body)
        });

        var text = await res.text();
        var data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(
            'Resposta inválida do Apps Script. Confira a implantação (Qualquer pessoa).'
          );
        }

        if (!data.ok) {
          throw new Error(data.error || 'Erro no Apps Script');
        }

        return data;
      }
    };
  }

  function configure(config) {
    config = config || {};

    if (config.type === 'sheets') {
      provider = createSheetsProvider(config);
      return;
    }

    throw new Error('Provider de dados não suportado: ' + (config.type || 'desconhecido'));
  }

  async function request(payload) {
    if (!provider) {
      throw new Error('Nenhum provider de dados foi configurado.');
    }

    return provider.request(payload);
  }

  global.LeadManagerData = {
    configure: configure,
    request: request
  };
})(window);
