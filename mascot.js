/*!
 * mascot.js — Pet Pato 🦆 travesso.
 * Pula e pousa nas letras/títulos/cards. Ao cair ABRE AS ASAS e plana.
 * Entorta os cards com o peso, ROUBA botões (pega, carrega e devolve), fala imperativo.
 * Posição via translate3d. Entorta via propriedade CSS `rotate`, carrega via `translate`
 * (independentes de `transform`, então NÃO brigam com o GSAP das outras animações).
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
    var wingL = mascot.querySelector('.mascot-wing-left');
    var wingR = mascot.querySelector('.mascot-wing-right');
    var bubble = document.getElementById('mascot-bubble');

    var W = 52, H = 52, DUCK_FOOT = 8;

    var PERCH_SELECTORS = [
      '.hero-title', '.hero-description', '.badge-tech',
      '.stat-num', '.section-title',
      '.kw-gallery-title', '.kw-tpl-name', '.kw-tpl-badge',
      '.plan-price', '.plan-tier', '.plans-title',
      '.wizard-title', '.step-title',
      '.contact-title', '.channel-value', '.footer-logo'
    ];

    var quotes = ['LÊ AQUI!', 'CLICA JÁ! 🚀', 'OLHA ISSO!', 'VEM CÁ!', 'PEGUEI! 🦆',
                  'TOMA DE VOLTA!', 'QUÁ QUÁ!', 'CONFIA! ✨'];

    var STATE = { SIT: 'sit', HOP: 'hop' };
    var state = STATE.SIT;

    var perch = null;
    var walk = 0, walkDir = 1, facing = 1;
    var x = 60, y = window.innerHeight / 2;

    var hop = null;
    var nextHopAt = performance.now() + rand(900, 1600);
    var pendingTarget = null;
    var lastPeck = 0;
    var hopsSinceSteal = 0;

    // roubo de botão em andamento
    var carrying = null;   // { el, cx0, cy0, until }
    var tiltedCard = null; // card atualmente entortado

    function rand(a, b) { return a + Math.random() * (b - a); }
    function rectOf(el) { var r = el.getBoundingClientRect(); return (r.width < 24 || r.height < 8) ? null : r; }
    function isVisible(r) { return r && r.top > 70 && r.bottom < window.innerHeight - 20 && r.left < window.innerWidth - 30 && r.right > 30; }

    function perchPoint(el, walkOffset) {
      var r = rectOf(el);
      if (!r) return null;
      var maxWalk = Math.max(0, r.width - W);
      var wx = Math.min(walkOffset, maxWalk);
      return { x: r.left + wx, y: r.top - H + DUCK_FOOT, width: r.width, maxWalk: maxWalk };
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

    function visibleButtons() {
      var out = [];
      var els = document.querySelectorAll('.btn');
      for (var i = 0; i < els.length; i++) {
        var r = rectOf(els[i]);
        if (isVisible(r)) out.push(els[i]);
      }
      return out;
    }

    function pickPerch(exclude) {
      var list = collectPerches();
      if (!list.length) return null;
      var midY = window.innerHeight / 2;
      var scored = list.filter(function (el) { return el !== exclude; })
        .map(function (el) { var r = el.getBoundingClientRect(); return { el: el, s: Math.abs((r.top + r.bottom) / 2 - midY) + rand(0, 220) }; })
        .sort(function (a, b) { return a.s - b.s; });
      return scored.length ? scored[0].el : null;
    }

    function startHop(targetEl, opts) {
      if (!targetEl) return;
      var tr = rectOf(targetEl);
      if (!tr) return;
      var maxWalk = Math.max(0, tr.width - W);
      var targetWalk = rand(0, maxWalk);
      var dest = perchPoint(targetEl, targetWalk);
      if (!dest) return;
      var dist = Math.hypot(dest.x - x, dest.y - y);
      hop = {
        x0: x, y0: y, x1: dest.x, y1: dest.y,
        arc: Math.max(70, dist * 0.5),
        dur: Math.max(0.5, Math.min(1.15, dist / 650)),
        t: 0, targetPerch: targetEl, targetWalk: targetWalk,
        steal: !!(opts && opts.steal)
      };
      facing = (dest.x >= x) ? 1 : -1;
      state = STATE.HOP;
    }

    function speak(txt) {
      if (!bubble) return;
      bubble.textContent = txt || quotes[(Math.random() * quotes.length) | 0];
      bubble.classList.add('show');
      clearTimeout(bubble._t);
      bubble._t = setTimeout(function () { bubble.classList.remove('show'); }, 1400);
    }

    // entorta o card sob o pato (usa propriedade `rotate`, não conflita com GSAP)
    function tiltCardUnder(el, angle) {
      var card = el.closest ? el.closest('.kw-tpl-card, .plan-card') : null;
      if (tiltedCard && tiltedCard !== card) {
        tiltedCard.style.transition = 'rotate 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
        tiltedCard.style.rotate = '0deg';
      }
      if (card) {
        card.style.transition = 'rotate 0.35s cubic-bezier(0.175,0.885,0.32,1.275)';
        card.style.rotate = angle.toFixed(1) + 'deg';
        tiltedCard = card;
      } else {
        tiltedCard = null;
      }
    }

    function grabButton(btn) {
      var r = rectOf(btn);
      if (!r) return;
      carrying = { el: btn, cx0: r.left + r.width / 2, cy0: r.top + r.height / 2, until: performance.now() + rand(1400, 2200) };
      btn.style.transition = 'none';
      btn.style.zIndex = '901';
      speak('PEGUEI! 🦆');
    }

    function releaseButton() {
      if (!carrying) return;
      var btn = carrying.el;
      btn.style.transition = 'translate 0.55s cubic-bezier(0.175,0.885,0.32,1.275), rotate 0.45s ease';
      btn.style.translate = '0px 0px';
      btn.style.rotate = '0deg';
      setTimeout(function () { btn.style.zIndex = ''; btn.style.transition = ''; }, 600);
      carrying = null;
      speak('TOMA DE VOLTA!');
    }

    var lastNow = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      var squashY = 1, squashX = 1, rot = 0, shadowScale = 1, shadowOp = 1;
      var falling = false, flightK = 0;

      if (state === STATE.HOP && hop) {
        hop.t += dt / hop.dur;
        var t = hop.t;
        if (t >= 1) {
          x = hop.x1; y = hop.y1;
          var landed = hop.targetPerch;
          var wasSteal = hop.steal;
          walk = hop.targetWalk;
          perch = landed;
          state = STATE.SIT;
          squashY = 0.68; squashX = 1.32;      // impacto do pouso
          // entorta card ao pousar
          tiltCardUnder(landed, facing * rand(3, 6));
          if (wasSteal) { grabButton(landed); nextHopAt = now + 500; hopsSinceSteal = 0; }
          else { nextHopAt = now + rand(1300, 2900); }
          hop = null;
        } else {
          var e = t;
          x = hop.x0 + (hop.x1 - hop.x0) * e;
          var yLine = hop.y0 + (hop.y1 - hop.y0) * e;
          y = yLine - Math.sin(Math.PI * e) * hop.arc;
          falling = e > 0.42;                  // metade descendente = planando
          flightK = Math.sin(Math.PI * e);     // 0..1..0
          squashY = 1 + flightK * 0.16;
          squashX = 1 - flightK * 0.10;
          rot = facing * flightK * 10;
          shadowScale = 0.5 + (1 - flightK) * 0.6;
          shadowOp = 0.22 + (1 - flightK) * 0.55;
        }
      } else {
        // SIT
        if (perch) {
          var vis = isVisible(perch.getBoundingClientRect());
          var p = perchPoint(perch, walk);
          if (!p || !vis) {
            if (tiltedCard) { tiltedCard.style.rotate = '0deg'; tiltedCard = null; }
            var np = pickPerch(perch);
            if (np) startHop(np);
          } else {
            walk += walkDir * 26 * dt;
            if (walk >= p.maxWalk) { walk = p.maxWalk; walkDir = -1; facing = -1; }
            else if (walk <= 0) { walk = 0; walkDir = 1; facing = 1; }
            var p2 = perchPoint(perch, walk);
            if (p2) { x = p2.x; y = p2.y; }
            squashY = 1 + Math.sin(now / 140) * 0.05;
            if (now - lastPeck > rand(2200, 4200)) { lastPeck = now; rot = facing * 16; }
          }
        } else {
          var first = pickPerch(null);
          if (first) startHop(first);
        }

        if (now >= nextHopAt && state === STATE.SIT) {
          var target, steal = false;
          if (pendingTarget) { target = pendingTarget; pendingTarget = null; }
          else if (hopsSinceSteal >= 2 && Math.random() < 0.55) {
            var btns = visibleButtons();
            if (btns.length) { target = btns[(Math.random() * btns.length) | 0]; steal = true; }
          }
          if (!target) target = pickPerch(perch);
          hopsSinceSteal++;
          if (target) { startHop(target, { steal: steal }); if (!steal && Math.random() < 0.4) speak(); }
          else nextHopAt = now + 1200;
        }
      }

      // carregar botão roubado: ele segue pendurado abaixo do pato
      if (carrying) {
        var duckCX = x + W / 2, duckCY = y + H;
        var dx = duckCX - carrying.cx0;
        var dy = duckCY - carrying.cy0 + 26;
        carrying.el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
        carrying.el.style.rotate = (Math.sin(now / 110) * 10).toFixed(1) + 'deg';
        if (now > carrying.until) releaseButton();
      }

      // asas: abrem e batem ao cair/planar
      var wingSpread = falling ? 1 : (state === STATE.HOP ? 0.35 : 0);
      var flap = falling ? Math.sin(now / 55) * 35 : Math.sin(now / 90) * 10;
      if (wingL && wingR) {
        wingL.style.opacity = wingSpread.toFixed(2);
        wingR.style.opacity = wingSpread.toFixed(2);
        wingL.style.transform = 'rotate(' + (30 + flap) + 'deg) scale(' + (0.6 + wingSpread * 0.5) + ')';
        wingR.style.transform = 'rotate(' + (-30 - flap) + 'deg) scale(' + (0.6 + wingSpread * 0.5) + ')';
      }

      x = Math.max(4, Math.min(window.innerWidth - W - 4, x));
      y = Math.max(66, Math.min(window.innerHeight - H - 4, y));

      mascot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (body) body.style.transform = 'scaleX(' + facing + ')';
      if (duck) duck.style.transform = 'scale(' + squashX.toFixed(3) + ',' + squashY.toFixed(3) + ') rotate(' + rot.toFixed(1) + 'deg)';
      if (shadow) { shadow.style.transform = 'translateX(-50%) scaleX(' + shadowScale.toFixed(2) + ')'; shadow.style.opacity = shadowOp.toFixed(2); }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // hover em card/botão/título → pula pra lá
    var hoverSel = '.kw-tpl-card, .plan-card, .btn, .hero-title, .kw-gallery-title';
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest ? e.target.closest(hoverSel) : null;
      if (!el) return;
      var perchInside = el.matches('.btn, .hero-title, .kw-gallery-title')
        ? el : (el.querySelector('.kw-tpl-name, .plan-price, .kw-tpl-badge') || el);
      var r = rectOf(perchInside);
      if (r && isVisible(r) && perch !== perchInside && state === STATE.SIT && !carrying) {
        pendingTarget = perchInside;
        nextHopAt = performance.now();
      }
    });

    // click em botão → pulinho + fala
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn') : null;
      if (!btn) return;
      speak('CLICA JÁ! 🚀');
      if (state === STATE.SIT && perch && !carrying) {
        hop = { x0: x, y0: y, x1: x, y1: y, arc: 55, dur: 0.4, t: 0, targetPerch: perch, targetWalk: walk };
        state = STATE.HOP;
      }
    });

    window.addEventListener('resize', function () {
      x = Math.min(x, window.innerWidth - W - 4);
      y = Math.min(y, window.innerHeight - H - 4);
    });
  }
})();
