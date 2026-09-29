ScrollCraft.mount(document.body);

/* ══ O gesto assinatura: o "+" atravessa a página ═══════════════════════
   Camada própria, conduzida pelo scroll do documento inteiro e não pelo
   `--sc-p` de um act — é isso que o deixa sobreviver aos cortes em vez de
   morrer com o capítulo onde nasceu. O engine não é tocado. */
(function () {
  var svg = document.querySelector('.cruz svg');
  var caps = [].slice.call(document.querySelectorAll('[data-cap]'));
  var folioN = document.getElementById('folio-n');
  var folioT = document.getElementById('folio-t');
  var reduz = matchMedia('(prefers-reduced-motion: reduce)');

  var POSTOS = [
    { p: 0.00, s: 2.7,  x:  30, y: -10, r:   0, c: '#F2762B' },
    { p: 0.12, s: 2.1,  x:  34, y:   8, r:  18, c: '#F2762B' },
    { p: 0.26, s: 0.55, x: -38, y:  18, r:  45, c: '#F2762B' },
    { p: 0.44, s: 0.8,  x:  36, y: -20, r:   0, c: '#8a7b6d' },
    { p: 0.62, s: 0.5,  x: -40, y: -26, r:  45, c: '#F2762B' },
    { p: 0.80, s: 0.9,  x:  36, y:  22, r:  12, c: '#F2762B' },
    /* Aqui vive o CTA, por isso o "+" sai do centro. E deixa de ser carvão:
       carvão sobre laranja é a mesma cor do título, e a passagem por trás do
       texto media 2.55:1 — ou seja, uma palavra a desaparecer sobre a outra.
       Um creme sobre o laranja lê-se como marca-d'água e não compete. */
    { p: 1.00, s: 1.15, x:  40, y:  30, r:   0, c: '#f7f2ec' }
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

  /* Um lerp por frame: os eventos de roda não chegam a ritmo constante, e
     uma escrita 1:1 reproduz cada buraco entre eles como um solavanco. */
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

/* ══ Serviços, um a um ══════════════════════════════════════════════════
   As cenas trocam com o scroll dentro do act, e os botões da coluna deixam
   saltar entre elas. Duas formas de chegar ao mesmo sítio: o scroll para
   quem só passa, o botão para quem procura.

   As cenas escondidas levam `hidden` e não `opacity: 0`. Uma cena a zero de
   opacidade continua a ser tabulável e continua a ser lida por um leitor de
   ecrã, o que punha quatro botões "Falar sobre isto" na ordem de teclado,
   três deles invisíveis. */
(function () {
  var caixa = document.getElementById('mostra');
  if (!caixa) return;
  var cenas = [].slice.call(caixa.querySelectorAll('.mostra__cena'));
  var pins  = [].slice.call(caixa.querySelectorAll('.mostra__pin'));
  var act   = caixa.closest('[data-sc-act]');
  var atual = 0, manual = -1, tManual = 0;

  function mostrar(i) {
    if (i === atual) return;
    atual = i;
    cenas.forEach(function (c, k) { c.hidden = k !== i; });
    pins.forEach(function (p, k) { p.setAttribute('aria-current', k === i ? 'true' : 'false'); });
  }

  pins.forEach(function (p) {
    p.addEventListener('click', function () {
      /* Um clique manda durante dois segundos; depois o scroll volta a
         mandar. Sem esta trégua, rolar um pixel logo a seguir ao clique
         desfazia-o e a coluna parecia não funcionar. */
      manual = +p.getAttribute('data-ir');
      tManual = performance.now();
      mostrar(manual);
    });
  });

  function seguirScroll() {
    if (act) {
      var expirou = performance.now() - tManual > 2000;
      if (manual < 0 || expirou) {
        manual = -1;
        var p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
        var i = Math.min(cenas.length - 1, Math.floor(p * cenas.length));
        var r = act.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) mostrar(i);
      }
    }
    requestAnimationFrame(seguirScroll);
  }
  requestAnimationFrame(seguirScroll);
})();
