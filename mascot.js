/*!
 * mascot.js — Pet Pato 🦆 que pula e pousa em cima das letras, títulos, cards e botões.
 * Empoleira num elemento, anda (waddle) por cima, dá bicadas, e salta em arco pro próximo.
 * Acompanha o scroll grudando no elemento; reage a hover/click.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduced) return;

    var mascot = document.getElementById('mascot');
    if (!mascot) return;

    var body = mascot.querySelector('.mascot-body');
    var duck = mascot.querySelector('.mascot-duck');
    var shadow = mascot.querySelector('.mascot-shadow');
    var bubble = document.getElementById('mascot-bubble');

    var W = 52, H = 52;                 // tamanho do pet
    var DUCK_FOOT = 8;                  // margem dos pés ao topo do poleiro

    // Seletores dos poleiros possíveis (letras, títulos, cards, botões...)
    var PERCH_SELECTORS = [
      '.hero-title', '.hero-description', '.badge-tech',
      '.stat-num', '.section-title',
      '.kw-gallery-title', '.kw-tpl-name', '.kw-tpl-badge',
      '.plan-price', '.plan-tier', '.plans-title',
      '.wizard-title', '.step-title',
      '.contact-title', '.channel-value',
      '.btn', '.nav-link', '.footer-logo'
    ];

    var quotes = ['quá!', 'olha!', 'psiu 👀', 'lê isso!', 'clica! 🚀', 'legal né?', 'vem cá!'];

    // Estado
    var STATE = { SIT: 'sit', HOP: 'hop' };
    var state = STATE.SIT;

    var perch = null;          // elemento onde está pousado
    var walk = 0;              // deslocamento horizontal ao longo do poleiro (0..width)
    var walkDir = 1;
    var facing = 1;            // 1 = direita, -1 = esquerda

    // posição renderizada (canto sup-esq do pet, coords viewport)
    var x = 60, y = window.innerHeight / 2;

    // hop
    var hop = null;            // { x0,y0,x1,y1,arc,dur,t, targetPerch, targetWalk }
    var nextHopAt = performance.now() + rand(900, 1800);
    var pendingTarget = null;  // poleiro forçado por hover

    var lastPeck = 0;

    // ---------- helpers ----------
    function rand(a, b) { return a + Math.random() * (b - a); }

    function rectOf(el) {
      var r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 8) return null;
      return r;
    }

    function isVisible(r) {
      return r && r.top > 70 && r.bottom < window.innerHeight - 20 && r.left < window.innerWidth - 30 && r.right > 30;
    }

    // topo do poleiro na posição de caminhada (retorna canto sup-esq do pet)
    function perchPoint(el, walkOffset) {
      var r = rectOf(el);
      if (!r) return null;
      var maxWalk = Math.max(0, r.width - W);
      var wx = Math.min(walkOffset, maxWalk);
      return {
        x: r.left + wx,
        y: r.top - H + DUCK_FOOT,   // pés encostam no topo do elemento
        width: r.width,
        maxWalk: maxWalk
      };
    }

    function collectPerches() {
      var out = [];
      for (var i = 0; i < PERCH_SELECTORS.length; i++) {
        var els = document.querySelectorAll(PERCH_SELECTORS[i]);
        for (var j = 0; j < els.length; j++) {
          var r = rectOf(els[j]);
          if (isVisible(r)) out.push(els[j]);
        }
      }
      return out;
    }

    function pickPerch(exclude) {
      var list = collectPerches();
      if (!list.length) return null;
      // preferir poleiros perto do centro vertical da viewport
      var midY = window.innerHeight / 2;
      var scored = list
        .filter(function (el) { return el !== exclude; })
        .map(function (el) {
          var r = el.getBoundingClientRect();
          var d = Math.abs((r.top + r.bottom) / 2 - midY);
          return { el: el, score: d + rand(0, 220) };
        })
        .sort(function (a, b) { return a.score - b.score; });
      return scored.length ? scored[0].el : null;
    }

    function startHop(targetEl) {
      if (!targetEl) return;
      var maxWalk = 0;
      var tr = rectOf(targetEl);
      if (!tr) return;
      maxWalk = Math.max(0, tr.width - W);
      var targetWalk = rand(0, maxWalk);
      var dest = perchPoint(targetEl, targetWalk);
      if (!dest) return;

      var dist = Math.hypot(dest.x - x, dest.y - y);
      hop = {
        x0: x, y0: y,
        x1: dest.x, y1: dest.y,
        arc: Math.max(70, dist * 0.45),
        dur: Math.max(0.5, Math.min(1.1, dist / 700)),
        t: 0,
        targetPerch: targetEl,
        targetWalk: targetWalk
      };
      facing = (dest.x >= x) ? 1 : -1;
      state = STATE.HOP;
    }

    function speak() {
      if (!bubble) return;
      bubble.textContent = quotes[(Math.random() * quotes.length) | 0];
      bubble.classList.add('show');
      setTimeout(function () { bubble.classList.remove('show'); }, 1400);
    }

    // ---------- loop ----------
    var lastNow = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      var squashY = 1, squashX = 1, rot = 0, shadowScale = 1, shadowOp = 1;

      if (state === STATE.HOP && hop) {
        hop.t += dt / hop.dur;
        var t = hop.t;
        if (t >= 1) {
          // aterrissou
          x = hop.x1; y = hop.y1;
          perch = hop.targetPerch;
          walk = hop.targetWalk;
          state = STATE.SIT;
          nextHopAt = now + rand(1400, 3200);
          // squash de pouso
          squashY = 0.7; squashX = 1.3;
          hop = null;
        } else {
          var e = t;
          x = hop.x0 + (hop.x1 - hop.x0) * e;
          var yLine = hop.y0 + (hop.y1 - hop.y0) * e;
          y = yLine - Math.sin(Math.PI * e) * hop.arc;
          // estica no ar (stretch), inclina no sentido do movimento
          squashY = 1 + Math.sin(Math.PI * e) * 0.18;
          squashX = 1 - Math.sin(Math.PI * e) * 0.12;
          rot = facing * Math.sin(Math.PI * e) * 12;
          shadowScale = 0.5 + (1 - Math.sin(Math.PI * e)) * 0.6;
          shadowOp = 0.25 + (1 - Math.sin(Math.PI * e)) * 0.55;
        }
      } else {
        // SIT — grudado no poleiro, andando de um lado ao outro
        if (perch) {
          var p = perchPoint(perch, walk);
          if (!p || !isVisible(perch.getBoundingClientRect())) {
            // poleiro saiu de vista: pula pra outro
            var np = pickPerch(perch);
            if (np) startHop(np);
          } else {
            // waddle
            walk += walkDir * 26 * dt;
            if (walk >= p.maxWalk) { walk = p.maxWalk; walkDir = -1; facing = -1; }
            else if (walk <= 0) { walk = 0; walkDir = 1; facing = 1; }
            var p2 = perchPoint(perch, walk);
            if (p2) { x = p2.x; y = p2.y; }
            // bob de caminhada
            squashY = 1 + Math.sin(now / 140) * 0.05;
            // bicada ocasional
            if (now - lastPeck > rand(2200, 4200)) {
              lastPeck = now;
              rot = facing * 18;
            }
          }
        } else {
          // sem poleiro ainda: acha um
          var first = pickPerch(null);
          if (first) startHop(first);
        }

        // hora de pular pro próximo?
        if (now >= nextHopAt && state === STATE.SIT) {
          var target = pendingTarget || pickPerch(perch);
          pendingTarget = null;
          if (target) { startHop(target); if (Math.random() < 0.5) speak(); }
          else nextHopAt = now + 1200;
        }
      }

      // clamp viewport
      x = Math.max(4, Math.min(window.innerWidth - W - 4, x));
      y = Math.max(66, Math.min(window.innerHeight - H - 4, y));

      // render
      mascot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (body) body.style.transform = 'scaleX(' + facing + ')';
      if (duck) duck.style.transform = 'scale(' + squashX.toFixed(3) + ',' + squashY.toFixed(3) + ') rotate(' + rot.toFixed(1) + 'deg)';
      if (shadow) {
        shadow.style.transform = 'translateX(-50%) scaleX(' + shadowScale.toFixed(2) + ')';
        shadow.style.opacity = shadowOp.toFixed(2);
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // ---------- interações ----------
    // hover num card/botão/título → pato pula PRA LÁ
    var hoverSel = '.kw-tpl-card, .plan-card, .btn, .hero-title, .kw-gallery-title';
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest ? e.target.closest(hoverSel) : null;
      if (!el) return;
      // escolhe um poleiro dentro/no elemento
      var perchInside = el.matches('.btn, .hero-title, .kw-gallery-title')
        ? el
        : (el.querySelector('.kw-tpl-name, .plan-price, .kw-tpl-badge') || el);
      var r = rectOf(perchInside);
      if (r && isVisible(r) && perch !== perchInside && state === STATE.SIT) {
        pendingTarget = perchInside;
        nextHopAt = performance.now();  // pula já
      }
    });

    // click em botão → pato dá pulinho de comemoração + fala
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn') : null;
      if (!btn) return;
      speak();
      if (state === STATE.SIT && perch) {
        // pulinho no lugar
        hop = { x0: x, y0: y, x1: x, y1: y, arc: 60, dur: 0.45, t: 0, targetPerch: perch, targetWalk: walk };
        state = STATE.HOP;
      }
    });

    // recalcula limites em resize
    window.addEventListener('resize', function () {
      x = Math.min(x, window.innerWidth - W - 4);
      y = Math.min(y, window.innerHeight - H - 4);
    });
  }
})();
