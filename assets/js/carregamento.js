/* =========================================================
   Júnior Tech · tela de carregamento
   O cabo conecta, a bateria do celular enche de 0 a 100%
   acompanhando o carregamento real da página, o logo acende
   na tela e o site aparece.
   - Aparece uma vez por visita (sessionStorage).
   - Tempo mínimo curto e limite máximo de 3,5 s.
   - Clique ou toque pula a animação.
   - Respeita "reduzir movimento" do sistema.
   ========================================================= */
(function () {
  'use strict';
  var loader = document.getElementById('loader');
  if (!loader) return;

  var KEY = 'jt-carregou';
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* sem armazenamento: mostra normalmente */ }
  if (seen) { loader.parentNode.removeChild(loader); return; }

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fill = document.getElementById('loaderFill');
  var pctEl = document.getElementById('loaderPct');
  var label = document.getElementById('loaderLabel');

  var PLUG_DELAY = reduce ? 0 : 420;   // tempo do cabo encaixar
  var MIN = reduce ? 300 : 900;        // duração mínima da carga
  var MAX = 3500;                      // nunca segura o cliente mais que isso
  var t0 = null, pct = 0, loaded = document.readyState === 'complete', finished = false;

  root.classList.add('is-loading');
  window.addEventListener('load', function () { loaded = true; });

  function render() {
    var v = Math.round(pct);
    fill.style.transform = 'scaleY(' + (pct / 100) + ')';
    pctEl.textContent = v;
    if (v >= 100) label.textContent = 'Carregado';
    else if (v >= 1) label.textContent = 'Carregando acessórios';
  }

  function finish(fast) {
    if (finished) return;
    finished = true;
    pct = 100; render();
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    loader.classList.add('done');
    setTimeout(function () {
      loader.classList.add('out');
      root.classList.remove('is-loading');
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 460);
    }, fast === true || reduce ? 0 : 420);
  }

  function frame(now) {
    if (finished) return;
    if (t0 === null) t0 = now + PLUG_DELAY;
    var el = now - t0;
    if (el > 0) {
      // até 90% em ritmo de carga; os últimos 10% só quando a página terminar
      var k = Math.min(el / MIN, 1);
      var target = 90 * (1 - Math.pow(1 - k, 3));
      if ((loaded && el >= MIN) || el >= MAX) target = 100;
      pct += (target - pct) * (reduce ? 1 : 0.2);
      if (target === 100 && 100 - pct < 0.6) pct = 100;
      render();
      if (pct >= 100) { finish(false); return; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // pular com clique/toque
  loader.addEventListener('click', function () { finish(true); });
  // segurança: se algo travar, libera a página
  setTimeout(function () { finish(false); }, MAX + PLUG_DELAY + 800);
})();
