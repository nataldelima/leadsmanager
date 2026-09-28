/**
 * Lead Extractor v2 — Sheets-only, Google Login, temperatura, nichos, follow-up
 * v2.1 — Templates expandidos + status proposta/negociacao + variável cidade
 */
(function () {
  'use strict';

  const SETTINGS_KEY = 'gmaps_settings_v2';
  const TEMPLATES_KEY = 'gmaps_templates_v2'; // ⬅️ bump de versão força recarga dos novos templates
  const SESSION_KEY = 'gmaps_session_v1';

  const DEFAULT_TEMPLATES = [
    // ============ ABERTURA ============
    { id: 'tpl_abertura_padrao', name: 'Abertura — padrão', key: 'abordagem',
      body: 'Olá, tudo bem? 👋\n\nMeu nome é Natal, sou desenvolvedor de sistemas e trabalho com criação de sites e soluções digitais para empresas.\n\nEncontrei a {{nome}} e gostei do trabalho de vocês. Estou entrando em contato porque estou oferecendo meus serviços para escritórios de arquitetura que querem ter uma presença profissional na internet e apresentar melhor seus projetos e serviços aos clientes.\n\nPosso te mostrar rapidamente algumas ideias de como isso poderia ser feito para o escritório de vocês, sem compromisso?\n\nSe tiver interesse, posso te enviar alguns exemplos. 🙂' },

    { id: 'tpl_abertura_sem_site', name: 'Abertura — sem site', key: 'abordagem',
      body: 'Olá, tudo bem? 👋\n\nEncontrei o contato da {{nome}} no Google e notei que vocês ainda não têm um site próprio.\n\nSou desenvolvedor e ajudo empresas a criar um site com portfólio, serviços e botão direto pro WhatsApp — pra valorizar o trabalho de vocês e facilitar o contato de novos clientes.\n\nPosso te mandar alguns exemplos rápidos? Sem compromisso. 🙂' },

    // ============ FOLLOW-UPS ============
    { id: 'tpl_follow1', name: 'Follow 1', key: 'follow1',
      body: 'Olá, tudo bem? 😊\n\nPassando só para retomar minha mensagem anterior. Estou entrando em contato com alguns escritórios de arquitetura e engenharia de {{cidade}} para oferecer criação de sites e soluções digitais.\n\nAcredito que um site bem estruturado pode ajudar a valorizar os projetos do escritório e facilitar o contato com novos clientes.\n\nSe fizer sentido para vocês, posso apresentar algumas ideias sem compromisso. 👍' },

    { id: 'tpl_follow2', name: 'Follow 2 (encerramento educado)', key: 'follow2',
      body: 'Olá! Tudo bem? 😊\n\nFaço só mais uma tentativa para não ficar te incomodando.\n\nAcredito que um site poderia ser uma forma interessante de apresentar a {{nome}} de uma maneira mais profissional na internet.\n\nSe em algum momento fizer sentido para vocês, fico à disposição para mostrar algumas ideias. Se não for uma prioridade agora, sem problema algum. 👍\n\nUm abraço! 👋' },

    // ============ OBJEÇÕES ============
    { id: 'tpl_obj_ja_tem_site', name: 'Objeção — já temos site', key: 'objecao',
      body: 'Ah, perfeito! 😊 Nesse caso, melhor ainda.\n\nMeu trabalho também pode ser voltado para melhorias, reformulação ou manutenção de sites já existentes, caso futuramente vocês precisem.\n\nDe qualquer forma, agradeço pelo retorno e desejo muito sucesso para vocês e para a {{nome}}! 🙏🏼' },

    { id: 'tpl_obj_instagram', name: 'Objeção — usamos Instagram', key: 'objecao',
      body: 'Entendo perfeitamente! 😊 As redes sociais realmente são muito importantes para divulgação.\n\nO site acaba funcionando mais como uma apresentação institucional do escritório, mas cada negócio tem seu momento e sua estratégia.\n\nObrigado pelo retorno e desejo muito sucesso para vocês! Caso futuramente queiram complementar a presença digital, fico à disposição. 👍' },

    { id: 'tpl_obj_nao_e_o_momento', name: 'Objeção — agora não é o momento', key: 'objecao',
      body: 'Claro, sem problema! 😊\n\nEntendo perfeitamente. Cada empresa tem seu momento e suas prioridades.\n\nVou deixar meu contato à disposição e, quando fizer sentido investir nessa área, podemos conversar com calma.\n\nDesejo muito sucesso para vocês e para a {{nome}}! 🙏🏼' },

    { id: 'tpl_obj_esta_caro', name: 'Objeção — está muito caro', key: 'objecao',
      body: 'Entendo! 😊\n\nMinha ideia é justamente oferecer uma solução mais acessível para escritórios menores, sem abrir mão de um site profissional e personalizado.\n\nO projeto inclui o desenvolvimento completo e, dependendo da proposta, também posso incluir domínio e hospedagem pelo primeiro ano.\n\nSe quiser, posso verificar uma condição que fique mais confortável para vocês.' },

    { id: 'tpl_obj_sem_verba', name: 'Objeção — não posso investir agora', key: 'objecao',
      body: 'Entendo perfeitamente, principalmente dependendo do momento do escritório. 😊\n\nPara facilitar, consigo trabalhar com pagamento parcelado e dividir o investimento em etapas durante o desenvolvimento.\n\nSe houver interesse em fazer o projeto, posso verificar uma condição que fique mais tranquila para vocês.' },

    { id: 'tpl_obj_vou_pensar', name: 'Objeção — vou pensar / verificar', key: 'objecao',
      body: 'Claro! 😊\n\nFique à vontade para avaliar com calma.\n\nSe surgir qualquer dúvida sobre o projeto, o que está incluído ou sobre as condições de pagamento, pode me chamar que fico à disposição. 👍\n\nObrigado pelo retorno!' },

    { id: 'tpl_obj_gostei_mas', name: 'Objeção — gostei, mas…', key: 'objecao',
      body: 'Que bom que gostou! 😊\n\nMe conta só uma coisa: o que você acha que seria o principal ponto para conseguirmos avançar? É mais uma questão de investimento, momento ou algum detalhe do projeto?\n\nAssim consigo entender melhor e ver se existe alguma forma de adaptar a proposta para vocês.' },

    // ============ PROPOSTA / EXEMPLOS ============
    { id: 'tpl_proposta', name: 'Proposta — quanto custa', key: 'proposta',
      body: 'Que bom que gostou! 😊\n\nSegue o que está incluído no projeto:\n\n🌐 Site institucional personalizado\n📱 Layout responsivo (celular, tablet e desktop)\n🖼️ Portfólio de projetos\n📝 Área de serviços\n💬 Botão direto para WhatsApp\n🔍 Estrutura otimizada para o Google\n\n💰 Investimento:\n• Site institucional personalizado: R$ 999\n• Domínio + hospedagem por 1 ano incluídos\n\n🎁 Condição promocional: De R$ 999 por R$ 745, incluindo domínio e hospedagem por 1 ano.\n\nFaz sentido para vocês? Posso seguir com a proposta?' },

    { id: 'tpl_exemplos', name: 'Exemplos — manda exemplos', key: 'exemplos',
      body: 'Perfeito! 😊\n\nVou te enviar alguns exemplos de trabalhos que desenvolvi, com estilos e estruturas diferentes, para você ter uma ideia do que é possível fazer.\n\n👉 [link do portfólio]\n\nDá uma olhada com calma e me diz o que você acha. Se você gostar de algum estilo, posso pensar em uma estrutura específica para o escritório de vocês. 👍' },

    // ============ ENCERRAMENTOS ============
    { id: 'tpl_enc_nao_interesse', name: 'Encerrar — não tenho interesse', key: 'encerramento',
      body: 'Sem problema algum! 😊\n\nEu que agradeço pela atenção e pelo retorno. Desejo muito sucesso para vocês e para a {{nome}}!\n\nCaso futuramente surja alguma necessidade nessa área, fico à disposição para ajudar.\n\nUm abraço! 👋' },

    { id: 'tpl_enc_nao_preciso', name: 'Encerrar — não preciso de site', key: 'encerramento',
      body: 'Entendo! 😊\n\nCada escritório tem uma estratégia diferente e, se hoje vocês estão conseguindo atender bem às necessidades através de outros canais, faz sentido.\n\nObrigado pela atenção e pelo retorno. Desejo muito sucesso para vocês e para a {{nome}}!\n\nCaso futuramente precisem de alguma solução digital, fico à disposição. 👍' },

    { id: 'tpl_enc_ja_tenho_fornecedor', name: 'Encerrar — já tenho fornecedor', key: 'encerramento',
      body: 'Ah, perfeito! 😊\n\nNesse caso, fico feliz que vocês já tenham alguém cuidando dessa parte.\n\nObrigado pela atenção e desejo muito sucesso para vocês e para a {{nome}}!\n\nSe algum dia precisarem de uma alternativa ou de algum serviço complementar, fico à disposição. 👍' }
  ];

  // Mapa status → template preferido (para abrir o modal já no template certo)
  const STATUS_TEMPLATE_MAP = {
    novo:        'tpl_abertura_padrao',
    abordagem:   'tpl_follow1',
    follow1:     'tpl_follow2',
    follow2:     'tpl_follow2',
    backlog:     'tpl_follow1',
    interessado: 'tpl_exemplos',
    proposta:    'tpl_proposta',
    negociacao:  'tpl_obj_gostei_mas',
    convertido:  'tpl_abertura_padrao',
    descartado:  'tpl_enc_nao_interesse'
  };

  let leads = [];
  let templates = [];
  let settings = {
    googleClientId: '',
    sheetsWebAppUrl: '',
    sheetsName: 'leads',
    followUpDays: 3,
    backlogMonths: 180,
    defaultCountry: '55',
    defaultHasWhatsApp: true,
    confirmDelete: true
  };
  let selectedIds = new Set();
  let waContext = { leadId: null, templateKey: null };
  let currentUser = null;
  let sortState = { key: 'name', dir: 'asc' };
  let pageState = { page: 1, pageSize: 25 };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function normalizeKey(str) {
    if (!str) return '';
    return String(str).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  function leadDedupeKey(lead) {
    var name = normalizeKey(lead.name);
    var phone = String(lead.phone || '').replace(/\D/g, '');
    var address = normalizeKey(lead.address);
    if (phone && phone.length >= 8) return name + '|p:' + phone;
    if (address) return name + '|a:' + address;
    return name || '';
  }

  function isDuplicateLead(lead, againstList) {
    var key = leadDedupeKey(lead);
    if (!key) return false;
    return (againstList || leads).some(function (l) {
      if (lead.id && l.id === lead.id) return false;
      return leadDedupeKey(l) === key;
    });
  }

  // Nichos que dependem fortemente de presença digital (site / landing)
  var DIGITAL_NICHES = [
    'clinica', 'clínica', 'medico', 'médico', 'dentista', 'odont', 'estetica', 'estética',
    'advogad', 'juridic', 'jurídic', 'contab', 'imobili', 'corretor', 'seguro',
    'restaurante', 'lanchonete', 'pizzaria', 'hamburguer', 'café', 'cafe', 'padaria',
    'curso', 'escola', 'treinamento', 'consultor', 'coach', 'terapia', 'psicolog',
    'academia', 'personal', 'salon', 'salão', 'barbearia', 'pet shop', 'veterinar',
    'oficina', 'auto', 'reforma', 'arquitet', 'engenhar', 'construt', 'loja', 'comercio',
    'hotel', 'pousada', 'turismo', 'agencia', 'agência', 'marketing', 'fotografo', 'fotógrafo'
  ];

  function isWeakWebsite(url) {
    if (!url) return true;
    var u = String(url).toLowerCase();
    if (u.length < 10) return true;
    var weak = [
      'instagram.com', 'facebook.com', 'fb.com', 'linktr.ee', 'biolink', 'bit.ly',
      'wa.me', 'api.whatsapp', 'google.com/maps', 'maps.google', 'youtube.com',
      'twitter.com', 'x.com', 'tiktok.com', 'sites.google.com', 'wixsite.com'
    ];
    for (var i = 0; i < weak.length; i++) {
      if (u.indexOf(weak[i]) !== -1) return true;
    }
    return false;
  }

  function hasRealWebsite(lead) {
    var w = (lead.website || '').trim();
    if (!w || w.length < 10) return false;
    return !isWeakWebsite(w);
  }

  function isDigitalNiche(category) {
    var c = normalizeKey(category || '');
    if (!c) return false;
    for (var i = 0; i < DIGITAL_NICHES.length; i++) {
      if (c.indexOf(normalizeKey(DIGITAL_NICHES[i])) !== -1) return true;
    }
    return false;
  }

  /**
   * Temperatura 0–5 para oferta de sites / landing pages:
   * +1 telefone · +1 WhatsApp · +2 sem site (ou site fraco/rede social)
   * +1 reputação (nota ≥ 4 e ≥ 20 avaliações) · +1 nicho digital-dependente
   */
  function calcTemperature(lead) {
    var score = 0;
    var phone = String(lead.phone || '').replace(/\D/g, '');
    if (phone.length >= 8) score += 1;
    if (lead.hasWhatsApp) score += 1;

    var site = (lead.website || '').trim();
    if (!site || site.length < 10 || isWeakWebsite(site)) {
      score += 2;
    }

    var rating = parseFloat(String(lead.rating || '').replace(',', '.'));
    var reviews = parseInt(String(lead.reviews || '').replace(/\D/g, ''), 10);
    if (!isNaN(rating) && rating >= 4.0 && !isNaN(reviews) && reviews >= 20) {
      score += 1;
    }

    if (isDigitalNiche(lead.category)) score += 1;

    return Math.min(5, Math.max(0, score));
  }

  function phoneDigits(p) { return String(p || '').replace(/\D/g, ''); }

  function toWaNumber(phone) {
    var d = phoneDigits(phone);
    if (!d) return '';
    var cc = settings.defaultCountry || '55';
    if (d.startsWith(cc)) return d;
    if (d.length <= 11) return cc + d;
    return d;
  }

  function waMeUrl(phone, text) {
    var num = toWaNumber(phone);
    if (!num) return '';
    var base = 'https://wa.me/' + num;
    return text ? base + '?text=' + encodeURIComponent(text) : base;
  }

  function extractCity(address) {
    if (!address) return '';
    // Tenta pegar a penúltima parte de um endereço separado por vírgula (ex.: "Rua X, 123, Campo Grande - MS")
    var parts = String(address).split(',').map(function (p) { return p.trim(); }).filter(Boolean);
    if (parts.length >= 2) {
      var candidate = parts[parts.length - 2];
      // Remove o "- UF" se estiver colado na última parte
      if (/ - [A-Z]{2}$/.test(candidate)) return candidate.replace(/ - [A-Z]{2}$/, '').trim();
      return candidate;
    }
    return '';
  }

  function applyTemplate(body, lead) {
    return (body || '')
      .replace(/\{\{nome\}\}/gi, lead.name || '')
      .replace(/\{\{categoria\}\}/gi, lead.category || '')
      .replace(/\{\{endereco\}\}/gi, lead.address || '')
      .replace(/\{\{telefone\}\}/gi, lead.phone || '')
      .replace(/\{\{cidade\}\}/gi, extractCity(lead.address || ''));
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch (e) { return '—'; }
  }

  function formatDateLong(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return '—'; }
  }

  function addMonths(date, months) {
    var d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  function daysAgo(iso) {
    if (!iso) return null;
    var t = new Date(iso).getTime();
    if (isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, '&#39;'); }

  function toast(msg, type) {
    type = type || 'success';
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast ' + type;
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.add('hidden'); }, 3200);
  }

  function setLoading(on) {
    document.getElementById('loadingOverlay').classList.toggle('hidden', !on);
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) settings = Object.assign({}, settings, JSON.parse(raw));
    } catch (e) { /* */ }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadTemplates() {
    try {
      var raw = localStorage.getItem(TEMPLATES_KEY);
      if (raw) {
        templates = JSON.parse(raw);
        if (!Array.isArray(templates) || !templates.length) {
          templates = DEFAULT_TEMPLATES.map(function (t) { return Object.assign({}, t); });
          saveTemplates();
        }
      } else {
        templates = DEFAULT_TEMPLATES.map(function (t) { return Object.assign({}, t); });
        saveTemplates();
      }
    } catch (e) {
      templates = DEFAULT_TEMPLATES.map(function (t) { return Object.assign({}, t); });
    }
  }

  function saveTemplates() {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) currentUser = JSON.parse(raw);
    } catch (e) { currentUser = null; }
  }

  function saveSession(user) {
    currentUser = user;
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function parseJwtPayload(token) {
    try {
      var base = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base));
    } catch (e) { return null; }
  }

  function onGoogleCredential(response) {
    var payload = parseJwtPayload(response.credential);
    if (!payload || !payload.email) {
      showLoginError('Falha ao ler credencial Google');
      return;
    }
    saveSession({
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || '',
      credential: response.credential
    });
    enterApp();
  }

  function showLoginError(msg) {
    var el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function initGoogleButton(clientId) {
    if (!clientId || !window.google || !google.accounts) return false;
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: onGoogleCredential,
        auto_select: false
      });
      var host = document.getElementById('g_id_signin_host');
      host.innerHTML = '';
      google.accounts.id.renderButton(host, {
        type: 'standard', size: 'large', theme: 'outline',
        text: 'signin_with', shape: 'rectangular', width: 320
      });
      return true;
    } catch (e) {
      showLoginError('Erro Google Login: ' + e.message);
      return false;
    }
  }

  function tryInitLogin() {
    var cid = settings.googleClientId || document.getElementById('loginClientId').value.trim();
    if (!cid) return;
    document.getElementById('loginClientId').value = cid;
    if (window.google && google.accounts) {
      initGoogleButton(cid);
    } else {
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        if (window.google && google.accounts) {
          clearInterval(t);
          initGoogleButton(cid);
        } else if (tries > 40) {
          clearInterval(t);
          showLoginError('Biblioteca Google não carregou.');
        }
      }, 200);
    }
  }

  function enterApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appRoot').classList.remove('hidden');
    if (currentUser) {
      document.getElementById('userName').textContent = currentUser.name || '';
      document.getElementById('userEmail').textContent = currentUser.email || '';
      var av = document.getElementById('userAvatar');
      if (currentUser.picture) {
        av.src = currentUser.picture;
        av.classList.remove('hidden');
      }
    }
    loadFromSheets();
  }

  function logout() {
    saveSession(null);
    leads = [];
    if (window.google && google.accounts) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) { /* */ }
    }
    document.getElementById('appRoot').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    tryInitLogin();
  }

  function getSheetsUrl() {
    return (settings.sheetsWebAppUrl || '').trim().replace(/\/$/, '');
  }

  async function sheetsRequest(payload) {
    var url = getSheetsUrl();
    if (!url) throw new Error('URL do Web App não configurada (Configurações).');
    payload.sheetName = settings.sheetsName || 'leads';
    if (currentUser && currentUser.email) payload.userEmail = currentUser.email;

    var res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    var text = await res.text();
    var data;
    try { data = JSON.parse(text); }
    catch (e) {
      throw new Error('Resposta inválida do Apps Script. Confira a implantação (Qualquer pessoa).');
    }
    if (!data.ok) throw new Error(data.error || 'Erro no Apps Script');
    return data;
  }

  async function loadFromSheets() {
    if (!getSheetsUrl()) {
      toast('Configure a URL do Web App em Configurações', 'error');
      updateSheetsUI();
      return;
    }
    setLoading(true);
    try {
      var data = await sheetsRequest({ action: 'list' });
      leads = (data.leads || []).map(function (l) {
        l.hasWhatsApp = !!l.hasWhatsApp;
        if (l.temperature === undefined || l.temperature === '') l.temperature = calcTemperature(l);
        else l.temperature = parseInt(l.temperature, 10) || calcTemperature(l);
        return l;
      });
      updateCounts();
      populateNicheFilter();
      renderDashboard();
      renderTable();
      updateSheetsUI();
      toast(leads.length + ' lead(s) da planilha');
    } catch (err) {
      toast(err.message, 'error');
      updateSheetsUI(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateSheetsUI(errMsg) {
    var statusEl = document.getElementById('sheetsConnectionStatus');
    if (!statusEl) return;
    if (!getSheetsUrl()) {
      statusEl.textContent = 'Configure a URL do Web App em Configurações.';
      statusEl.style.color = '';
    } else if (errMsg) {
      statusEl.textContent = '❌ ' + errMsg;
      statusEl.style.color = 'var(--danger)';
    } else {
      statusEl.textContent = '✅ ' + leads.length + ' leads (fonte: planilha)';
      statusEl.style.color = 'var(--success)';
    }
  }

  async function testSheetsConnection() {
    try {
      setLoading(true);
      var data = await sheetsRequest({ action: 'ping' });
      toast('Conexão OK: ' + (data.spreadsheet || 'planilha'));
      updateSheetsUI();
    } catch (err) {
      toast(err.message, 'error');
      updateSheetsUI(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (b) { b.classList.remove('active'); });
    var view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    var btn = document.querySelector('.nav-item[data-view="' + name + '"]');
    if (btn) btn.classList.add('active');
    if (name === 'leads') renderTable();
    if (name === 'dashboard') renderDashboard();
    if (name === 'templates') renderTemplates();
  }

  function updateCounts() {
    var n = leads.length;
    document.getElementById('navLeadCount').textContent = n;
    document.getElementById('storageInfo').textContent = n + ' leads na planilha';
  }

  function populateNicheFilter() {
    var sel = document.getElementById('nicheFilter');
    var current = sel.value;
    var niches = {};
    leads.forEach(function (l) {
      var c = (l.category || '').trim();
      if (c) niches[c] = true;
    });
    var keys = Object.keys(niches).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
    sel.innerHTML = '<option value="all">Todos os nichos</option>' +
      keys.map(function (k) {
        return '<option value="' + escapeAttr(k) + '">' + escapeHtml(k) + '</option>';
      }).join('');
    if (current && (current === 'all' || niches[current])) sel.value = current;
  }

  function countByStatus(s) {
    return leads.filter(function (l) { return (l.status || 'novo') === s; }).length;
  }

  function getFollowUpLeads(days) {
    var funnel = { novo: 1, abordagem: 1, follow1: 1, follow2: 1, interessado: 1, proposta: 1, negociacao: 1 };
    return leads.filter(function (l) {
      var st = l.status || 'novo';
      if (!funnel[st]) return false;
      if (st === 'novo' && !l.lastContactAt) return true;
      var ago = daysAgo(l.lastContactAt);
      if (ago === null) return st === 'novo';
      return ago >= days;
    }).sort(function (a, b) {
      return (daysAgo(b.lastContactAt) || 999) - (daysAgo(a.lastContactAt) || 999);
    });
  }

  function renderDashboard() {
    var total = leads.length;
    var withWa = leads.filter(function (l) { return l.hasWhatsApp && l.phone; }).length;
    var hot = leads.filter(function (l) { return (l.temperature || 0) >= 4; }).length;
    var days = parseInt(settings.followUpDays, 10) || 3;
    document.getElementById('followUpDaysLabel').textContent = '(≥ ' + days + ' dias)';
    var followUps = getFollowUpLeads(days);

    document.getElementById('metricsGrid').innerHTML =
      '<div class="metric-card"><div class="metric-value">' + total + '</div><div class="metric-label">Total</div></div>' +
      '<div class="metric-card wa"><div class="metric-value">' + withWa + '</div><div class="metric-label">Com WhatsApp</div></div>' +
      '<div class="metric-card danger"><div class="metric-value">' + hot + '</div><div class="metric-label">Quentes (4–5)</div></div>' +
      '<div class="metric-card warning"><div class="metric-value">' + followUps.length + '</div><div class="metric-label">Follow-up pendente</div></div>' +
      '<div class="metric-card"><div class="metric-value">' + countByStatus('backlog') + '</div><div class="metric-label">Backlog</div></div>' +
      '<div class="metric-card success"><div class="metric-value">' + (countByStatus('interessado') + countByStatus('proposta') + countByStatus('negociacao') + countByStatus('convertido')) + '</div><div class="metric-label">Interess. + Proposta + Negoc. + Conv.</div></div>';

    var stages = [
      { key: 'novo', label: 'Novo' }, { key: 'abordagem', label: 'Abordagem' },
      { key: 'follow1', label: 'Follow 1' }, { key: 'follow2', label: 'Follow 2' },
      { key: 'backlog', label: 'Backlog' }, { key: 'interessado', label: 'Interessado' },
      { key: 'proposta', label: 'Proposta' }, { key: 'negociacao', label: 'Negociação' },
      { key: 'convertido', label: 'Convertido' }
    ];
    var maxF = Math.max(1, ...stages.map(function (s) { return countByStatus(s.key); }));
    document.getElementById('funnelChart').innerHTML = stages.map(function (s) {
      var c = countByStatus(s.key);
      var pct = Math.round((c / maxF) * 100);
      return '<div class="funnel-item"><span class="funnel-label">' + s.label + '</span>' +
        '<div class="funnel-bar-bg"><div class="funnel-bar" style="width:' + pct + '%"></div></div>' +
        '<span class="funnel-count">' + c + '</span></div>';
    }).join('');

    var fu = document.getElementById('followUpList');
    if (!followUps.length) {
      fu.innerHTML = '<p class="empty-mini">Nenhum follow-up pendente (janela: ' + days + ' dias).</p>';
    } else {
      fu.innerHTML = followUps.slice(0, 12).map(function (l) {
        var ago = daysAgo(l.lastContactAt);
        return '<div class="backlog-item"><span class="name">' + escapeHtml(l.name) +
          ' <span class="temp-badge temp-' + (l.temperature || 0) + '">' + (l.temperature || 0) + '</span></span>' +
          '<span class="date">há ' + (ago != null ? ago + 'd' : '—') + ' · ' + escapeHtml(l.status || '') + '</span></div>';
      }).join('');
    }

    var tempCounts = [0, 0, 0, 0, 0, 0];
    leads.forEach(function (l) {
      var t = parseInt(l.temperature, 10) || 0;
      if (t >= 0 && t <= 5) tempCounts[t]++;
    });
    var maxT = Math.max(1, ...tempCounts);
    document.getElementById('tempChart').innerHTML = tempCounts.map(function (c, i) {
      var pct = Math.round((c / maxT) * 100);
      var label = i === 0 ? '0 frio' : (i === 5 ? '5 quente' : String(i));
      return '<div class="funnel-item"><span class="funnel-label">' + label + '</span>' +
        '<div class="funnel-bar-bg"><div class="funnel-bar" style="width:' + pct + '%"></div></div>' +
        '<span class="funnel-count">' + c + '</span></div>';
    }).join('');

    var bl = leads.filter(function (l) { return l.nextContactAt; })
      .sort(function (a, b) { return new Date(a.nextContactAt) - new Date(b.nextContactAt); })
      .slice(0, 8);
    var blEl = document.getElementById('backlogList');
    if (!bl.length) {
      blEl.innerHTML = '<p class="empty-mini">Nenhum próximo contato agendado.</p>';
    } else {
      var now = new Date();
      blEl.innerHTML = bl.map(function (l) {
        var due = new Date(l.nextContactAt) <= now;
        return '<div class="backlog-item"><span class="name">' + escapeHtml(l.name) + '</span>' +
          '<span class="date" style="' + (due ? 'color:var(--warning)' : '') + '">' +
          (due ? '! ' : '') + formatDateLong(l.nextContactAt) + '</span></div>';
      }).join('');
    }
  }

  function getFilteredLeads() {
    var q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    var status = document.getElementById('statusFilter').value;
    var niche = document.getElementById('nicheFilter').value;
    var temp = document.getElementById('tempFilter').value;
    var wa = document.getElementById('whatsappFilter').value;
    var list = leads.filter(function (l) {
      if (status !== 'all' && (l.status || 'novo') !== status) return false;
      if (niche !== 'all' && (l.category || '').trim() !== niche) return false;
      if (temp !== 'all' && String(l.temperature || 0) !== temp) return false;
      if (wa === 'yes' && !l.hasWhatsApp) return false;
      if (wa === 'no' && l.hasWhatsApp) return false;
      if (!q) return true;
      var hay = [l.name, l.category, l.address, l.phone, l.email, l.notes, l.status].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var key = sortState.key;
    var dir = sortState.dir === 'asc' ? 1 : -1;
    list.sort(function (a, b) {
      var va = a[key];
      var vb = b[key];
      if (key === 'temperature') {
        va = parseInt(va, 10) || 0;
        vb = parseInt(vb, 10) || 0;
        return (va - vb) * dir;
      }
      if (key === 'lastContactAt') {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
        return (va - vb) * dir;
      }
      va = String(va || '').toLowerCase();
      vb = String(vb || '').toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return list;
  }

  function updateSortIndicators() {
    document.querySelectorAll('th.sortable').forEach(function (th) {
      var ind = th.querySelector('.sort-ind');
      if (!ind) return;
      if (th.dataset.sort === sortState.key) {
        ind.textContent = sortState.dir === 'asc' ? ' ↑' : ' ↓';
        th.classList.add('sorted');
      } else {
        ind.textContent = '';
        th.classList.remove('sorted');
      }
    });
  }

  function renderPagination(totalFiltered) {
    var el = document.getElementById('pagination');
    if (!el) return;
    var size = pageState.pageSize || 25;
    var totalPages = Math.max(1, Math.ceil(totalFiltered / size));
    if (pageState.page > totalPages) pageState.page = totalPages;
    if (pageState.page < 1) pageState.page = 1;

    if (totalFiltered === 0) {
      el.innerHTML = '';
      return;
    }

    var from = (pageState.page - 1) * size + 1;
    var to = Math.min(pageState.page * size, totalFiltered);

    el.innerHTML =
      '<div class="pagination-info">Mostrando ' + from + '–' + to + ' de ' + totalFiltered + '</div>' +
      '<div class="pagination-controls">' +
      '<label class="page-size-label">Por página ' +
      '<select id="pageSizeSelect">' +
      '<option value="10"' + (size === 10 ? ' selected' : '') + '>10</option>' +
      '<option value="25"' + (size === 25 ? ' selected' : '') + '>25</option>' +
      '<option value="50"' + (size === 50 ? ' selected' : '') + '>50</option>' +
      '<option value="100"' + (size === 100 ? ' selected' : '') + '>100</option>' +
      '</select></label>' +
      '<button type="button" class="btn btn-sm btn-outline" id="btnPagePrev"' + (pageState.page <= 1 ? ' disabled' : '') + '>← Anterior</button>' +
      '<span class="page-num">Pág. ' + pageState.page + ' / ' + totalPages + '</span>' +
      '<button type="button" class="btn btn-sm btn-outline" id="btnPageNext"' + (pageState.page >= totalPages ? ' disabled' : '') + '>Próxima →</button>' +
      '</div>';

    var prev = document.getElementById('btnPagePrev');
    var next = document.getElementById('btnPageNext');
    var sizeSel = document.getElementById('pageSizeSelect');
    if (prev) prev.addEventListener('click', function () {
      if (pageState.page > 1) { pageState.page--; renderTable(); }
    });
    if (next) next.addEventListener('click', function () {
      if (pageState.page < totalPages) { pageState.page++; renderTable(); }
    });
    if (sizeSel) sizeSel.addEventListener('change', function () {
      pageState.pageSize = parseInt(sizeSel.value, 10) || 25;
      pageState.page = 1;
      renderTable();
    });
  }

  function renderTable() {
    var tbody = document.getElementById('leadsBody');
    var empty = document.getElementById('emptyState');
    var filtered = getFilteredLeads();
    if (!leads.length) {
      tbody.innerHTML = '';
      empty.classList.add('visible');
      renderPagination(0);
      updateSelectionUI();
      return;
    }
    empty.classList.remove('visible');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">Nenhum lead no filtro.</td></tr>';
      renderPagination(0);
      updateSelectionUI();
      return;
    }

    var size = pageState.pageSize || 25;
    var totalPages = Math.max(1, Math.ceil(filtered.length / size));
    if (pageState.page > totalPages) pageState.page = totalPages;
    var start = (pageState.page - 1) * size;
    var pageItems = filtered.slice(start, start + size);

    tbody.innerHTML = pageItems.map(function (l) {
      var status = l.status || 'novo';
      var checked = selectedIds.has(l.id) ? 'checked' : '';
      var temp = l.temperature || 0;
      var phoneHtml = '—';
      if (l.phone) {
        if (l.hasWhatsApp) {
          phoneHtml = '<div class="phone-cell"><a class="wa-link" href="' + escapeAttr(waMeUrl(l.phone)) +
            '" target="_blank" rel="noopener">' + escapeHtml(l.phone) + '</a><span class="wa-badge">WA</span>' +
            '<button type="button" class="btn-icon wa" title="Enviar WhatsApp" data-action="whatsapp" data-id="' + l.id + '">💬</button></div>';
        } else {
          phoneHtml = '<a class="phone-link" href="tel:' + phoneDigits(l.phone) + '">' + escapeHtml(l.phone) + '</a>';
        }
      }
      return '<tr data-id="' + l.id + '">' +
        '<td class="col-check"><input type="checkbox" class="row-check" data-id="' + l.id + '" ' + checked + '></td>' +
        '<td><div class="lead-name">' + escapeHtml(l.name || '—') +
        (l.address ? '<small>' + escapeHtml(l.address) + '</small>' : '') + '</div></td>' +
        '<td>' + escapeHtml(l.category || '—') + '</td>' +
        '<td>' + phoneHtml + '</td>' +
        '<td><span class="temp-badge temp-' + temp + '">' + temp + '</span></td>' +
        '<td><span class="status-badge status-' + status + '">' + status + '</span></td>' +
        '<td>' + formatDate(l.lastContactAt) + '</td>' +
        '<td class="col-actions">' +
        '<button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="' + l.id + '">✏️</button>' +
        '<button type="button" class="btn-icon danger" title="Excluir" data-action="delete" data-id="' + l.id + '">🗑️</button>' +
        '</td></tr>';
    }).join('');
    renderPagination(filtered.length);
    updateSortIndicators();
    updateSelectionUI();
  }

  function updateSelectionUI() {
    var count = selectedIds.size;
    var el = document.getElementById('selectedCount');
    var bulkStatus = document.getElementById('btnBulkStatus');
    var bulkDelete = document.getElementById('btnBulkDelete');
    if (count > 0) {
      el.textContent = count + ' selecionado(s)';
      el.classList.remove('hidden');
      bulkStatus.classList.remove('hidden');
      bulkDelete.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      bulkStatus.classList.add('hidden');
      bulkDelete.classList.add('hidden');
    }
    var selectAll = document.getElementById('selectAll');
    var visible = getFilteredLeads();
    if (visible.length && visible.every(function (l) { return selectedIds.has(l.id); })) {
      selectAll.checked = true; selectAll.indeterminate = false;
    } else if (visible.some(function (l) { return selectedIds.has(l.id); })) {
      selectAll.checked = false; selectAll.indeterminate = true;
    } else {
      selectAll.checked = false; selectAll.indeterminate = false;
    }
  }

  async function addLead(data) {
    var lead = {
      id: uid(),
      name: (data.name || '').trim(),
      category: (data.category || '').trim(),
      address: (data.address || '').trim(),
      phone: (data.phone || '').trim(),
      hasWhatsApp: data.hasWhatsApp !== undefined ? !!data.hasWhatsApp : !!settings.defaultHasWhatsApp,
      email: (data.email || '').trim(),
      website: (data.website || '').trim(),
      rating: (data.rating || '').trim(),
      reviews: (data.reviews || '').trim(),
      hours: (data.hours || '').trim(),
      notes: (data.notes || '').trim(),
      status: data.status || 'novo',
      source: data.source || 'manual',
      timestamp: data.timestamp || new Date().toISOString(),
      lastContactAt: data.lastContactAt || null,
      nextContactAt: data.nextContactAt || null
    };
    lead.temperature = calcTemperature(lead);
    if (!lead.name) { toast('Nome obrigatório', 'error'); return null; }
    if (isDuplicateLead(lead, leads)) {
      toast('Lead duplicado (mesmo nome + telefone/endereço). Não cadastrado.', 'error');
      return null;
    }
    setLoading(true);
    try {
      var res = await sheetsRequest({ action: 'append', leads: [lead] });
      if (res.added === 0) {
        toast('Duplicado na planilha — não cadastrado.', 'error');
        return null;
      }
      leads.unshift(lead);
      updateCounts();
      populateNicheFilter();
      toast('Salvo na planilha: ' + lead.name);
      return lead;
    } catch (err) {
      toast(err.message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadRemote(lead) {
    lead.temperature = calcTemperature(lead);
    setLoading(true);
    try {
      await sheetsRequest({ action: 'update', lead: lead });
      var idx = leads.findIndex(function (l) { return l.id === lead.id; });
      if (idx !== -1) leads[idx] = lead;
      else leads.unshift(lead);
      updateCounts();
      populateNicheFilter();
      toast('Atualizado na planilha');
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteLeadsRemote(ids) {
    setLoading(true);
    try {
      await sheetsRequest({ action: 'delete', ids: ids });
      var set = {};
      ids.forEach(function (id) { set[id] = true; selectedIds.delete(id); });
      leads = leads.filter(function (l) { return !set[l.id]; });
      updateCounts();
      populateNicheFilter();
      toast('Excluído da planilha');
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function splitCSVLine(line, sep) {
    var out = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === sep && !inQ) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function parseCSV(text) {
    var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return [];
    var sep = lines[0].indexOf(';') !== -1 ? ';' : ',';
    var headers = splitCSVLine(lines[0], sep).map(function (h) { return h.trim().toLowerCase(); });
    var map = {
      nome: 'name', name: 'name', categoria: 'category', category: 'category', nicho: 'category',
      endereco: 'address', endereço: 'address', address: 'address',
      telefone: 'phone', phone: 'phone', email: 'email', website: 'website',
      nota: 'rating', rating: 'rating', reviews: 'reviews', status: 'status', notes: 'notes'
    };
    var result = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = splitCSVLine(lines[i], sep);
      var obj = {};
      headers.forEach(function (h, idx) { obj[map[h] || h] = (cols[idx] || '').trim(); });
      if (obj.name) result.push(obj);
    }
    return result;
  }

  async function importData(raw) {
    var items = [];
    var text = typeof raw === 'string' ? raw.trim() : '';
    try {
      if (Array.isArray(raw)) items = raw;
      else if (text.startsWith('[') || text.startsWith('{')) {
        var parsed = JSON.parse(text);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } else items = parseCSV(text);
    } catch (e) {
      return { added: 0, error: 'Inválido: ' + e.message };
    }
    var prepared = items.map(function (item) {
      var lead = {
        id: item.id || uid(),
        name: (item.name || '').trim(),
        category: (item.category || '').trim(),
        address: (item.address || '').trim(),
        phone: (item.phone || '').trim(),
        hasWhatsApp: item.hasWhatsApp !== undefined ? !!item.hasWhatsApp : true,
        email: (item.email || '').trim(),
        website: (item.website || '').trim(),
        rating: (item.rating || '').trim(),
        reviews: (item.reviews || '').trim(),
        hours: (item.hours || '').trim(),
        notes: (item.notes || '').trim(),
        status: item.status || 'novo',
        source: item.source || 'import',
        timestamp: item.timestamp || new Date().toISOString()
      };
      lead.temperature = calcTemperature(lead);
      return lead;
    }).filter(function (l) { return l.name; });

    var seen = {};
    var unique = [];
    var skippedLocal = 0;
    prepared.forEach(function (l) {
      var key = leadDedupeKey(l);
      if (!key || seen[key] || isDuplicateLead(l, leads)) {
        skippedLocal++;
        return;
      }
      seen[key] = true;
      unique.push(l);
    });

    if (!unique.length) {
      return { added: 0, skipped: skippedLocal, error: skippedLocal ? 'Todos os leads são duplicados' : 'Nenhum lead válido' };
    }
    setLoading(true);
    try {
      var res = await sheetsRequest({ action: 'append', leads: unique });
      await loadFromSheets();
      return { added: res.added || 0, skipped: (res.skipped || 0) + skippedLocal };
    } catch (err) {
      return { added: 0, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  function openWaModal(leadId) {
    var lead = leads.find(function (l) { return l.id === leadId; });
    if (!lead || !lead.phone) { toast('Sem telefone', 'error'); return; }
    waContext.leadId = leadId;
    document.getElementById('waLeadName').textContent = lead.name + ' · ' + lead.phone;
    var sel = document.getElementById('waTemplateSelect');
    sel.innerHTML = templates.map(function (t) {
      return '<option value="' + t.id + '">' + escapeHtml(t.name) + '</option>';
    }).join('');
    var preferredId = STATUS_TEMPLATE_MAP[lead.status || 'novo'];
    var preferred = templates.find(function (t) { return t.id === preferredId; });
    if (preferred) sel.value = preferred.id;
    function refresh() {
      var tpl = templates.find(function (t) { return t.id === sel.value; });
      document.getElementById('waMessagePreview').value = tpl ? applyTemplate(tpl.body, lead) : '';
      waContext.templateKey = tpl ? tpl.key : null;
    }
    sel.onchange = refresh;
    refresh();
    document.getElementById('waModal').classList.remove('hidden');
  }

  function closeWaModal() {
    document.getElementById('waModal').classList.add('hidden');
    waContext = { leadId: null, templateKey: null };
  }

  async function markMessageSent() {
    var lead = leads.find(function (l) { return l.id === waContext.leadId; });
    if (!lead) return;
    var key = waContext.templateKey;
    lead.lastContactAt = new Date().toISOString();

    if (key === 'abordagem') {
      lead.status = 'abordagem';
    } else if (key === 'follow1') {
      lead.status = 'follow1';
    } else if (key === 'follow2') {
      lead.status = 'backlog';
      lead.nextContactAt = addMonths(new Date(), parseInt(settings.backlogMonths, 10) || 180).toISOString();
    } else if (key === 'objecao' || key === 'proposta') {
      lead.status = 'negociacao';
    } else if (key === 'exemplos') {
      lead.status = 'interessado';
    } else if (key === 'encerramento') {
      lead.status = 'descartado';
    } else if (lead.status === 'novo') {
      lead.status = 'contatado';
    }

    await updateLeadRemote(lead);
    closeWaModal();
    renderTable();
    renderDashboard();
  }

  function renderTemplates() {
    document.getElementById('templatesList').innerHTML = templates.map(function (t) {
      return '<div class="template-card"><div class="template-card-header"><h4>' + escapeHtml(t.name) +
        '</h4><span class="template-key">' + escapeHtml(t.key) + '</span></div>' +
        '<div class="template-body">' + escapeHtml(t.body) + '</div>' +
        '<div class="template-actions">' +
        '<button class="btn btn-sm btn-outline" data-action="edit-tpl" data-id="' + t.id + '">Editar</button> ' +
        '<button class="btn btn-sm btn-danger-outline" data-action="del-tpl" data-id="' + t.id + '">Excluir</button>' +
        '</div></div>';
    }).join('');
  }

  function toCSV(list) {
    var headers = ['id','name','category','address','phone','hasWhatsApp','email','website','rating','reviews','status','temperature','notes','timestamp','lastContactAt'];
    var labels = ['ID','Nome','Nicho','Endereço','Telefone','WhatsApp','Email','Website','Nota','Avaliações','Status','Temperatura','Obs','Captura','Último Contato'];
    var rows = list.map(function (l) {
      return headers.map(function (h) {
        var v = h === 'hasWhatsApp' ? (l.hasWhatsApp ? 'sim' : 'não') : (l[h] == null ? '' : l[h]);
        v = String(v).replace(/"/g, '""');
        if (v.indexOf(';') !== -1 || v.indexOf('"') !== -1) v = '"' + v + '"';
        return v;
      }).join(';');
    });
    return '\uFEFF' + labels.join(';') + '\n' + rows.join('\n');
  }

  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function openEdit(id) {
    var lead = leads.find(function (l) { return l.id === id; });
    if (!lead) return;
    document.getElementById('editId').value = lead.id;
    document.getElementById('eName').value = lead.name || '';
    document.getElementById('eCategory').value = lead.category || '';
    document.getElementById('eAddress').value = lead.address || '';
    document.getElementById('ePhone').value = lead.phone || '';
    document.getElementById('eHasWhatsApp').checked = !!lead.hasWhatsApp;
    document.getElementById('eEmail').value = lead.email || '';
    document.getElementById('eWebsite').value = lead.website || '';
    document.getElementById('eRating').value = lead.rating || '';
    document.getElementById('eReviews').value = lead.reviews || '';
    document.getElementById('eHours').value = lead.hours || '';
    document.getElementById('eStatus').value = lead.status || 'novo';
    document.getElementById('eNotes').value = lead.notes || '';
    try {
      document.getElementById('eNextContact').value = lead.nextContactAt
        ? new Date(lead.nextContactAt).toISOString().slice(0, 10) : '';
    } catch (e) {
      document.getElementById('eNextContact').value = '';
    }
    document.getElementById('editModal').classList.remove('hidden');
  }

  function bindEvents() {
    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () { showView(btn.dataset.view); });
    });
    document.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () { showView(btn.dataset.goto); });
    });
    document.getElementById('btnLogout').addEventListener('click', logout);
    document.getElementById('btnApplyClientId').addEventListener('click', function () {
      var cid = document.getElementById('loginClientId').value.trim();
      if (!cid) { showLoginError('Informe o Client ID'); return; }
      settings.googleClientId = cid;
      saveSettings();
      document.getElementById('googleClientId').value = cid;
      document.getElementById('loginError').classList.add('hidden');
      tryInitLogin();
      toast('Client ID salvo — use o botão Entrar com o Google');
    });

    document.querySelectorAll('th.sortable').forEach(function (th) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', function () {
        var key = th.dataset.sort;
        if (sortState.key === key) {
          sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        } else {
          sortState.key = key;
          sortState.dir = 'asc';
        }
        pageState.page = 1;
        renderTable();
      });
    });

    ['searchInput', 'statusFilter', 'nicheFilter', 'tempFilter', 'whatsappFilter'].forEach(function (id) {
      var el = document.getElementById(id);
      function onFilter() {
        pageState.page = 1;
        renderTable();
      }
      el.addEventListener('input', onFilter);
      el.addEventListener('change', onFilter);
    });

    document.getElementById('selectAll').addEventListener('change', function (e) {
      var visible = getFilteredLeads();
      if (e.target.checked) visible.forEach(function (l) { selectedIds.add(l.id); });
      else visible.forEach(function (l) { selectedIds.delete(l.id); });
      renderTable();
    });

    document.getElementById('leadsBody').addEventListener('click', function (e) {
      var check = e.target.closest('.row-check');
      if (check) {
        if (check.checked) selectedIds.add(check.dataset.id);
        else selectedIds.delete(check.dataset.id);
        updateSelectionUI();
        return;
      }
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var id = btn.dataset.id;
      if (btn.dataset.action === 'edit') openEdit(id);
      if (btn.dataset.action === 'delete') {
        if (settings.confirmDelete && !confirm('Excluir da planilha?')) return;
        deleteLeadsRemote([id]).then(function () { renderTable(); renderDashboard(); });
      }
      if (btn.dataset.action === 'whatsapp') openWaModal(id);
    });

    document.getElementById('btnBulkDelete').addEventListener('click', function () {
      if (!selectedIds.size) return;
      if (settings.confirmDelete && !confirm('Excluir ' + selectedIds.size + '?')) return;
      deleteLeadsRemote(Array.from(selectedIds)).then(function () { renderTable(); renderDashboard(); });
    });

    document.getElementById('btnBulkStatus').addEventListener('click', async function () {
      if (!selectedIds.size) return;
      var status = prompt('Novo status (novo, abordagem, follow1, follow2, backlog, interessado, proposta, negociacao, convertido, descartado):', 'negociacao');
      if (!status) return;
      var s = status.toLowerCase().trim();
      var validos = ['novo','abordagem','follow1','follow2','backlog','interessado','proposta','negociacao','convertido','descartado'];
      if (validos.indexOf(s) === -1) { toast('Status inválido', 'error'); return; }
      setLoading(true);
      try {
        for (var i = 0; i < leads.length; i++) {
          if (selectedIds.has(leads[i].id)) {
            leads[i].status = s;
            await sheetsRequest({ action: 'update', lead: leads[i] });
          }
        }
        toast('Status atualizado');
        renderTable();
        renderDashboard();
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    });

    document.getElementById('btnRefreshData').addEventListener('click', loadFromSheets);
    document.getElementById('btnRefreshLeads').addEventListener('click', loadFromSheets);
    document.getElementById('btnRefreshData2').addEventListener('click', loadFromSheets);
    document.getElementById('btnTestSheets').addEventListener('click', testSheetsConnection);

    document.getElementById('leadForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var lead = await addLead({
        name: document.getElementById('fName').value,
        category: document.getElementById('fCategory').value,
        address: document.getElementById('fAddress').value,
        phone: document.getElementById('fPhone').value,
        hasWhatsApp: document.getElementById('fHasWhatsApp').checked,
        email: document.getElementById('fEmail').value,
        website: document.getElementById('fWebsite').value,
        rating: document.getElementById('fRating').value,
        reviews: document.getElementById('fReviews').value,
        hours: document.getElementById('fHours').value,
        status: document.getElementById('fStatus').value,
        notes: document.getElementById('fNotes').value
      });
      if (lead) {
        e.target.reset();
        document.getElementById('fHasWhatsApp').checked = settings.defaultHasWhatsApp;
        showView('leads');
        renderTable();
        renderDashboard();
      }
    });

    var dropZone = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');
    dropZone.addEventListener('click', function () { fileInput.click(); });
    dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        var reader = new FileReader();
        reader.onload = async function () {
          var result = await importData(reader.result);
          var el = document.getElementById('importResult');
          el.classList.remove('hidden', 'success', 'error');
          if (result.error) { el.classList.add('error'); el.textContent = result.error; }
          else { el.classList.add('success'); el.textContent = 'Importados ' + result.added; toast('+' + result.added); }
        };
        reader.readAsText(e.dataTransfer.files[0], 'UTF-8');
      }
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = async function () {
          var result = await importData(reader.result);
          var el = document.getElementById('importResult');
          el.classList.remove('hidden', 'success', 'error');
          if (result.error) { el.classList.add('error'); el.textContent = result.error; }
          else { el.classList.add('success'); el.textContent = 'Importados ' + result.added; }
        };
        reader.readAsText(fileInput.files[0], 'UTF-8');
      }
      fileInput.value = '';
    });
    document.getElementById('btnImportPaste').addEventListener('click', async function () {
      var result = await importData(document.getElementById('pasteJson').value);
      var el = document.getElementById('importResult');
      el.classList.remove('hidden', 'success', 'error');
      if (result.error) { el.classList.add('error'); el.textContent = result.error; }
      else { el.classList.add('success'); el.textContent = 'Importados ' + result.added; document.getElementById('pasteJson').value = ''; }
    });

    document.getElementById('btnExportCsv').addEventListener('click', function () {
      if (!leads.length) { toast('Nenhum lead', 'error'); return; }
      download('leads_' + Date.now() + '.csv', toCSV(leads), 'text/csv;charset=utf-8');
    });
    document.getElementById('btnExportJson').addEventListener('click', function () {
      if (!leads.length) { toast('Nenhum lead', 'error'); return; }
      download('leads_' + Date.now() + '.json', JSON.stringify(leads, null, 2), 'application/json');
    });

    document.getElementById('btnSaveSettings').addEventListener('click', function () {
      settings.googleClientId = document.getElementById('googleClientId').value.trim();
      settings.sheetsWebAppUrl = document.getElementById('sheetsWebAppUrl').value.trim();
      settings.sheetsName = document.getElementById('sheetsName').value.trim() || 'leads';
      settings.followUpDays = parseInt(document.getElementById('followUpDays').value, 10) || 3;
      settings.backlogMonths = parseInt(document.getElementById('backlogMonths').value, 10) || 180;
      settings.defaultCountry = document.getElementById('defaultCountry').value.trim() || '55';
      settings.defaultHasWhatsApp = document.getElementById('defaultHasWhatsApp').checked;
      settings.confirmDelete = document.getElementById('confirmDelete').checked;
      saveSettings();
      updateSheetsUI();
      toast('Configurações salvas');
      renderDashboard();
    });

    document.getElementById('modalClose').addEventListener('click', function () {
      document.getElementById('editModal').classList.add('hidden');
    });
    document.getElementById('modalCancel').addEventListener('click', function () {
      document.getElementById('editModal').classList.add('hidden');
    });
    document.getElementById('editForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var id = document.getElementById('editId').value;
      var existing = leads.find(function (l) { return l.id === id; }) || {};
      var nextVal = document.getElementById('eNextContact').value;
      var lead = Object.assign({}, existing, {
        id: id,
        name: document.getElementById('eName').value.trim(),
        category: document.getElementById('eCategory').value.trim(),
        address: document.getElementById('eAddress').value.trim(),
        phone: document.getElementById('ePhone').value.trim(),
        hasWhatsApp: document.getElementById('eHasWhatsApp').checked,
        email: document.getElementById('eEmail').value.trim(),
        website: document.getElementById('eWebsite').value.trim(),
        rating: document.getElementById('eRating').value.trim(),
        reviews: document.getElementById('eReviews').value.trim(),
        hours: document.getElementById('eHours').value.trim(),
        status: document.getElementById('eStatus').value,
        notes: document.getElementById('eNotes').value.trim(),
        nextContactAt: nextVal ? new Date(nextVal + 'T12:00:00').toISOString() : null
      });
      if (await updateLeadRemote(lead)) {
        document.getElementById('editModal').classList.add('hidden');
        renderTable();
        renderDashboard();
      }
    });

    document.getElementById('waModalClose').addEventListener('click', closeWaModal);
    document.getElementById('waModalCancel').addEventListener('click', closeWaModal);
    document.getElementById('btnOpenWhatsApp').addEventListener('click', function () {
      var lead = leads.find(function (l) { return l.id === waContext.leadId; });
      if (!lead) return;
      var url = waMeUrl(lead.phone, document.getElementById('waMessagePreview').value);
      if (url) window.open(url, '_blank', 'noopener');
    });
    document.getElementById('btnMarkSent').addEventListener('click', markMessageSent);

    document.getElementById('btnNewTemplate').addEventListener('click', function () {
      document.getElementById('templateId').value = '';
      document.getElementById('tName').value = '';
      document.getElementById('tKey').value = 'custom';
      document.getElementById('tBody').value = '';
      document.getElementById('templateModal').classList.remove('hidden');
    });
    document.getElementById('templatesList').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'edit-tpl') {
        var t = templates.find(function (x) { return x.id === btn.dataset.id; });
        if (!t) return;
        document.getElementById('templateId').value = t.id;
        document.getElementById('tName').value = t.name;
        document.getElementById('tKey').value = t.key;
        document.getElementById('tBody').value = t.body;
        document.getElementById('templateModal').classList.remove('hidden');
      }
      if (btn.dataset.action === 'del-tpl') {
        if (!confirm('Excluir?')) return;
        templates = templates.filter(function (t) { return t.id !== btn.dataset.id; });
        saveTemplates();
        renderTemplates();
      }
    });
    document.getElementById('templateModalClose').addEventListener('click', function () {
      document.getElementById('templateModal').classList.add('hidden');
    });
    document.getElementById('templateModalCancel').addEventListener('click', function () {
      document.getElementById('templateModal').classList.add('hidden');
    });
    document.getElementById('templateForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('templateId').value;
      var data = {
        name: document.getElementById('tName').value.trim(),
        key: document.getElementById('tKey').value,
        body: document.getElementById('tBody').value
      };
      if (id) {
        var t = templates.find(function (x) { return x.id === id; });
        if (t) { t.name = data.name; t.key = data.key; t.body = data.body; }
      } else {
        templates.push({ id: uid(), name: data.name, key: data.key, body: data.body });
      }
      saveTemplates();
      document.getElementById('templateModal').classList.add('hidden');
      renderTemplates();
    });
  }

  function init() {
    loadSettings();
    loadTemplates();
    loadSession();
    bindEvents();

    document.getElementById('googleClientId').value = settings.googleClientId || '';
    document.getElementById('sheetsWebAppUrl').value = settings.sheetsWebAppUrl || '';
    document.getElementById('sheetsName').value = settings.sheetsName || 'leads';
    document.getElementById('followUpDays').value = settings.followUpDays || 3;
    document.getElementById('backlogMonths').value = settings.backlogMonths || 180;
    document.getElementById('defaultCountry').value = settings.defaultCountry || '55';
    document.getElementById('defaultHasWhatsApp').checked = settings.defaultHasWhatsApp;
    document.getElementById('confirmDelete').checked = settings.confirmDelete;
    document.getElementById('fHasWhatsApp').checked = settings.defaultHasWhatsApp;
    document.getElementById('loginClientId').value = settings.googleClientId || '';

    if (currentUser && currentUser.email) {
      enterApp();
    } else {
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('appRoot').classList.add('hidden');
      tryInitLogin();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
