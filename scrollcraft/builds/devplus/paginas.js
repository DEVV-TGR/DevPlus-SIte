/* ══════════════════════════════════════════════════════════════════════
   O comportamento das páginas interiores.

   O `pagina.js` da homepage fica como está: aquele tem a `mostra` de
   serviços e os sete postos do gesto, que são de lá. Isto é o que as cinco
   páginas novas partilham — o gesto do "+", o fólio, e as duas formas que
   precisam de código (o acordeão e o índice).

   Cada bloco desiste sozinho se a página não tiver o elemento respetivo, o
   que é o que permite um ficheiro só para cinco páginas diferentes.
   ══════════════════════════════════════════════════════════════════════ */

ScrollCraft.mount(document.body);

/* ══ O gesto: o "+" atravessa também as páginas interiores ══════════════
   Mesmo mecanismo do `pagina.js`, com os postos vindos de fora: estas
   páginas são curtas e sete paragens num percurso de 6vh não são um gesto,
   são um estremeção. Quatro chegam, e o último põe sempre o "+" fora do
   centro, onde vive a ação. */
(function () {
  var svg = document.querySelector('.cruz svg');
  if (!svg) return;
  var caps = [].slice.call(document.querySelectorAll('[data-cap]'));
  var folioN = document.getElementById('folio-n');
  var folioT = document.getElementById('folio-t');
  var reduz = matchMedia('(prefers-reduced-motion: reduce)');

  var POSTOS = window.CRUZ_POSTOS || [
    { p: 0.00, s: 2.2, x:  32, y: -14, r:   0, c: '#F2762B' },
    { p: 0.36, s: 0.6, x: -36, y:  16, r:  45, c: '#F2762B' },
    { p: 0.72, s: 0.9, x:  34, y: -22, r:  12, c: '#8a7b6d' },
    { p: 1.00, s: 1.3, x:  38, y:  26, r:   0, c: '#F2762B' }
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function suave(t) { return t * t * (3 - 2 * t); }
  var alvo = 0, atual = 0, ticking = false;

  function posto(p) {
    var i = 0;
    while (i < POSTOS.length - 2 && p > POSTOS[i + 1].p) i++;
    var a = POSTOS[i], b = POSTOS[i + 1];
    var t = suave(Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p))));
    return { s: lerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), c: t < 0.5 ? a.c : b.c };
  }

  function pintar() {
    ticking = false;
    var v = posto(atual);
    svg.style.setProperty('--cs', v.s.toFixed(3));
    svg.style.setProperty('--cx', v.x.toFixed(2) + 'vw');
    svg.style.setProperty('--cy', v.y.toFixed(2) + 'vh');
    svg.style.setProperty('--cr', v.r.toFixed(2) + 'deg');
    svg.style.setProperty('--cfill', v.c);

    if (!folioN || !caps.length) return;
    var meio = innerHeight / 2, dentro = caps[0];
    for (var i = 0; i < caps.length; i++) {
      var r = caps[i].getBoundingClientRect();
      if (r.top <= meio && r.bottom >= meio) { dentro = caps[i]; break; }
    }
    var n = ('0' + dentro.getAttribute('data-cap')).slice(-2);
    if (folioN.textContent !== n) {
      folioN.textContent = n;
      folioT.textContent = dentro.getAttribute('data-cap-nome');
    }
  }

  function medir() {
    var max = document.documentElement.scrollHeight - innerHeight;
    alvo = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    if (!ticking) { ticking = true; requestAnimationFrame(passo); }
  }
  function passo() {
    atual += (alvo - atual) * (reduz.matches ? 1 : 0.12);
    pintar();
    if (Math.abs(alvo - atual) > 0.0002 && !reduz.matches) requestAnimationFrame(passo);
    else { atual = alvo; pintar(); ticking = false; }
  }

  addEventListener('scroll', medir, { passive: true });
  addEventListener('resize', medir);
  medir(); pintar();
})();

/* ══ /servicos · o acordeão ═════════════════════════════════════════════
   Uma coluna aberta de cada vez. Duas maneiras de a trocar, como na `mostra`
   da homepage: o scroll para quem passa, o clique para quem procura — e o
   clique manda durante dois segundos, senão rolar um pixel a seguir
   desfazia-o.

   As colunas são `<button>` e não `<div>` com um `onclick`: assim vêm de
   borla o foco, o Enter, o Espaço e o anúncio do estado pelo `aria-expanded`.
   O que está fechado continua no DOM e continua legível — ao contrário das
   cenas da homepage, aqui o texto fechado não é um duplicado do aberto. */
(function () {
  var caixa = document.getElementById('acord');
  if (!caixa) return;
  var cols = [].slice.call(caixa.querySelectorAll('.acord__col'));
  var act = caixa.closest('[data-sc-act]');
  var aberta = 0, manual = -1, tManual = 0;

  function abrir(i) {
    if (i === aberta) return;
    aberta = i;
    /* A largura é do CSS: `[aria-expanded="true"]` vale cinco vezes uma
       fechada. O JS só diz qual é a aberta — se a proporção vier para aqui,
       passa a haver dois sítios a decidir a mesma coisa. */
    cols.forEach(function (c, k) {
      c.setAttribute('aria-expanded', k === i ? 'true' : 'false');
    });
  }

  cols.forEach(function (c, i) {
    c.addEventListener('click', function () {
      manual = i; tManual = performance.now(); abrir(i);
    });
  });

  function seguir() {
    if (act) {
      var expirou = performance.now() - tManual > 2000;
      if (manual < 0 || expirou) {
        manual = -1;
        var p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
        var r = act.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          abrir(Math.min(cols.length - 1, Math.floor(p * cols.length)));
        }
      }
    }
    requestAnimationFrame(seguir);
  }
  cols[0].setAttribute('aria-expanded', 'true');
  requestAnimationFrame(seguir);
})();

/* ══ /portfolio · o índice ══════════════════════════════════════════════
   O projeto ativo é o que está mais perto da linha dos 42% do ecrã — não o
   primeiro visível. Com "o primeiro visível" a capa trocava assim que uma
   linha espreitasse por baixo, e o que se vê na moldura deixava de ser o que
   se está a ler.

   Sem `IntersectionObserver` com dezenas de limiares: um cálculo por frame de
   scroll sobre seis elementos é mais barato e é exato. */
(function () {
  var lista = document.getElementById('indice');
  if (!lista) return;
  var itens = [].slice.call(lista.querySelectorAll('.indice__item'));
  var capas = [].slice.call(document.querySelectorAll('.indice__capa'));
  var atual = -1, agendado = false;

  function escolher() {
    agendado = false;
    var linha = innerHeight * 0.42, melhor = 0, dist = Infinity;
    itens.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - linha);
      if (d < dist) { dist = d; melhor = i; }
    });
    if (melhor === atual) return;
    atual = melhor;
    itens.forEach(function (el, i) { el.setAttribute('data-ativo', i === melhor ? 'true' : 'false'); });
    capas.forEach(function (el, i) { el.setAttribute('data-ativa', i === melhor ? 'true' : 'false'); });
  }

  function agendar() { if (!agendado) { agendado = true; requestAnimationFrame(escolher); } }
  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  /* O rato manda por cima do scroll: quem aponta um nome quer ver aquele. */
  itens.forEach(function (el, i) {
    el.addEventListener('mouseenter', function () {
      atual = i;
      itens.forEach(function (x, k) { x.setAttribute('data-ativo', k === i ? 'true' : 'false'); });
      capas.forEach(function (x, k) { x.setAttribute('data-ativa', k === i ? 'true' : 'false'); });
    });
  });
  escolher();
})();
