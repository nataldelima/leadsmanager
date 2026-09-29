/**
 * Leads Manager v3 — Firebase (Auth + Firestore)
 * Refatorado a partir da v2.1 (Sheets-only)
 */
(function () {
  'use strict';

  const SETTINGS_KEY = 'lm_settings_v3';
  const SESSION_KEY = 'lm_session_v3';

  /* =========================================================
     TEMPLATES PADRÃO (seed no primeiro login)
     ========================================================= */
  const DEFAULT_TEMPLATES = [
    // ============ ABERTURA ============
    {
      name: 'Abertura — padrão', key: 'abordagem', forStatus: 'novo',
      body: 'Olá, tudo bem? 👋\n\nMeu nome é Natal, sou desenvolvedor de sistemas e trabalho com criação de sites e soluções digitais para empresas.\n\nEncontrei a {{nome}} e gostei do trabalho de vocês. Estou entrando em contato porque estou oferecendo meus serviços para escritórios de arquitetura que querem ter uma presença profissional na internet e apresentar melhor seus projetos e serviços aos clientes.\n\nPosso te mostrar rapidamente algumas ideias de como isso poderia ser feito para o escritório de vocês, sem compromisso?\n\nSe tiver interesse, posso te enviar alguns exemplos. 🙂'
    },

    {
      name: 'Abertura — sem site', key: 'abordagem', forStatus: 'novo',
      body: 'Olá, tudo bem? 👋\n\nEncontrei o contato da {{nome}} no Google e notei que vocês ainda não têm um site próprio.\n\nSou desenvolvedor e ajudo empresas a criar um site com portfólio, serviços e botão direto pro WhatsApp — pra valorizar o trabalho de vocês e facilitar o contato de novos clientes.\n\nPosso te mandar alguns exemplos rápidos? Sem compromisso. 🙂'
    },

    // ============ FOLLOW-UPS ============
    {
      name: 'Follow 1', key: 'follow1', forStatus: 'abordagem',
      body: 'Olá, tudo bem? 😊\n\nPassando só para retomar minha mensagem anterior. Estou entrando em contato com alguns escritórios de arquitetura e engenharia de {{cidade}} para oferecer criação de sites e soluções digitais.\n\nAcredito que um site bem estruturado pode ajudar a valorizar os projetos do escritório e facilitar o contato com novos clientes.\n\nSe fizer sentido para vocês, posso apresentar algumas ideias sem compromisso. 👍'
    },

    {
      name: 'Follow 2 (encerramento educado)', key: 'follow2', forStatus: 'follow1',
      body: 'Olá! Tudo bem? 😊\n\nFaço só mais uma tentativa para não ficar te incomodando.\n\nAcredito que um site poderia ser uma forma interessante de apresentar a {{nome}} de uma maneira mais profissional na internet.\n\nSe em algum momento fizer sentido para vocês, fico à disposição para mostrar algumas ideias. Se não for uma prioridade agora, sem problema algum. 👍\n\nUm abraço! 👋'
    },

    // ============ OBJEÇÕES ============
    {
      name: 'Objeção — já temos site', key: 'objecao', forStatus: 'negociacao',
      body: 'Ah, perfeito! 😊 Nesse caso, melhor ainda.\n\nMeu trabalho também pode ser voltado para melhorias, reformulação ou manutenção de sites já existentes, caso futuramente vocês precisem.\n\nDe qualquer forma, agradeço pelo retorno e desejo muito sucesso para vocês e para a {{nome}}! 🙏🏼'
    },

    {
      name: 'Objeção — usamos Instagram', key: 'objecao', forStatus: 'negociacao',
      body: 'Entendo perfeitamente! 😊 As redes sociais realmente são muito importantes para divulgação.\n\nO site acaba funcionando mais como uma apresentação institucional do escritório, mas cada negócio tem seu momento e sua estratégia.\n\nObrigado pelo retorno e desejo muito sucesso para vocês! Caso futuramente queiram complementar a presença digital, fico à disposição. 👍'
    },

    {
      name: 'Objeção — agora não é o momento', key: 'objecao', forStatus: 'negociacao',
      body: 'Claro, sem problema! 😊\n\nEntendo perfeitamente. Cada empresa tem seu momento e suas prioridades.\n\nVou deixar meu contato à disposição e, quando fizer sentido investir nessa área, podemos conversar com calma.\n\nDesejo muito sucesso para vocês e para a {{nome}}! 🙏🏼'
    },

    {
      name: 'Objeção — está muito caro', key: 'objecao', forStatus: 'negociacao',
      body: 'Entendo! 😊\n\nMinha ideia é justamente oferecer uma solução mais acessível para escritórios menores, sem abrir mão de um site profissional e personalizado.\n\nO projeto inclui o desenvolvimento completo e, dependendo da proposta, também posso incluir domínio e hospedagem pelo primeiro ano.\n\nSe quiser, posso verificar uma condição que fique mais confortável para vocês.'
    },

    {
      name: 'Objeção — não posso investir agora', key: 'objecao', forStatus: 'negociacao',
      body: 'Entendo perfeitamente, principalmente dependendo do momento do escritório. 😊\n\nPara facilitar, consigo trabalhar com pagamento parcelado e dividir o investimento em etapas durante o desenvolvimento.\n\nSe houver interesse em fazer o projeto, posso verificar uma condição que fique mais tranquila para vocês.'
    },

    {
      name: 'Objeção — vou pensar / verificar', key: 'objecao', forStatus: 'negociacao',
      body: 'Claro! 😊\n\nFique à vontade para avaliar com calma.\n\nSe surgir qualquer dúvida sobre o projeto, o que está incluído ou sobre as condições de pagamento, pode me chamar que fico à disposição. 👍\n\nObrigado pelo retorno!'
    },

    {
      name: 'Objeção — gostei, mas…', key: 'objecao', forStatus: 'negociacao',
      body: 'Que bom que gostou! 😊\n\nMe conta só uma coisa: o que você acha que seria o principal ponto para conseguirmos avançar? É mais uma questão de investimento, momento ou algum detalhe do projeto?\n\nAssim consigo entender melhor e ver se existe alguma forma de adaptar a proposta para vocês.'
    },

    // ============ PROPOSTA / EXEMPLOS ============
    {
      name: 'Proposta — quanto custa', key: 'proposta', forStatus: 'proposta',
      body: 'Que bom que gostou! 😊\n\nSegue o que está incluído no projeto:\n\n🌐 Site institucional personalizado\n📱 Layout responsivo (celular, tablet e desktop)\n🖼️ Portfólio de projetos\n📝 Área de serviços\n💬 Botão direto para WhatsApp\n🔍 Estrutura otimizada para o Google\n\n💰 Investimento:\n• Site institucional personalizado: R$ 999\n• Domínio + hospedagem por 1 ano incluídos\n\n🎁 Condição promocional: De R$ 999 por R$ 745, incluindo domínio e hospedagem por 1 ano.\n\nFaz sentido para vocês? Posso seguir com a proposta?'
    },

    {
      name: 'Exemplos — manda exemplos', key: 'exemplos', forStatus: 'interessado',
      body: 'Perfeito! 😊\n\nVou te enviar alguns exemplos de trabalhos que desenvolvi, com estilos e estruturas diferentes, para você ter uma ideia do que é possível fazer.\n\n👉 [link do portfólio]\n\nDá uma olhada com calma e me diz o que você acha. Se você gostar de algum estilo, posso pensar em uma estrutura específica para o escritório de vocês. 👍'
    },

    // ============ ENCERRAMENTOS ============
    {
      name: 'Encerrar — não tenho interesse', key: 'encerramento', forStatus: 'descartado',
      body: 'Sem problema algum! 😊\n\nEu que agradeço pela atenção e pelo retorno. Desejo muito sucesso para vocês e para a {{nome}}!\n\nCaso futuramente surja alguma necessidade nessa área, fico à disposição para ajudar.\n\nUm abraço! 👋'
    },

    {
      name: 'Encerrar — não preciso de site', key: 'encerramento', forStatus: 'descartado',
      body: 'Entendo! 😊\n\nCada escritório tem uma estratégia diferente e, se hoje vocês estão conseguindo atender bem às necessidades através de outros canais, faz sentido.\n\nObrigado pela atenção e pelo retorno. Desejo muito sucesso para vocês e para a {{nome}}!\n\nCaso futuramente precisem de alguma solução digital, fico à disposição. 👍'
    },

    {
      name: 'Encerrar — já tenho fornecedor', key: 'encerramento', forStatus: 'descartado',
      body: 'Ah, perfeito! 😊\n\nNesse caso, fico feliz que vocês já tenham alguém cuidando dessa parte.\n\nObrigado pela atenção e desejo muito sucesso para vocês e para a {{nome}}!\n\nSe algum dia precisarem de uma alternativa ou de algum serviço complementar, fico à disposição. 👍'
    }
  ];

  /* =========================================================
     ESTADO GLOBAL
     ========================================================= */
  let leads = [];
  let templates = [];
  let statuses = [];
  let settings = {
    followUpDays: 3,
    backlogMonths: 180,
    defaultCountry: '55',
    defaultHasWhatsApp: true,
    confirmDelete: true,
    dailySafeLimit: 20,
    dailyWarnLimit: 30
  };
  let selectedIds = new Set();
  let waContext = { leadId: null, templateKey: null, counted: false };
  let currentUser = null;
  let sortState = { key: 'name', dir: 'asc' };
  let pageState = { page: 1, pageSize: 25 };

  /* =========================================================
     UTILITÁRIOS GERAIS
     ========================================================= */
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

  function isDigitalNiche(category) {
    var c = normalizeKey(category || '');
    if (!c) return false;
    for (var i = 0; i < DIGITAL_NICHES.length; i++) {
      if (c.indexOf(normalizeKey(DIGITAL_NICHES[i])) !== -1) return true;
    }
    return false;
  }

  function calcTemperature(lead) {
    var score = 0;
    var phone = String(lead.phone || '').replace(/\D/g, '');
    if (phone.length >= 8) score += 1;
    if (lead.hasWhatsApp) score += 1;

    var site = (lead.website || '').trim();
    if (!site || site.length < 10 || isWeakWebsite(site)) score += 2;

    var rating = parseFloat(String(lead.rating || '').replace(',', '.'));
    var reviews = parseInt(String(lead.reviews || '').replace(/\D/g, ''), 10);
    if (!isNaN(rating) && rating >= 4.0 && !isNaN(reviews) && reviews >= 20) score += 1;

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
    var parts = String(address).split(',').map(function (p) { return p.trim(); }).filter(Boolean);
    if (parts.length >= 2) {
      var candidate = parts[parts.length - 2];
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
  window.toast = toast;

  function setLoading(on) {
    document.getElementById('loadingOverlay').classList.toggle('hidden', !on);
  }

  function showLoginError(msg) {
    var el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  /* =========================================================
     CONFIGURAÇÕES LOCAIS (não vão pro banco)
     ========================================================= */
  /* Cache local (rápido, funciona offline) */
  function loadSettingsFromCache() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) settings = Object.assign({}, settings, JSON.parse(raw));
    } catch (e) { /* */ }
  }

  function cacheSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { }
  }

  /* Nuvem (fonte de verdade) */
  async function loadSettingsFromCloud() {
    try {
      var remote = await window.fb.getSettings();
      if (remote) {
        var copy = Object.assign({}, remote);
        delete copy.updatedAt;
        settings = Object.assign({}, settings, copy);
      } else {
        // Primeiro login: sobe os defaults como doc inicial
        await window.fb.saveSettings(settings);
      }
      cacheSettings();
    } catch (e) {
      console.warn('Settings cloud indisponível, usando cache local:', e);
    }
  }

  async function saveSettings() {
    cacheSettings(); // imediato para resposta rápida
    try {
      await window.fb.saveSettings(settings);
    } catch (e) {
      toast('Falha ao salvar na nuvem: ' + e.message, 'error');
    }
  }

  /* Aplica os valores atuais nos campos do formulário de Configurações */
  function applySettingsToForm() {
    var setVal = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
    var setChk = function (id, v) { var el = document.getElementById(id); if (el) el.checked = v; };

    setVal('followUpDays', settings.followUpDays || 3);
    setVal('backlogMonths', settings.backlogMonths || 180);
    setVal('defaultCountry', settings.defaultCountry || '55');
    setVal('dailySafeLimit', settings.dailySafeLimit || 20);
    setVal('dailyWarnLimit', settings.dailyWarnLimit || 30);
    setChk('defaultHasWhatsApp', settings.defaultHasWhatsApp);
    setChk('confirmDelete', settings.confirmDelete);
    setChk('fHasWhatsApp', settings.defaultHasWhatsApp);
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

  /* =========================================================
     STATUS HELPERS
     ========================================================= */
  function sortedStatuses() {
    return [...statuses].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  function statusLabel(key) {
    var s = statuses.find(x => x.key === key);
    return s ? s.label : (key || '—');
  }

  function populateStatusSelects() {
    var opts = sortedStatuses()
      .map(s => `<option value="${escapeAttr(s.key)}">${escapeHtml(s.label)}</option>`)
      .join('');
    var sf = document.getElementById('statusFilter');
    var fs = document.getElementById('fStatus');
    var es = document.getElementById('eStatus');
    if (sf) sf.innerHTML = '<option value="all">Todos os status</option>' + opts;
    if (fs) fs.innerHTML = opts;
    if (es) es.innerHTML = opts;
  }

  /* =========================================================
     ENTRAR / SAIR
     ========================================================= */
  async function doLogin() {
    try {
      document.getElementById('loginError').classList.add('hidden');
      await window.fb.loginGoogle();
      // onAuthStateChanged vai disparar o resto
    } catch (e) {
      showLoginError(e.message || 'Falha no login');
    }
  }

  async function enterApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appRoot').classList.remove('hidden');
    if (currentUser) {
      document.getElementById('userName').textContent = currentUser.name || '';
      document.getElementById('userEmail').textContent = currentUser.email || '';
      var av = document.getElementById('userAvatar');
      if (currentUser.picture) {
        av.src = currentUser.picture;
        av.classList.remove('hidden');
      } else {
        av.classList.add('hidden');
      }
    }

    await loadSettingsFromCloud();
    applySettingsToForm();

    await loadAll();

    var overdue = getOverdueLeads().length;
    if (overdue > 0) {
      setTimeout(function () {
        toast('⚠️ ' + overdue + ' follow-up' + (overdue > 1 ? 's' : '') + ' vencido' + (overdue > 1 ? 's' : ''), 'error');
      }, 800);
    }

    await updateWppCounter();
  }

  function logout() {
    window.fb.logout();
    saveSession(null);
    leads = [];
    templates = [];
    statuses = [];
    document.getElementById('appRoot').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
  }

  /* =========================================================
     CARREGAR DADOS
     ========================================================= */
  async function loadAll() {
    setLoading(true);
    try {
      const [l, t, s] = await Promise.all([
        window.fb.listLeads(),
        window.fb.listTemplates(),
        window.fb.listStatuses()
      ]);

      leads = l.map(x => {
        x.hasWhatsApp = !!x.hasWhatsApp;
        x.temperature = (x.temperature !== undefined && x.temperature !== '')
          ? parseInt(x.temperature, 10) || 0
          : calcTemperature(x);
        return x;
      });
      templates = t;
      statuses = s;

      updateCounts();
      populateNicheFilter();
      populateStatusSelects();
      renderDashboard();
      renderTable();
      renderTemplates();
      renderStatuses();
      toast(leads.length + ' lead(s) carregado(s)');
    } catch (e) {
      console.error(e);
      toast(e.message || 'Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     NAVEGAÇÃO
     ========================================================= */
  function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    var view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    var btn = document.querySelector('.nav-item[data-view="' + name + '"]');
    if (btn) btn.classList.add('active');
    if (name === 'leads') renderTable();
    if (name === 'dashboard') renderDashboard();
    if (name === 'templates') renderTemplates();
    if (name === 'statuses') renderStatuses();
  }

  function updateCounts() {
    document.getElementById('navLeadCount').textContent = leads.length;
    document.getElementById('storageInfo').textContent = leads.length + ' leads (Firestore)';
    updateOverdueBadge();
  }

  function populateNicheFilter() {
    var sel = document.getElementById('nicheFilter');
    var current = sel.value;
    var niches = {};
    leads.forEach(l => { var c = (l.category || '').trim(); if (c) niches[c] = true; });
    var keys = Object.keys(niches).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    sel.innerHTML = '<option value="all">Todos os nichos</option>' +
      keys.map(k => '<option value="' + escapeAttr(k) + '">' + escapeHtml(k) + '</option>').join('');
    if (current && (current === 'all' || niches[current])) sel.value = current;
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */
  function countByStatus(s) {
    return leads.filter(l => (l.status || 'novo') === s).length;
  }

  function getFollowUpLeads(days) {
    var funnel = { novo: 1, abordagem: 1, follow1: 1, follow2: 1, interessado: 1, proposta: 1, negociacao: 1 };
    return leads.filter(l => {
      var st = l.status || 'novo';
      if (!funnel[st]) return false;
      if (st === 'novo' && !l.lastContactAt) return true;
      var ago = daysAgo(l.lastContactAt);
      if (ago === null) return st === 'novo';
      return ago >= days;
    }).sort((a, b) => (daysAgo(b.lastContactAt) || 999) - (daysAgo(a.lastContactAt) || 999));
  }

  function isOverdue(lead) {
    if (!lead.nextContactAt) return false;
    var t = new Date(lead.nextContactAt).getTime();
    return !isNaN(t) && t <= Date.now();
  }

  function getOverdueLeads() {
    return leads.filter(isOverdue).sort(function (a, b) {
      return new Date(a.nextContactAt) - new Date(b.nextContactAt);
    });
  }

  function updateOverdueBadge() {
    var el = document.getElementById('navOverdueCount');
    if (!el) return;
    var count = getOverdueLeads().length;
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  }

  function renderDashboard() {
    var total = leads.length;
    var withWa = leads.filter(l => l.hasWhatsApp && l.phone).length;
    var hot = leads.filter(l => (l.temperature || 0) >= 4).length;
    var days = parseInt(settings.followUpDays, 10) || 3;
    document.getElementById('followUpDaysLabel').textContent = '(≥ ' + days + ' dias)';
    var followUps = getFollowUpLeads(days);

    // "Avançados" = status além do follow2/backlog e que não sejam descartado
    var advanced = leads.filter(l => {
      var st = l.status || 'novo';
      return st !== 'novo' && st !== 'abordagem' && st !== 'follow1'
        && st !== 'follow2' && st !== 'backlog' && st !== 'descartado';
    }).length;

    document.getElementById('metricsGrid').innerHTML =
      '<div class="metric-card"><div class="metric-value">' + total + '</div><div class="metric-label">Total</div></div>' +
      '<div class="metric-card wa"><div class="metric-value">' + withWa + '</div><div class="metric-label">Com WhatsApp</div></div>' +
      '<div class="metric-card danger"><div class="metric-value">' + hot + '</div><div class="metric-label">Quentes (4–5)</div></div>' +
      '<div class="metric-card warning"><div class="metric-value">' + followUps.length + '</div><div class="metric-label">Follow-up pendente</div></div>' +
      '<div class="metric-card"><div class="metric-value">' + countByStatus('backlog') + '</div><div class="metric-label">Backlog</div></div>' +
      '<div class="metric-card success"><div class="metric-value">' + advanced + '</div><div class="metric-label">Avançados</div></div>';

    // Funil dinâmico a partir de statuses
    var stages = sortedStatuses();
    var maxF = Math.max(1, ...stages.map(s => countByStatus(s.key)));
    document.getElementById('funnelChart').innerHTML = stages.map(s => {
      var c = countByStatus(s.key);
      var pct = Math.round((c / maxF) * 100);
      return '<div class="funnel-item"><span class="funnel-label">' + escapeHtml(s.label) + '</span>' +
        '<div class="funnel-bar-bg"><div class="funnel-bar" style="width:' + pct + '%"></div></div>' +
        '<span class="funnel-count">' + c + '</span></div>';
    }).join('');

    // Follow-ups
    var fu = document.getElementById('followUpList');
    if (!followUps.length) {
      fu.innerHTML = '<p class="empty-mini">Nenhum follow-up pendente (janela: ' + days + ' dias).</p>';
    } else {
      fu.innerHTML = followUps.slice(0, 12).map(l => {
        var ago = daysAgo(l.lastContactAt);
        return '<div class="backlog-item"><span class="name">' + escapeHtml(l.name) +
          ' <span class="temp-badge temp-' + (l.temperature || 0) + '">' + (l.temperature || 0) + '</span></span>' +
          '<span class="date">há ' + (ago != null ? ago + 'd' : '—') + ' · ' + escapeHtml(statusLabel(l.status)) + '</span></div>';
      }).join('');
    }

    // Por temperatura
    var tempCounts = [0, 0, 0, 0, 0, 0];
    leads.forEach(l => {
      var t = parseInt(l.temperature, 10) || 0;
      if (t >= 0 && t <= 5) tempCounts[t]++;
    });
    var maxT = Math.max(1, ...tempCounts);
    document.getElementById('tempChart').innerHTML = tempCounts.map((c, i) => {
      var pct = Math.round((c / maxT) * 100);
      var label = i === 0 ? '0 frio' : (i === 5 ? '5 quente' : String(i));
      return '<div class="funnel-item"><span class="funnel-label">' + label + '</span>' +
        '<div class="funnel-bar-bg"><div class="funnel-bar" style="width:' + pct + '%"></div></div>' +
        '<span class="funnel-count">' + c + '</span></div>';
    }).join('');

    // Próximos contatos
    var bl = leads.filter(l => l.nextContactAt)
      .sort((a, b) => new Date(a.nextContactAt) - new Date(b.nextContactAt))
      .slice(0, 8);
    var blEl = document.getElementById('backlogList');
    if (!bl.length) {
      blEl.innerHTML = '<p class="empty-mini">Nenhum próximo contato agendado.</p>';
    } else {
      var now = new Date();
      blEl.innerHTML = bl.map(l => {
        var due = new Date(l.nextContactAt) <= now;
        return '<div class="backlog-item"><span class="name">' + escapeHtml(l.name) + '</span>' +
          '<span class="date" style="' + (due ? 'color:var(--danger);font-weight:700' : '') + '">' +
          (due ? '! ' : '') + formatDateLong(l.nextContactAt) + '</span></div>';
      }).join('');
    }
  }

  async function updateWppCounter() {
    try {
      var el = document.getElementById('wppCounter');
      if (!el) return;
      var count = await window.fb.getTodayCounter();
      var safe = parseInt(settings.dailySafeLimit, 10) || 20;
      var warn = parseInt(settings.dailyWarnLimit, 10) || 30;
      document.getElementById('wppCount').textContent = count;
      document.getElementById('wppLimit').textContent = safe;
      el.classList.remove('ok', 'warn', 'danger');
      if (count < safe) el.classList.add('ok');
      else if (count < warn) el.classList.add('warn');
      else el.classList.add('danger');
    } catch (e) {
      console.warn('WPP counter:', e);
    }
  }

  /* =========================================================
     TABELA / FILTROS
     ========================================================= */
  function getFilteredLeads() {
    var q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    var status = document.getElementById('statusFilter').value;
    var niche = document.getElementById('nicheFilter').value;
    var temp = document.getElementById('tempFilter').value;
    var wa = document.getElementById('whatsappFilter').value;

    var list = leads.filter(l => {
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
    list.sort((a, b) => {
      var va = a[key], vb = b[key];
      if (key === 'temperature') {
        va = parseInt(va, 10) || 0; vb = parseInt(vb, 10) || 0;
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
    document.querySelectorAll('th.sortable').forEach(th => {
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
    if (totalFiltered === 0) { el.innerHTML = ''; return; }

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
    if (prev) prev.addEventListener('click', () => { if (pageState.page > 1) { pageState.page--; renderTable(); } });
    if (next) next.addEventListener('click', () => { if (pageState.page < totalPages) { pageState.page++; renderTable(); } });
    if (sizeSel) sizeSel.addEventListener('change', () => {
      pageState.pageSize = parseInt(sizeSel.value, 10) || 25;
      pageState.page = 1; renderTable();
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

    tbody.innerHTML = pageItems.map(l => {
      var status = l.status || 'novo';
      var checked = selectedIds.has(l.id) ? 'checked' : '';
      var temp = l.temperature || 0;
      var overdue = isOverdue(l);

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

      return '<tr data-id="' + l.id + '"' + (overdue ? ' class="row-overdue"' : '') + '>' +
        '<td class="col-check"><input type="checkbox" class="row-check" data-id="' + l.id + '" ' + checked + '></td>' +
        '<td><div class="lead-name">' + escapeHtml(l.name || '—') +
        (overdue ? '<span class="overdue-dot" title="Follow-up vencido"></span>' : '') +
        (l.address ? '<small>' + escapeHtml(l.address) + '</small>' : '') + '</div></td>' +
        '<td>' + escapeHtml(l.category || '—') + '</td>' +
        '<td>' + phoneHtml + '</td>' +
        '<td><span class="temp-badge temp-' + temp + '">' + temp + '</span></td>' +
        '<td><span class="status-badge status-' + escapeAttr(status) + '">' + escapeHtml(statusLabel(status)) + '</span></td>' +
        '<td>' + formatDate(l.lastContactAt) + '</td>' +
        '<td class="col-actions">' +
        '<button type="button" class="btn-icon" title="Editar" data-action="edit" data-id="' + l.id + '">✏️</button>' +
        '<button type="button" class="btn-icon snooze" title="Adiar 3 dias" data-action="snooze" data-id="' + l.id + '">📅</button>' +
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
    if (visible.length && visible.every(l => selectedIds.has(l.id))) {
      selectAll.checked = true; selectAll.indeterminate = false;
    } else if (visible.some(l => selectedIds.has(l.id))) {
      selectAll.checked = false; selectAll.indeterminate = true;
    } else {
      selectAll.checked = false; selectAll.indeterminate = false;
    }
  }

  /* =========================================================
     CRUD LEADS
     ========================================================= */
  async function addLead(data) {
    var lead = {
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
      status: data.status || (sortedStatuses()[0]?.key || 'novo'),
      source: data.source || 'manual',
      timestamp: data.timestamp || new Date().toISOString(),
      lastContactAt: data.lastContactAt || null,
      nextContactAt: data.nextContactAt || null
    };
    lead.temperature = calcTemperature(lead);
    if (!lead.name) { toast('Nome obrigatório', 'error'); return null; }
    if (isDuplicateLead(lead, leads)) {
      toast('Lead duplicado (mesmo nome + telefone/endereço).', 'error');
      return null;
    }

    setLoading(true);
    try {
      var created = await window.fb.addLead(lead);
      leads.unshift(created);
      updateCounts();
      populateNicheFilter();
      toast('Salvo: ' + created.name);
      return created;
    } catch (e) {
      toast(e.message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function snoozeLead(id, days) {
    var lead = leads.find(l => l.id === id);
    if (!lead) return;

    // Base: se já venceu ou não tem data, conta a partir de agora.
    // Se ainda está no futuro, soma à data atual.
    var base;
    if (lead.nextContactAt && new Date(lead.nextContactAt).getTime() > Date.now()) {
      base = new Date(lead.nextContactAt);
    } else {
      base = new Date();
    }
    base.setDate(base.getDate() + days);
    lead.nextContactAt = base.toISOString();

    await updateLeadRemote(lead);
    renderTable();
    renderDashboard();
    toast('Adiado por ' + days + ' dias');
  }

  async function updateLeadRemote(lead) {
    lead.temperature = calcTemperature(lead);
    setLoading(true);
    try {
      await window.fb.updateLead(lead.id, lead);
      var idx = leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) leads[idx] = lead;
      else leads.unshift(lead);
      updateCounts();
      populateNicheFilter();
      toast('Atualizado');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteLeadsRemote(ids) {
    setLoading(true);
    try {
      await window.fb.deleteLeads(ids);
      var set = new Set(ids);
      leads = leads.filter(l => !set.has(l.id));
      ids.forEach(id => selectedIds.delete(id));
      updateCounts();
      populateNicheFilter();
      toast('Excluído');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     IMPORTAÇÃO
     ========================================================= */
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
    var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    var sep = lines[0].indexOf(';') !== -1 ? ';' : ',';
    var headers = splitCSVLine(lines[0], sep).map(h => h.trim().toLowerCase());
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
      headers.forEach((h, idx) => { obj[map[h] || h] = (cols[idx] || '').trim(); });
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

    var defaultStatus = sortedStatuses()[0]?.key || 'novo';
    var prepared = items.map(item => {
      var lead = {
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
        status: item.status || defaultStatus,
        source: item.source || 'import',
        timestamp: item.timestamp || new Date().toISOString()
      };
      lead.temperature = calcTemperature(lead);
      return lead;
    }).filter(l => l.name);

    var seen = {};
    var unique = [];
    var skippedLocal = 0;
    prepared.forEach(l => {
      var key = leadDedupeKey(l);
      if (!key || seen[key] || isDuplicateLead(l, leads)) { skippedLocal++; return; }
      seen[key] = true;
      unique.push(l);
    });

    if (!unique.length) {
      return { added: 0, skipped: skippedLocal, error: skippedLocal ? 'Todos são duplicados' : 'Nenhum lead válido' };
    }
    setLoading(true);
    try {
      await window.fb.bulkAddLeads(unique);
      await loadAll();
      return { added: unique.length, skipped: skippedLocal };
    } catch (e) {
      return { added: 0, error: e.message };
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     MODAL WHATSAPP
     ========================================================= */
  function preferredTemplateFor(status) {
    // 1) Tenta pelo campo forStatus do template
    var tpl = templates.find(t => t.forStatus === status);
    if (tpl) return tpl;
    // 2) Fallback por key
    var keyMap = {
      novo: 'abordagem', abordagem: 'follow1', follow1: 'follow2', follow2: 'follow2',
      backlog: 'follow1', interessado: 'exemplos', proposta: 'proposta',
      negociacao: 'objecao', convertido: 'abordagem', descartado: 'encerramento'
    };
    var k = keyMap[status];
    return k ? templates.find(t => t.key === k) : null;
  }

  function openWaModal(leadId) {
    var lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.phone) { toast('Sem telefone', 'error'); return; }
    waContext = { leadId: leadId, templateKey: null, counted: false };
    document.getElementById('waLeadName').textContent = lead.name + ' · ' + lead.phone;

    var sel = document.getElementById('waTemplateSelect');
    sel.innerHTML = templates.map(t =>
      '<option value="' + t.id + '">' + escapeHtml(t.name) + '</option>'
    ).join('');

    var preferred = preferredTemplateFor(lead.status || 'novo');
    if (preferred) sel.value = preferred.id;

    function refresh() {
      var tpl = templates.find(t => t.id === sel.value);
      document.getElementById('waMessagePreview').value = tpl ? applyTemplate(tpl.body, lead) : '';
      waContext.templateKey = tpl ? tpl.key : null;
    }
    sel.onchange = refresh;
    refresh();
    document.getElementById('waModal').classList.remove('hidden');
  }

  function closeWaModal() {
    document.getElementById('waModal').classList.add('hidden');
    waContext = { leadId: null, templateKey: null, counted: false };
  }

  async function markMessageSent() {
    var lead = leads.find(l => l.id === waContext.leadId);
    if (!lead) return;

    if (!waContext.counted) {
      try {
        await window.fb.incrementDailyCounter();
        waContext.counted = true;
        await updateWppCounter();
      } catch (e) { console.warn('Counter:', e); }
    }

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
    }

    await updateLeadRemote(lead);
    closeWaModal();
    renderTable();
    renderDashboard();
  }

  /* =========================================================
     TEMPLATES — render
     ========================================================= */
  function renderTemplates() {
    document.getElementById('templatesList').innerHTML = templates.map(t =>
      '<div class="template-card"><div class="template-card-header"><h4>' + escapeHtml(t.name) +
      '</h4><span class="template-key">' + escapeHtml(t.key) + '</span></div>' +
      '<div class="template-body">' + escapeHtml(t.body) + '</div>' +
      '<div class="template-actions">' +
      '<button class="btn btn-sm btn-outline" data-action="edit-tpl" data-id="' + t.id + '">Editar</button> ' +
      '<button class="btn btn-sm btn-danger-outline" data-action="del-tpl" data-id="' + t.id + '">Excluir</button>' +
      '</div></div>'
    ).join('');
  }

  /* =========================================================
     STATUSES — render + CRUD
     ========================================================= */
  function renderStatuses() {
    var list = sortedStatuses();
    var el = document.getElementById('statusesList');
    if (!list.length) {
      el.innerHTML = '<p class="empty-mini">Nenhum status cadastrado.</p>';
      return;
    }
    el.innerHTML = list.map(s =>
      '<div class="template-card">' +
      '<div class="template-card-header">' +
      '<h4>' + escapeHtml(s.label) + '</h4>' +
      '<span class="template-key">' + escapeHtml(s.key) + '</span>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--text-muted)">Ordem: ' + (s.order || 0) +
      (s.isFinal ? ' · <strong>status final</strong>' : '') + '</p>' +
      '<div class="template-actions">' +
      '<button class="btn btn-sm btn-outline" data-action="edit-st" data-id="' + s.id + '">Editar</button> ' +
      '<button class="btn btn-sm btn-danger-outline" data-action="del-st" data-id="' + s.id + '">Excluir</button>' +
      '</div></div>'
    ).join('');
  }

  function openStatusModal(id) {
    var s = id ? statuses.find(x => x.id === id) : null;
    document.getElementById('statusModalTitle').textContent = s ? 'Editar status' : 'Novo status';
    document.getElementById('stId').value = s ? s.id : '';
    document.getElementById('stLabel').value = s ? (s.label || '') : '';
    document.getElementById('stKey').value = s ? (s.key || '') : '';
    document.getElementById('stOrder').value = s ? (s.order || 10) : 10;
    document.getElementById('stIsFinal').checked = !!(s && s.isFinal);
    document.getElementById('statusModal').classList.remove('hidden');
  }

  function closeStatusModal() {
    document.getElementById('statusModal').classList.add('hidden');
  }

  /* =========================================================
     EXPORTAÇÃO
     ========================================================= */
  function toCSV(list) {
    var headers = ['id', 'name', 'category', 'address', 'phone', 'hasWhatsApp', 'email', 'website', 'rating', 'reviews', 'status', 'temperature', 'notes', 'timestamp', 'lastContactAt'];
    var labels = ['ID', 'Nome', 'Nicho', 'Endereço', 'Telefone', 'WhatsApp', 'Email', 'Website', 'Nota', 'Avaliações', 'Status', 'Temperatura', 'Obs', 'Captura', 'Último Contato'];
    var rows = list.map(l => headers.map(h => {
      var v = h === 'hasWhatsApp' ? (l.hasWhatsApp ? 'sim' : 'não') : (l[h] == null ? '' : l[h]);
      v = String(v).replace(/"/g, '""');
      if (v.indexOf(';') !== -1 || v.indexOf('"') !== -1) v = '"' + v + '"';
      return v;
    }).join(';'));
    return '\uFEFF' + labels.join(';') + '\n' + rows.join('\n');
  }

  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* =========================================================
     EDIT LEAD
     ========================================================= */
  function openEdit(id) {
    var lead = leads.find(l => l.id === id);
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

  /* =========================================================
     EVENTOS
     ========================================================= */
  function bindEvents() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => showView(btn.dataset.view));
    });
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => showView(btn.dataset.goto));
    });

    document.getElementById('btnLogout').addEventListener('click', logout);

    document.querySelectorAll('th.sortable').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        var key = th.dataset.sort;
        if (sortState.key === key) sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        else { sortState.key = key; sortState.dir = 'asc'; }
        pageState.page = 1;
        renderTable();
      });
    });

    ['searchInput', 'statusFilter', 'nicheFilter', 'tempFilter', 'whatsappFilter'].forEach(id => {
      var el = document.getElementById(id);
      if (!el) return;
      var on = () => { pageState.page = 1; renderTable(); };
      el.addEventListener('input', on);
      el.addEventListener('change', on);
    });

    document.getElementById('selectAll').addEventListener('change', function (e) {
      var visible = getFilteredLeads();
      if (e.target.checked) visible.forEach(l => selectedIds.add(l.id));
      else visible.forEach(l => selectedIds.delete(l.id));
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
        if (settings.confirmDelete && !confirm('Excluir lead?')) return;
        deleteLeadsRemote([id]).then(() => { renderTable(); renderDashboard(); });
      }
      if (btn.dataset.action === 'whatsapp') openWaModal(id);
      if (btn.dataset.action === 'snooze') snoozeLead(id, 3);
    });

    document.getElementById('btnBulkDelete').addEventListener('click', () => {
      if (!selectedIds.size) return;
      if (settings.confirmDelete && !confirm('Excluir ' + selectedIds.size + ' lead(s)?')) return;
      deleteLeadsRemote(Array.from(selectedIds)).then(() => { renderTable(); renderDashboard(); });
    });

    document.getElementById('btnBulkStatus').addEventListener('click', async () => {
      if (!selectedIds.size) return;
      var keys = sortedStatuses().map(s => s.key).join(', ');
      var status = prompt('Novo status (' + keys + '):', sortedStatuses()[0]?.key || 'novo');
      if (!status) return;
      var s = status.toLowerCase().trim();
      if (!statuses.find(x => x.key === s)) { toast('Status inválido', 'error'); return; }
      setLoading(true);
      try {
        for (var i = 0; i < leads.length; i++) {
          if (selectedIds.has(leads[i].id)) {
            leads[i].status = s;
            await window.fb.updateLead(leads[i].id, { status: s });
          }
        }
        toast('Status atualizado');
        renderTable();
        renderDashboard();
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        setLoading(false);
      }
    });

    document.getElementById('btnRefreshData').addEventListener('click', loadAll);
    document.getElementById('btnRefreshLeads').addEventListener('click', loadAll);
    var btnR2 = document.getElementById('btnRefreshData2');
    if (btnR2) btnR2.addEventListener('click', loadAll);

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

    // Import: drop zone + file + paste
    var dropZone = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        var reader = new FileReader();
        reader.onload = async () => {
          var result = await importData(reader.result);
          var el = document.getElementById('importResult');
          el.classList.remove('hidden', 'success', 'error');
          if (result.error) { el.classList.add('error'); el.textContent = result.error; }
          else { el.classList.add('success'); el.textContent = 'Importados ' + result.added; toast('+' + result.added); }
        };
        reader.readAsText(e.dataTransfer.files[0], 'UTF-8');
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = async () => {
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
    document.getElementById('btnImportPaste').addEventListener('click', async () => {
      var result = await importData(document.getElementById('pasteJson').value);
      var el = document.getElementById('importResult');
      el.classList.remove('hidden', 'success', 'error');
      if (result.error) { el.classList.add('error'); el.textContent = result.error; }
      else {
        el.classList.add('success');
        el.textContent = 'Importados ' + result.added;
        document.getElementById('pasteJson').value = '';
      }
    });

    // Export
    document.getElementById('btnExportCsv').addEventListener('click', () => {
      if (!leads.length) { toast('Nenhum lead', 'error'); return; }
      download('leads_' + Date.now() + '.csv', toCSV(leads), 'text/csv;charset=utf-8');
    });
    document.getElementById('btnExportJson').addEventListener('click', () => {
      if (!leads.length) { toast('Nenhum lead', 'error'); return; }
      download('leads_' + Date.now() + '.json', JSON.stringify(leads, null, 2), 'application/json');
    });

    // Configurações
    document.getElementById('btnSaveSettings').addEventListener('click', async () => {
      settings.followUpDays = parseInt(document.getElementById('followUpDays').value, 10) || 3;
      settings.backlogMonths = parseInt(document.getElementById('backlogMonths').value, 10) || 180;
      settings.defaultCountry = document.getElementById('defaultCountry').value.trim() || '55';
      settings.defaultHasWhatsApp = document.getElementById('defaultHasWhatsApp').checked;
      settings.confirmDelete = document.getElementById('confirmDelete').checked;
      settings.dailySafeLimit = parseInt(document.getElementById('dailySafeLimit').value, 10) || 20;
      settings.dailyWarnLimit = parseInt(document.getElementById('dailyWarnLimit').value, 10) || 30;

      await saveSettings();          // ⬅️ agora é async
      toast('Configurações salvas');
      renderDashboard();
      updateWppCounter();            // reflete os novos limites no badge
    });

    // Modal edição
    document.getElementById('modalClose').addEventListener('click', () => {
      document.getElementById('editModal').classList.add('hidden');
    });
    document.getElementById('modalCancel').addEventListener('click', () => {
      document.getElementById('editModal').classList.add('hidden');
    });
    document.getElementById('editForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var id = document.getElementById('editId').value;
      var existing = leads.find(l => l.id === id) || {};
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

    // WhatsApp modal
    document.getElementById('waModalClose').addEventListener('click', closeWaModal);
    document.getElementById('waModalCancel').addEventListener('click', closeWaModal);
    document.getElementById('btnOpenWhatsApp').addEventListener('click', async () => {
      var lead = leads.find(l => l.id === waContext.leadId);
      if (!lead) return;
      var url = waMeUrl(lead.phone, document.getElementById('waMessagePreview').value);
      if (!url) return;

      if (!waContext.counted) {
        try {
          await window.fb.incrementDailyCounter();
          waContext.counted = true;
          await updateWppCounter();
        } catch (e) { console.warn('Counter:', e); }
      }

      window.open(url, '_blank', 'noopener');
    });
    document.getElementById('btnMarkSent').addEventListener('click', markMessageSent);

    // Templates
    document.getElementById('btnNewTemplate').addEventListener('click', () => {
      document.getElementById('templateId').value = '';
      document.getElementById('tName').value = '';
      document.getElementById('tKey').value = 'custom';
      document.getElementById('tBody').value = '';
      document.getElementById('templateModal').classList.remove('hidden');
    });
    document.getElementById('templatesList').addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'edit-tpl') {
        var t = templates.find(x => x.id === btn.dataset.id);
        if (!t) return;
        document.getElementById('templateId').value = t.id;
        document.getElementById('tName').value = t.name;
        document.getElementById('tKey').value = t.key;
        document.getElementById('tBody').value = t.body;
        document.getElementById('templateModal').classList.remove('hidden');
      }
      if (btn.dataset.action === 'del-tpl') {
        if (!confirm('Excluir template?')) return;
        try {
          await window.fb.deleteTemplate(btn.dataset.id);
          templates = templates.filter(t => t.id !== btn.dataset.id);
          renderTemplates();
          toast('Template excluído');
        } catch (err) { toast(err.message, 'error'); }
      }
    });
    document.getElementById('templateModalClose').addEventListener('click', () => {
      document.getElementById('templateModal').classList.add('hidden');
    });
    document.getElementById('templateModalCancel').addEventListener('click', () => {
      document.getElementById('templateModal').classList.add('hidden');
    });
    document.getElementById('templateForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var id = document.getElementById('templateId').value;
      var data = {
        name: document.getElementById('tName').value.trim(),
        key: document.getElementById('tKey').value,
        body: document.getElementById('tBody').value
      };
      try {
        if (id) {
          await window.fb.updateTemplate(id, data);
          var t = templates.find(x => x.id === id);
          if (t) Object.assign(t, data);
        } else {
          var created = await window.fb.addTemplate(data);
          templates.push(created);
        }
        document.getElementById('templateModal').classList.add('hidden');
        renderTemplates();
        toast('Template salvo');
      } catch (err) { toast(err.message, 'error'); }
    });

    // Statuses
    document.getElementById('btnNewStatus').addEventListener('click', () => openStatusModal());
    document.getElementById('statusModalClose').addEventListener('click', closeStatusModal);
    document.getElementById('statusModalCancel').addEventListener('click', closeStatusModal);
    document.getElementById('statusesList').addEventListener('click', async function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'edit-st') openStatusModal(btn.dataset.id);
      if (btn.dataset.action === 'del-st') {
        if (!confirm('Excluir este status? Leads com esse status continuarão existindo.')) return;
        try {
          await window.fb.deleteStatus(btn.dataset.id);
          statuses = statuses.filter(s => s.id !== btn.dataset.id);
          populateStatusSelects();
          renderStatuses();
          renderDashboard();
          toast('Status excluído');
        } catch (err) { toast(err.message, 'error'); }
      }
    });
    document.getElementById('statusForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var id = document.getElementById('stId').value;
      var label = document.getElementById('stLabel').value.trim();
      var key = document.getElementById('stKey').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      var order = parseInt(document.getElementById('stOrder').value, 10) || 10;
      var isFinal = document.getElementById('stIsFinal').checked;
      if (!label || !key) { toast('Preencha nome e chave', 'error'); return; }

      // Chave única
      if (statuses.some(s => s.key === key && s.id !== id)) {
        toast('Já existe um status com essa chave', 'error');
        return;
      }

      try {
        if (id) {
          await window.fb.updateStatus(id, { label, key, order, isFinal });
          var s = statuses.find(x => x.id === id);
          if (s) Object.assign(s, { label, key, order, isFinal });
        } else {
          var created = await window.fb.addStatus({ label, key, order, isFinal });
          statuses.push(created);
        }
        closeStatusModal();
        populateStatusSelects();
        renderStatuses();
        renderDashboard();
        toast('Status salvo');
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    loadSettingsFromCache();;
    loadSession();
    bindEvents();
    applySettingsToForm();

    // Espera o módulo do Firebase carregar
    var tries = 0;
    var waitFb = setInterval(() => {
      tries++;
      if (window.fb) {
        clearInterval(waitFb);
        setupFirebaseAuth();
      } else if (tries > 100) {
        clearInterval(waitFb);
        showLoginError('Firebase não carregou. Verifique a conexão.');
      }
    }, 50);
  }

  function setupFirebaseAuth() {
    // Observa login/logout
    window.fb.onAuthStateChanged(async (user) => {
      if (user) {
        saveSession({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          picture: user.photoURL || ''
        });
        try {
          await window.fb.ensureSeed(DEFAULT_TEMPLATES);
        } catch (e) { console.warn('Seed:', e); }
        enterApp();
      } else {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appRoot').classList.add('hidden');
      }
    });

    // Botão de login
    var btn = document.getElementById('btnGoogleLogin');
    if (btn) btn.addEventListener('click', doLogin);
  }

  document.addEventListener('DOMContentLoaded', init);
})();