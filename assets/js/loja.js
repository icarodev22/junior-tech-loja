/* =========================================================
   Júnior Tech · loja
   Catálogo, categorias, busca, filtros, sacola e WhatsApp.
   Os produtos e preços ficam em assets/js/produtos.js.
   ========================================================= */
(function () {
  'use strict';

  var WA_NUMBER = '5581981387537';
  var IMG = 'assets/img/produtos/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- Dados ---------- */
  var DATA = window.JT_CATALOGO || { categorias: {}, produtos: [] };
  var CATS = DATA.categorias;
  var MAIN = Object.keys(CATS).filter(function (k) { return CATS[k].principal; });
  var ALL_CATS = Object.keys(CATS);

  function validPrice(v) { return typeof v === 'number' && isFinite(v) && v > 0; }

  var PRODUCTS = DATA.produtos.filter(function (p) { return p && p.id && CATS[p.categoria]; }).map(function (p, i) {
    var price = validPrice(p.preco) ? p.preco : null;
    // promoção só vale com preço anterior real e maior que o atual
    var old = price !== null && validPrice(p.precoAnterior) && p.precoAnterior > price ? p.precoAnterior : null;
    return {
      id: p.id, cat: p.categoria, name: p.nome, img: p.imagem || null, icon: p.icone || 'caixa',
      price: price, old: old, off: old ? Math.round((1 - price / old) * 100) : 0,
      available: p.disponivel === true ? true : p.disponivel === false ? false : null,
      featured: !!p.destaque, order: i
    };
  });
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  /* ---------- Utilidades ---------- */
  var ICONS = {
    pelicula: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M7 7l10 10M10 2l7 7"/>',
    bateria: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 3V1.8h4V3M12.5 8.5 10.5 12h3l-2 3.5"/>',
    suporte: '<rect x="8" y="3" width="8" height="14" rx="1.5"/><path d="M5 9v4a7 7 0 0 0 14 0V9M12 20v2"/>',
    relogio: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2l1.5 1"/>',
    caixa: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16"/>',
    bag: '<path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    wa: '<path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-3.7A8.5 8.5 0 1 1 20 11.5z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
  };
  function icon(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || ICONS.caixa) + '</svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function waUrl(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); }
  function money(v) { return BRL.format(v); }
  function $(id) { return document.getElementById(id); }
  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }

  /* ---------- Links fixos de WhatsApp ---------- */
  document.querySelectorAll('.wa-link').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-msg') || 'Olá! Vim pelo site da Júnior Tech.');
  });

  /* ---------- Toast ---------- */
  var toastEl = $('toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* =========================================================
     PAINÉIS (sacola e menu)
     ========================================================= */
  var overlay = $('overlay'), openPanel = null, lastFocus = null;
  function showPanel(panel, trigger, focusEl) {
    if (openPanel) hidePanel(true);
    lastFocus = trigger || document.activeElement;
    openPanel = panel;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('show'); });
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('lock');
    toastEl.classList.remove('show');
    header.classList.remove('is-hidden');
    setTimeout(function () { (focusEl || panel).focus(); }, 30);
  }
  function hidePanel(silent) {
    if (!openPanel) return;
    var panel = openPanel;
    openPanel = null;
    overlay.classList.remove('show');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('[aria-controls="' + panel.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.body.classList.remove('lock');
    setTimeout(function () { if (!openPanel) overlay.hidden = true; }, 300);
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  overlay.addEventListener('click', function () { hidePanel(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openPanel) hidePanel(); });

  var header = $('header');
  var menu = $('menu'), menuBtn = $('menuBtn');
  menuBtn.addEventListener('click', function () { showPanel(menu, menuBtn, $('menuClose')); });
  $('menuClose').addEventListener('click', function () { hidePanel(); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) hidePanel(true); });

  /* =========================================================
     SACOLA
     Os preços vêm sempre do catálogo (produtos.js); no navegador
     ficam salvos só o código do produto e a quantidade.
     ========================================================= */
  var CART_KEY = 'juniortech-sacola', NOTES_KEY = 'juniortech-observacoes', MAX_QTY = 99;
  var cartEl = $('cart'), cartBtn = $('cartBtn'), notesEl = $('cartNotes');

  var Sacola = (function () {
    var itens = {}; // { idDoProduto: quantidade }

    function valida(dados) {
      // aceita o formato atual {v:1, itens:[{id, qtd}]} e o antigo {id: qtd}
      var lista = [];
      if (dados && Array.isArray(dados.itens)) lista = dados.itens;
      else if (dados && typeof dados === 'object') lista = Object.keys(dados).map(function (id) { return { id: id, qtd: dados[id] }; });
      var limpo = {};
      lista.forEach(function (it) {
        if (!it || typeof it.id !== 'string') return;
        var p = byId[it.id], q = Math.floor(Number(it.qtd));
        if (!p || p.available === false || !isFinite(q) || q < 1) return;
        limpo[it.id] = Math.min(MAX_QTY, (limpo[it.id] || 0) + q);
      });
      return limpo;
    }
    function salvar() {
      store(CART_KEY, JSON.stringify({ v: 1, itens: Object.keys(itens).map(function (id) { return { id: id, qtd: itens[id] }; }) }));
    }
    function carregar() {
      var bruto = store(CART_KEY);
      if (!bruto) return;
      try { itens = valida(JSON.parse(bruto)); } catch (e) { itens = {}; }
      salvar(); // regrava já validado
    }

    return {
      carregar: carregar,
      ids: function () { return Object.keys(itens); },
      qtd: function (id) { return itens[id] || 0; },
      adicionar: function (id) {
        var p = byId[id];
        if (!p || p.available === false) return false;
        itens[id] = Math.min(MAX_QTY, (itens[id] || 0) + 1);
        salvar(); return true;
      },
      alterar: function (id, delta) {
        if (!itens[id]) return 0;
        itens[id] = Math.min(MAX_QTY, itens[id] + delta);
        if (itens[id] <= 0) delete itens[id];
        salvar(); return itens[id] || 0;
      },
      remover: function (id) { delete itens[id]; salvar(); },
      limpar: function () { itens = {}; salvar(); },
      contagem: function () { return Object.keys(itens).reduce(function (n, id) { return n + itens[id]; }, 0); },
      vazia: function () { return Object.keys(itens).length === 0; },
      // preços só como número; produto sem preço fica null e não entra em conta
      subtotal: function (id) { var p = byId[id]; return p.price === null ? null : Math.round(p.price * itens[id] * 100) / 100; },
      todosComPreco: function () { return Object.keys(itens).every(function (id) { return byId[id].price !== null; }); },
      total: function () {
        if (!this.todosComPreco()) return null;
        return Math.round(Object.keys(itens).reduce(function (t, id) { return t + byId[id].price * itens[id]; }, 0) * 100) / 100;
      }
    };
  })();
  Sacola.carregar();

  // observações podem conter dados pessoais: ficam só nesta aba (sessionStorage), nunca no localStorage
  try { localStorage.removeItem(NOTES_KEY); } catch (e) {}
  function notesStore(v) { try { if (v === undefined) return sessionStorage.getItem(NOTES_KEY) || ''; sessionStorage.setItem(NOTES_KEY, v); } catch (e) { return ''; } }
  notesEl.value = notesStore();

  var A_CONFIRMAR = 'a confirmar com a loja';

  function buildMessage() {
    var L = ['Olá! Vim pelo site da Júnior Tech e gostaria de fazer um pedido.', '', '*MEU PEDIDO*', ''];
    Sacola.ids().forEach(function (id) {
      var p = byId[id], sub = Sacola.subtotal(id);
      L.push('- Produto: ' + p.name);
      L.push('- Quantidade: ' + Sacola.qtd(id));
      L.push('- Preço unitário: ' + (p.price !== null ? money(p.price) : A_CONFIRMAR));
      L.push('- Subtotal: ' + (sub !== null ? money(sub) : A_CONFIRMAR));
      L.push('');
    });
    var total = Sacola.total();
    if (total !== null) L.push('*Total do pedido:* ' + money(total));
    else L.push('*Total do pedido:* ' + A_CONFIRMAR + ' (há produto sem preço no site)');
    L.push('');
    L.push('*Observações:*');
    var notes = notesEl.value.trim();
    if (notes) L.push(notes);
    return L.join('\n');
  }

  function updateBadge() {
    var count = Sacola.contagem(), badge = $('cartCount');
    badge.textContent = count;
    badge.classList.toggle('zero', count === 0);
    $('cartCountLabel').textContent = count ? count + (count === 1 ? ' item' : ' itens') : 'vazia';
    $('cartHeadCount').textContent = count ? '(' + count + ')' : '';
  }
  function bumpBadge() { var b = $('cartCount'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }

  function renderCart() {
    updateBadge();
    var send = $('cartSend');
    if (Sacola.vazia()) {
      $('cartBody').innerHTML = '<div class="cart-empty">' + icon('bag') + '<b>Sua sacola está vazia</b>Adicione produtos para montar o pedido.' +
        '<br><a class="btn btn-outline" href="#catalogo" data-close-cart>Ver acessórios</a></div>';
      $('cartFoot').hidden = true;
      send.setAttribute('aria-disabled', 'true');
      send.removeAttribute('href');
      return;
    }
    $('cartFoot').hidden = false;
    $('cartBody').innerHTML = Sacola.ids().map(function (id) {
      var p = byId[id], q = Sacola.qtd(id), sub = Sacola.subtotal(id);
      var thumb = p.img ? '<img src="' + IMG + p.img + '.webp" alt="" width="68" height="68">' : '<span class="thumb">' + icon(p.icon) + '</span>';
      var unit = p.price !== null ? money(p.price) + ' <span>un.</span>' : '<span class="ask">Consulte o preço</span>';
      var subtotal = sub !== null ? money(sub) : '<span class="ask">a confirmar</span>';
      return '<div class="cart-item" data-item="' + id + '">' + thumb +
        '<div class="cart-item-main"><h3>' + esc(p.name) + '</h3>' +
        '<p class="cart-unit">' + unit + '</p>' +
        '<div class="cart-item-row">' +
        '<div class="qty"><button type="button" data-qty="-1" data-id="' + id + '" aria-label="Diminuir quantidade de ' + esc(p.name) + '">−</button>' +
        '<span aria-label="Quantidade">' + q + '</span>' +
        '<button type="button" data-qty="1" data-id="' + id + '" aria-label="Aumentar quantidade de ' + esc(p.name) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></div>' +
        '<p class="cart-sub"><small>Subtotal</small>' + subtotal + '</p>' +
        '</div></div>' +
        '<button type="button" class="cart-remove" data-remove="' + id + '" aria-label="Remover ' + esc(p.name) + '">' + icon('trash') + '</button>' +
        '</div>';
    }).join('');

    var total = Sacola.total();
    $('cartSummary').innerHTML = total !== null
      ? '<div class="cart-total"><span>Total do pedido</span><b>' + money(total) + '</b></div>'
      : '<div class="cart-total pending"><span>Total do pedido</span><b>A confirmar</b></div>' +
        '<p class="cart-note">Há produto sem preço no site. A loja confirma o valor total pelo WhatsApp antes de fechar o pedido.</p>';
    send.removeAttribute('aria-disabled');
    send.href = waUrl(buildMessage());
  }

  function flashItem(id) {
    var row = $('cartBody').querySelector('[data-item="' + id + '"] .qty span');
    if (row) { row.classList.remove('pulse'); void row.offsetWidth; row.classList.add('pulse'); }
  }

  function addToCart(id, btn) {
    if (!Sacola.adicionar(id)) return;
    var p = byId[id];
    renderCart(); bumpBadge();
    var q = Sacola.qtd(id);
    toast(q > 1 ? p.name + ': agora são ' + q + ' na sacola' : p.name + ' foi para a sacola');
    if (btn) {
      btn.classList.add('added');
      btn.innerHTML = icon('check') + '<span>Adicionado</span>';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.classList.remove('added'); btn.innerHTML = addLabel(); }, 1400);
    }
  }

  cartBtn.addEventListener('click', function () { renderCart(); showPanel(cartEl, cartBtn, $('cartClose')); });
  $('cartClose').addEventListener('click', function () { hidePanel(); });
  $('cartBody').addEventListener('click', function (e) {
    if (e.target.closest('[data-close-cart]')) { hidePanel(true); return; }
    var q = e.target.closest('[data-qty]'), r = e.target.closest('[data-remove]');
    if (q) {
      var id = q.getAttribute('data-id'), name = byId[id].name;
      var left = Sacola.alterar(id, parseInt(q.getAttribute('data-qty'), 10));
      renderCart(); bumpBadge();
      if (left) flashItem(id); else toast(name + ' saiu da sacola');
    } else if (r) {
      var rid = r.getAttribute('data-remove');
      Sacola.remover(rid); renderCart(); bumpBadge();
      toast(byId[rid].name + ' saiu da sacola');
    } else return;
    if (Sacola.vazia()) $('cartClose').focus();
  });
  $('cartClear').addEventListener('click', function () {
    Sacola.limpar(); renderCart(); toast('Sacola esvaziada'); $('cartClose').focus();
  });
  $('cartSend').addEventListener('click', function (e) {
    if (Sacola.vazia()) { e.preventDefault(); toast('Adicione produtos à sacola para finalizar o pedido.'); return; }
    this.href = waUrl(buildMessage()); // garante a mensagem com as observações mais recentes
  });
  notesEl.addEventListener('input', function () {
    notesStore(notesEl.value);
    if (!Sacola.vazia()) $('cartSend').href = waUrl(buildMessage());
  });
  // outra aba alterou a sacola: sincroniza
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) { Sacola.carregar(); renderCart(); } });

  /* =========================================================
     CARTÃO DE PRODUTO
     ========================================================= */
  function addLabel() { return icon('bag') + '<span class="long">Adicionar à sacola</span><span class="short">Adicionar</span>'; }

  function cardHTML(p) {
    var media = p.img
      ? '<div class="card-media"><img src="' + IMG + p.img + '.webp" alt="' + esc(p.name) + '" loading="lazy" width="640" height="640"><span class="card-tag">Foto ilustrativa</span>'
      : '<div class="card-media no-photo">' + icon(p.icon) + '<span class="card-tag">Foto em breve</span>';
    if (p.old) media += '<span class="card-badge">-' + p.off + '%</span>';
    media += '</div>';

    var ask = waUrl('Olá! Vi no site o produto "' + p.name + '". Qual o preço e tem disponível?');
    var price;
    if (p.old) price = '<span class="price-now">' + money(p.price) + '</span><span class="price-old"><span class="sr-only">Antes: </span>' + money(p.old) + '</span>';
    else if (p.price !== null) price = '<span class="price-now">' + money(p.price) + '</span>';
    else price = '<a class="price-ask" href="' + ask + '" target="_blank" rel="noopener">Consulte o preço</a>';

    var stock = p.available === true ? '<span class="card-stock">Disponível</span>'
      : p.available === false ? '<span class="card-stock off">Indisponível</span>' : '';

    var add = p.available === false
      ? '<button type="button" class="btn-add" disabled>Indisponível</button>'
      : '<button type="button" class="btn-add" data-add="' + p.id + '">' + addLabel() + '</button>';

    return '<article class="card">' + media +
      '<div class="card-body">' +
      '<span class="card-cat">' + esc(CATS[p.cat].nome) + '</span>' +
      '<h4>' + esc(p.name) + '</h4>' +
      '<div class="card-price">' + price + '</div>' + stock +
      '<div class="card-actions">' + add +
      '<a class="btn-ask" href="' + ask + '" target="_blank" rel="noopener" aria-label="Perguntar sobre ' + esc(p.name) + ' no WhatsApp">' + icon('wa') + '</a>' +
      '</div></div></article>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b) addToCart(b.getAttribute('data-add'), b);
  });

  /* =========================================================
     OFERTAS / DESTAQUES
     Ofertas só aparecem com promoção real cadastrada.
     ========================================================= */
  (function renderFeatured() {
    var promos = PRODUCTS.filter(function (p) { return p.old; });
    var list, title, desc;
    if (promos.length) {
      list = promos.slice(0, 8); title = 'Ofertas'; desc = 'Promoções cadastradas pela loja.';
    } else {
      list = PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 4); title = 'Em destaque'; desc = '';
    }
    if (!list.length) return;
    $('featuredTitle').textContent = title;
    $('featuredDesc').textContent = desc;
    $('featuredGrid').innerHTML = list.map(cardHTML).join('');
    $('destaques').hidden = false;
    $('destaques').removeAttribute('data-hidden-empty');
  })();
  var hasFeatured = !$('destaques').hidden;

  /* =========================================================
     CATÁLOGO, FILTROS E BUSCA
     ========================================================= */
  var state = { cat: 'acessorios', q: '', sort: 'relevancia', min: null, max: null, searchCat: 'tudo' };
  var sortSel = $('sortSelect'), minEl = $('priceMin'), maxEl = $('priceMax');

  function catsOf(view) { return view === 'acessorios' ? MAIN : [view]; }

  function matchesQuery(p, q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var hay = norm(p.name); // busca pelo nome do produto
    return terms.every(function (t) { return hay.indexOf(t) > -1; });
  }

  function baseList() {
    if (state.q) {
      return PRODUCTS.filter(function (p) {
        return matchesQuery(p, state.q) && (state.searchCat === 'tudo' || p.cat === state.searchCat);
      });
    }
    var cs = catsOf(state.cat);
    return PRODUCTS.filter(function (p) { return cs.indexOf(p.cat) > -1; });
  }

  function applyPrice(list) {
    if (state.min === null && state.max === null) return list;
    return list.filter(function (p) {
      if (p.price === null) return false;
      if (state.min !== null && p.price < state.min) return false;
      if (state.max !== null && p.price > state.max) return false;
      return true;
    });
  }

  function sortList(list) {
    list = list.slice();
    var byOrder = function (a, b) { return a.order - b.order; };
    if (state.sort === 'az') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'pt-BR'); });
    else if (state.sort === 'za') list.sort(function (a, b) { return b.name.localeCompare(a.name, 'pt-BR'); });
    else if (state.sort === 'menor' || state.sort === 'maior') {
      var dir = state.sort === 'menor' ? 1 : -1;
      list.sort(function (a, b) {
        if (a.price === null && b.price === null) return byOrder(a, b);
        if (a.price === null) return 1;   // sem preço sempre no fim
        if (b.price === null) return -1;
        return (a.price - b.price) * dir || byOrder(a, b);
      });
    } else list.sort(byOrder);
    return list;
  }

  function renderChips() {
    var chips;
    if (state.q) {
      var found = PRODUCTS.filter(function (p) { return matchesQuery(p, state.q); });
      var cats = ALL_CATS.filter(function (c) { return found.some(function (p) { return p.cat === c; }); });
      if (cats.indexOf(state.searchCat) < 0) state.searchCat = 'tudo';
      chips = [{ v: 'tudo', label: 'Todos os resultados (' + found.length + ')', on: state.searchCat === 'tudo' }].concat(cats.map(function (c) {
        return { v: c, label: CATS[c].curto, on: state.searchCat === c };
      }));
    } else {
      chips = [{ v: 'acessorios', label: 'Todos os acessórios', on: state.cat === 'acessorios' }].concat(ALL_CATS.map(function (c) {
        return { v: c, label: CATS[c].curto, on: state.cat === c };
      }));
    }
    $('chips').innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-chip="' + c.v + '" aria-pressed="' + c.on + '">' + esc(c.label) + '</button>';
    }).join('');
  }

  var chipScroll = false;
  $('chips').addEventListener('click', function (e) {
    var c = e.target.closest('[data-chip]');
    if (!c) return;
    var v = c.getAttribute('data-chip');
    if (state.q) { state.searchCat = v; renderCatalog(); return; }
    chipScroll = true; // filtro dentro do catálogo: não volta ao topo
    location.hash = v === 'acessorios' ? '#/' : '#/' + v;
  });

  function updatePriceControls(base) {
    var priced = base.filter(function (p) { return p.price !== null; }).length;
    var enough = priced >= 2;
    $('priceFilter').hidden = !enough;
    if (!enough && (state.min !== null || state.max !== null)) { state.min = state.max = null; minEl.value = maxEl.value = ''; }
    sortSel.querySelectorAll('[data-price]').forEach(function (o) { o.hidden = !enough; o.disabled = !enough; });
    if (!enough && (state.sort === 'menor' || state.sort === 'maior')) { state.sort = 'relevancia'; sortSel.value = 'relevancia'; }
    return priced;
  }

  function renderCatalog() {
    var title = $('catalogTitle'), desc = $('catalogDesc');
    renderChips();
    var base = baseList();
    updatePriceControls(base);
    var list = sortList(applyPrice(base));
    var priceOn = state.min !== null || state.max !== null;

    if (state.q) {
      title.textContent = 'Resultados para “' + state.q + '”';
      desc.textContent = '';
    } else if (state.cat === 'acessorios') {
      title.textContent = 'Acessórios para celular';
      desc.textContent = 'Adicione à sacola e finalize o pedido pelo WhatsApp.';
    } else {
      title.textContent = CATS[state.cat].nome;
      desc.textContent = '';
    }

    var n = list.length;
    $('resultCount').textContent = (n === 1 ? '1 produto' : n + ' produtos') +
      (priceOn ? ' na faixa de preço escolhida. Produtos sem preço cadastrado não entram neste filtro.' : '');

    var html;
    if (!n) {
      var q = state.q || '';
      html = '<div class="empty"><h3>' + (q ? 'Nada encontrado para “' + esc(q) + '”' : 'Nenhum produto nesta faixa de preço') + '</h3>' +
        '<p>' + (q ? 'Confira a escrita ou tente outra palavra. Nem tudo que tem na loja está no site: pergunte pelo WhatsApp.' : 'Ajuste os valores do filtro ou limpe a faixa de preço.') + '</p>' +
        '<div class="empty-actions">' +
        (q ? '<button type="button" class="btn btn-outline" data-clear-search>Limpar busca</button>' : '<button type="button" class="btn btn-outline" data-clear-price>Limpar faixa de preço</button>') +
        '<a class="btn btn-dark" target="_blank" rel="noopener" href="' + waUrl(q ? 'Olá! Procurei "' + q + '" no site da Júnior Tech. Vocês têm?' : 'Olá! Vim pelo site da Júnior Tech.') + '">Perguntar no WhatsApp</a>' +
        '</div></div>';
    } else if (!state.q && state.cat === 'acessorios' && state.sort === 'relevancia' && !priceOn) {
      html = MAIN.map(function (c) {
        var items = list.filter(function (p) { return p.cat === c; });
        if (!items.length) return '';
        return '<div class="group"><div class="group-head"><h3>' + esc(CATS[c].nome) + '</h3>' +
          '<a href="#/' + c + '">Ver todos</a></div>' +
          '<div class="grid">' + items.map(cardHTML).join('') + '</div></div>';
      }).join('');
    } else {
      html = '<div class="grid">' + list.map(cardHTML).join('') + '</div>';
    }
    $('catalogBody').innerHTML = html;
  }

  $('catalogBody').addEventListener('click', function (e) {
    if (e.target.closest('[data-clear-search]')) { clearSearch(true); }
    if (e.target.closest('[data-clear-price]')) { state.min = state.max = null; minEl.value = maxEl.value = ''; renderCatalog(); }
  });
  sortSel.addEventListener('change', function () { state.sort = sortSel.value; renderCatalog(); });
  function readPrice(el) { var v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) && v >= 0 ? v : null; }
  var priceTimer;
  [minEl, maxEl].forEach(function (el) {
    el.addEventListener('input', function () {
      clearTimeout(priceTimer);
      priceTimer = setTimeout(function () { state.min = readPrice(minEl); state.max = readPrice(maxEl); renderCatalog(); }, 300);
    });
  });

  /* ---------- Busca ---------- */
  var searchInput = $('searchInput'), searchClear = $('searchClear'), searchTimer;
  function setHomeOnly() {
    var home = state.cat === 'acessorios' && !state.q;
    document.querySelectorAll('[data-home-only]').forEach(function (el) {
      el.hidden = !home || (el.id === 'destaques' && !hasFeatured);
    });
  }
  function runSearch(scroll) {
    var q = searchInput.value.trim();
    if (q !== state.q) state.searchCat = 'tudo';
    state.q = q;
    searchClear.hidden = !q;
    if (q && state.cat !== 'acessorios') {
      history.replaceState(null, '', location.pathname + location.search + '#/');
      applyCategory('acessorios', false);
    }
    setHomeOnly();
    setHero();
    renderCatalog();
    if (scroll) scrollToEl($('catalogo'));
  }
  function clearSearch(focus) {
    searchInput.value = '';
    runSearch(false);
    if (focus) searchInput.focus();
  }
  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { runSearch(false); }, 160);
  });
  $('searchForm').addEventListener('submit', function (e) { e.preventDefault(); runSearch(true); searchInput.blur(); });
  searchClear.addEventListener('click', function () { clearSearch(true); });

  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - (header.offsetHeight - 1);
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* =========================================================
     BANNERS
     ========================================================= */
  var hero = $('banner');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var homeSlides = slides.filter(function (s) { return s.getAttribute('data-home') === 'true'; });
  var dotsWrap = $('bannerDots'), controls = $('heroControls');
  var current = 0, autoTimer = null, paused = false, mode = 'home';

  homeSlides.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Mostrar banner ' + (i + 1) + ': ' + s.querySelector('.kicker').textContent);
    b.addEventListener('click', function () { showHome(i); restartAuto(); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function activate(slide) {
    slides.forEach(function (s) {
      var on = s === slide;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      if (on) { var img = s.querySelector('img'); if (img) img.loading = 'eager'; }
    });
  }
  function showHome(i) {
    current = (i + homeSlides.length) % homeSlides.length;
    activate(homeSlides[current]);
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === current ? 'true' : 'false'); });
  }
  function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
  function restartAuto() {
    stopAuto();
    if (reduceMotion || mode !== 'home' || homeSlides.length < 2) return;
    autoTimer = setInterval(function () { if (!paused && !document.hidden) showHome(current + 1); }, 6500);
  }
  function setHero() {
    var cat = state.q ? 'acessorios' : state.cat;
    var target = cat === 'acessorios' ? null : slides.filter(function (s) { return s.getAttribute('data-cat') === cat; })[0];
    if (target) {
      mode = 'single';
      activate(target);
      controls.hidden = true;
      hero.classList.add('single');
      target.querySelectorAll('.btn').forEach(function (b) { if (b.getAttribute('href') === '#/' + cat) b.hidden = true; });
    } else {
      mode = 'home';
      controls.hidden = homeSlides.length < 2;
      hero.classList.remove('single');
      slides.forEach(function (s) { s.querySelectorAll('.btn').forEach(function (b) { b.hidden = false; }); });
      showHome(current);
    }
    restartAuto();
  }
  $('bannerPrev').addEventListener('click', function () { showHome(current - 1); restartAuto(); });
  $('bannerNext').addEventListener('click', function () { showHome(current + 1); restartAuto(); });
  hero.addEventListener('mouseenter', function () { paused = true; });
  hero.addEventListener('mouseleave', function () { paused = false; });
  hero.addEventListener('focusin', function () { paused = true; });
  hero.addEventListener('focusout', function () { paused = false; });
  var touchX = null;
  hero.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (touchX === null || mode !== 'home') return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { showHome(current + (dx < 0 ? 1 : -1)); restartAuto(); }
    touchX = null;
  }, { passive: true });

  /* =========================================================
     CATEGORIAS (endereço: #/capinhas, #/fones…)
     ========================================================= */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#catnav [data-cat], #menu [data-cat]'));

  function applyCategory(cat, scroll) {
    if (cat !== 'acessorios' && !CATS[cat]) cat = 'acessorios';
    var changed = cat !== state.cat;
    state.cat = cat;
    if (changed) { state.min = state.max = null; minEl.value = maxEl.value = ''; }
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-cat') === cat) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $('crumbs').hidden = cat === 'acessorios';
    $('crumbCurrent').textContent = cat === 'acessorios' ? '' : CATS[cat].nome;
    document.title = cat === 'acessorios' ? 'Júnior Tech | Acessórios para celular' : CATS[cat].nome + ' | Júnior Tech';
    setHomeOnly();
    setHero();
    renderCatalog();
    if (scroll) scrollToEl(chipScroll ? $('catalogo') : hero);
    chipScroll = false;
  }

  function route(scroll) {
    var h = location.hash;
    if (h === '' || h === '#' || h.indexOf('#/') === 0) {
      var cat = h.replace(/^#\/?/, '') || 'acessorios';
      if (state.q) { state.q = ''; searchInput.value = ''; searchClear.hidden = true; }
      applyCategory(cat, scroll);
    }
  }
  window.addEventListener('hashchange', function () { route(true); });

  /* =========================================================
     CABEÇALHO NO CELULAR: some ao descer, volta ao subir
     ========================================================= */
  var compact = window.matchMedia('(max-width: 760px), (max-height: 500px)');
  var lastY = window.pageYOffset, ticking = false;
  var waFloat = $('waFloat'), footer = document.querySelector('.footer');
  function onScroll() {
    var y = Math.max(0, window.pageYOffset);
    var keep = !compact.matches || y < header.offsetHeight * 1.5 || document.activeElement === searchInput || !!openPanel;
    if (keep) header.classList.remove('is-hidden');
    else if (y > lastY + 6) header.classList.add('is-hidden');
    else if (y < lastY - 6) header.classList.remove('is-hidden');
    if (Math.abs(y - lastY) > 6 || keep) lastY = y;
    // botão flutuante sai de cena perto do rodapé para não cobrir links
    var nearEnd = footer.getBoundingClientRect().top < window.innerHeight - 40;
    waFloat.classList.toggle('away', nearEnd);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  searchInput.addEventListener('focus', function () { header.classList.remove('is-hidden'); });

  /* =========================================================
     VÍDEO DA LOJA
     ========================================================= */
  var video = $('storeVideo'), sound = $('soundToggle');
  if (video && sound) {
    if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); }
    sound.addEventListener('click', function () {
      video.muted = !video.muted;
      sound.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
      sound.setAttribute('aria-label', video.muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo');
      if (video.paused) video.play().catch(function () {});
    });
  }

  /* =========================================================
     ENTRADA SUAVE DAS SEÇÕES
     ========================================================= */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.perks, .cats, .featured, .service, .stores, .contact').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ---------- início ---------- */
  renderCart();
  route(false);
  onScroll();
})();
