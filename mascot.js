/*!
 * mascot.js — Pet Pato 🦆 animado por partes (SVG rigado).
 *
 * Animação: ciclo de passada com pernas alternadas + head-bob de ave, agachamento
 * (antecipação) antes do pulo, esticada no ar com asas batendo, squash + mola no
 * pouso, piscadas, bicadas e balanço de cauda.
 *
 * Travessuras: entorta cards ao pousar (propriedade CSS `rotate`) e rouba botões
 * (propriedade CSS `translate`) — ambas independentes de `transform`, então NÃO
 * conflitam com as animações GSAP do resto do site.
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

    var bodyEl = mascot.querySelector('.mascot-body');
    var shadow = mascot.querySelector('.mascot-shadow');
    var bubble = document.getElementById('mascot-bubble');

    // partes do pato
    var $all = document.getElementById('dk-all');
    var $head = document.getElementById('dk-head');
    var $eyelid = document.getElementById('dk-eyelid');
    var $wingN = document.getElementById('dk-wing-near');
    var $wingF = document.getElementById('dk-wing-far');
    var $legB = document.getElementById('dk-leg-b');
    var $legF = document.getElementById('dk-leg-f');
    var $tail = document.getElementById('dk-tail');

    function setT(el, t) { if (el) el.setAttribute('transform', t); }

    // caixa 56px; no viewBox 64 os pés ficam em y=62 → 62/64*56 ≈ 54.2px
    var W = 56, H = 56, FEET = 54;

    var PERCH_SELECTORS = [
      '.hero-title', '.hero-description', '.badge-tech',
      '.stat-num', '.section-title',
      '.kw-gallery-title', '.kw-tpl-name', '.kw-tpl-badge',
      '.plan-price', '.plan-tier', '.plans-title',
      '.wizard-title', '.step-title',
      '.contact-title', '.channel-value', '.footer-logo'
    ];

    var quotes = ['LÊ AQUI!', 'CLICA JÁ! 🚀', 'OLHA ISSO!', 'VEM CÁ!',
                  'QUÁ QUÁ!', 'CONFIA! ✨', 'PRESTA ATENÇÃO!'];

    var S = { SIT: 'sit', PREP: 'prep', HOP: 'hop', LAND: 'land' };
    var state = S.SIT;

    var perch = null;
    var walk = 0, walkDir = 1, facing = 1;
    var x = 60, y = window.innerHeight / 2;

    var hop = null, prep = null, land = null;
    var queued = null;                   // { el, steal } aguardando o agachamento
    var nextHopAt = performance.now() + rand(900, 1600);
    var pendingTarget = null;
    var hopsSinceSteal = 0;

    var carrying = null, tiltedCard = null;

    // relógios de animação
    var walkPhase = 0;                   // ciclo de passada
    var blinkAt = performance.now() + rand(1200, 3000), blinkUntil = 0;
    var peckUntil = 0, nextPeckAt = performance.now() + rand(2500, 5000);

    function rand(a, b) { return a + Math.random() * (b - a); }
    function rectOf(el) { var r = el.getBoundingClientRect(); return (r.width < 24 || r.height < 8) ? null : r; }
    function isVisible(r) { return r && r.top > 70 && r.bottom < window.innerHeight - 20 && r.left < window.innerWidth - 30 && r.right > 30; }

    function perchPoint(el, walkOffset) {
      var r = rectOf(el);
      if (!r) return null;
      var maxWalk = Math.max(0, r.width - W);
      return { x: r.left + Math.min(walkOffset, maxWalk), y: r.top - FEET, maxWalk: maxWalk };
    }

    function collectPerches() {
      var out = [];
      for (var i = 0; i < PERCH_SELECTORS.length; i++) {
        var els = document.querySelectorAll(PERCH_SELECTORS[i]);
        for (var j = 0; j < els.length; j++) if (isVisible(rectOf(els[j]))) out.push(els[j]);
      }
      return out;
    }

    function visibleButtons() {
      var out = [], els = document.querySelectorAll('.btn');
      for (var i = 0; i < els.length; i++) if (isVisible(rectOf(els[i]))) out.push(els[i]);
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

    // agacha antes de saltar (antecipação)
    function requestHop(targetEl, steal) {
      if (!targetEl || !rectOf(targetEl)) return;
      queued = { el: targetEl, steal: !!steal };
      prep = { t: 0, dur: 0.18 };
      state = S.PREP;
    }

    function launch() {
      var target = queued.el, steal = queued.steal;
      queued = null;
      var tr = rectOf(target);
      if (!tr) { state = S.SIT; nextHopAt = performance.now() + 600; return; }
      var maxWalk = Math.max(0, tr.width - W);
      var targetWalk = rand(0, maxWalk);
      var dest = perchPoint(target, targetWalk);
      if (!dest) { state = S.SIT; nextHopAt = performance.now() + 600; return; }
      var dist = Math.hypot(dest.x - x, dest.y - y);
      hop = {
        x0: x, y0: y, x1: dest.x, y1: dest.y,
        arc: Math.max(75, dist * 0.5),
        dur: Math.max(0.5, Math.min(1.15, dist / 640)),
        t: 0, target: target, targetWalk: targetWalk, steal: steal
      };
      facing = (dest.x >= x) ? 1 : -1;
      state = S.HOP;
    }

    function speak(txt) {
      if (!bubble) return;
      bubble.textContent = txt || quotes[(Math.random() * quotes.length) | 0];
      bubble.classList.add('show');
      clearTimeout(bubble._t);
      bubble._t = setTimeout(function () { bubble.classList.remove('show'); }, 1400);
    }

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
      } else tiltedCard = null;
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

      // ---- valores de pose (default: parado) ----
      var sx = 1, sy = 1;          // squash/stretch geral
      var lean = 0;                // inclinação do corpo
      var bobY = 0;                // sobe/desce do corpo
      var legB = 0, legF = 0;      // ângulo das pernas
      var headRot = 0, headX = 0, headY = 0;
      var wingN = 8, wingF = 12;   // asas dobradas
      var tailRot = 0;
      var shScale = 1, shOp = 1;
      var walking = false;

      if (state === S.PREP) {
        prep.t += dt / prep.dur;
        var k = Math.min(1, prep.t);
        // agacha: comprime e dobra as pernas
        sy = 1 - 0.22 * Math.sin(k * Math.PI * 0.5);
        sx = 1 + 0.16 * Math.sin(k * Math.PI * 0.5);
        legB = -18 * k; legF = 14 * k;
        headY = 2 * k; headRot = -6 * k;
        wingN = 8 + 14 * k; wingF = 12 + 14 * k;
        tailRot = -8 * k;
        if (prep.t >= 1) launch();

      } else if (state === S.HOP && hop) {
        hop.t += dt / hop.dur;
        var t = hop.t;
        if (t >= 1) {
          x = hop.x1; y = hop.y1;
          perch = hop.target; walk = hop.targetWalk;
          tiltCardUnder(hop.target, facing * rand(3, 6));
          if (hop.steal) { grabButton(hop.target); nextHopAt = now + 600; hopsSinceSteal = 0; }
          else nextHopAt = now + rand(1400, 3000);
          land = { t: 0, dur: 0.34 };
          state = S.LAND;
          hop = null;
        } else {
          var e = t;
          x = hop.x0 + (hop.x1 - hop.x0) * e;
          y = (hop.y0 + (hop.y1 - hop.y0) * e) - Math.sin(Math.PI * e) * hop.arc;

          var air = Math.sin(Math.PI * e);      // 0..1..0
          var rising = e < 0.45;
          // estica na subida, prepara pernas pro pouso na descida
          sy = 1 + air * 0.18; sx = 1 - air * 0.11;
          lean = facing * (rising ? 14 : -8) * air;
          legB = rising ? -42 * air : 18 * air;
          legF = rising ? -30 * air : 30 * air;
          headRot = facing * 8 * air;
          headY = -1.5 * air;
          tailRot = rising ? -18 * air : 12 * air;
          // asas: abrem e batem — rápido na descida (planando)
          var flapSpeed = rising ? 70 : 45;
          var flap = Math.sin(now / flapSpeed);
          var spread = rising ? 0.75 : 1;
          wingN = -(28 + flap * 32) * spread;
          wingF = -(34 + flap * 30) * spread;
          shScale = 0.5 + (1 - air) * 0.6;
          shOp = 0.2 + (1 - air) * 0.6;
        }

      } else if (state === S.LAND) {
        land.t += dt / land.dur;
        var lk = Math.min(1, land.t);
        // mola amortecida: esmaga e volta com overshoot
        var damp = Math.exp(-5 * lk) * Math.cos(lk * Math.PI * 2.6);
        sy = 1 - 0.3 * damp;
        sx = 1 + 0.24 * damp;
        legB = 26 * damp; legF = -22 * damp;
        headY = 3 * damp; headRot = -10 * damp;
        wingN = 8 - 40 * damp; wingF = 12 - 40 * damp;
        tailRot = 16 * damp;
        if (land.t >= 1) { state = S.SIT; land = null; }

      } else {
        // ---- SIT: parado ou andando pelo poleiro ----
        if (perch) {
          var vis = isVisible(perch.getBoundingClientRect());
          var p = perchPoint(perch, walk);
          if (!p || !vis) {
            if (tiltedCard) { tiltedCard.style.rotate = '0deg'; tiltedCard = null; }
            var np = pickPerch(perch);
            if (np) requestHop(np, false);
          } else {
            var speed = 30;
            walk += walkDir * speed * dt;
            if (walk >= p.maxWalk) { walk = p.maxWalk; walkDir = -1; facing = -1; }
            else if (walk <= 0) { walk = 0; walkDir = 1; facing = 1; }
            var p2 = perchPoint(perch, walk);
            if (p2) { x = p2.x; y = p2.y; }

            if (p.maxWalk > 4) {
              walking = true;
              walkPhase += dt * 7.5;
              legB = Math.sin(walkPhase) * 26;
              legF = Math.sin(walkPhase + Math.PI) * 26;
              bobY = Math.abs(Math.sin(walkPhase)) * -1.6;      // sobe a cada passo
              lean = facing * 5;
              // head-bob de ave: cabeça avança e "espera" o corpo
              headX = facing * (Math.sin(walkPhase) * 1.8);
              headY = Math.abs(Math.cos(walkPhase)) * -0.8;
              wingN = 8 + Math.sin(walkPhase) * 5;
              wingF = 12 + Math.sin(walkPhase) * 4;
              tailRot = Math.sin(walkPhase * 2) * 7;             // balança a cauda
            } else {
              // respiração parado
              sy = 1 + Math.sin(now / 620) * 0.022;
              sx = 1 - Math.sin(now / 620) * 0.016;
              tailRot = Math.sin(now / 900) * 4;
            }
          }
        } else {
          var first = pickPerch(null);
          if (first) requestHop(first, false);
        }

        if (now >= nextHopAt && state === S.SIT) {
          var target = null, steal = false;
          if (pendingTarget) { target = pendingTarget; pendingTarget = null; }
          else if (hopsSinceSteal >= 2 && Math.random() < 0.5) {
            var btns = visibleButtons();
            if (btns.length) { target = btns[(Math.random() * btns.length) | 0]; steal = true; }
          }
          if (!target) target = pickPerch(perch);
          hopsSinceSteal++;
          if (target) { requestHop(target, steal); if (!steal && Math.random() < 0.35) speak(); }
          else nextHopAt = now + 1200;
        }
      }

      // ---- bicada (só parado/andando) ----
      if (state === S.SIT && now > nextPeckAt) {
        nextPeckAt = now + rand(2800, 6000);
        peckUntil = now + 300;
      }
      if (now < peckUntil) {
        var pk = 1 - (peckUntil - now) / 300;
        headRot += Math.sin(pk * Math.PI) * 30;
        headY += Math.sin(pk * Math.PI) * 3;
      }

      // ---- piscada ----
      if (now > blinkAt) { blinkUntil = now + 120; blinkAt = now + rand(1800, 4500); }
      var lidScale = now < blinkUntil ? 1 : 0;

      // ---- botão roubado segue pendurado abaixo do pato ----
      if (carrying) {
        var dx = (x + W / 2) - carrying.cx0;
        var dy = (y + FEET) - carrying.cy0 + 26;
        carrying.el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
        carrying.el.style.rotate = (Math.sin(now / 110) * 10).toFixed(1) + 'deg';
        if (now > carrying.until) releaseButton();
      }

      // ---- limites da viewport ----
      x = Math.max(4, Math.min(window.innerWidth - W - 4, x));
      y = Math.max(66, Math.min(window.innerHeight - H - 4, y));

      // ---- render ----
      mascot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (bodyEl) bodyEl.style.transform = 'scaleX(' + facing + ')';

      // squash/stretch + inclinação em torno dos pés (32,62 no viewBox)
      setT($all, 'translate(0,' + bobY.toFixed(2) + ') translate(32,62) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ') rotate(' + lean.toFixed(1) + ') translate(-32,-62)');
      setT($legB, 'rotate(' + legB.toFixed(1) + ',23,48)');
      setT($legF, 'rotate(' + legF.toFixed(1) + ',32,48)');
      setT($head, 'translate(' + headX.toFixed(2) + ',' + headY.toFixed(2) + ') rotate(' + headRot.toFixed(1) + ',38,31)');
      setT($wingN, 'rotate(' + wingN.toFixed(1) + ',23,33)');
      setT($wingF, 'rotate(' + wingF.toFixed(1) + ',22,33)');
      setT($tail, 'rotate(' + tailRot.toFixed(1) + ',13,38)');
      setT($eyelid, 'translate(47.5,21) scale(1,' + lidScale + ') translate(-47.5,-21)');

      if (shadow) {
        shadow.style.transform = 'translateX(-50%) scaleX(' + shScale.toFixed(2) + ')';
        shadow.style.opacity = shOp.toFixed(2);
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // hover em card/botão/título → pula pra lá
    var hoverSel = '.kw-tpl-card, .plan-card, .btn, .hero-title, .kw-gallery-title';
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest ? e.target.closest(hoverSel) : null;
      if (!el) return;
      var inside = el.matches('.btn, .hero-title, .kw-gallery-title')
        ? el : (el.querySelector('.kw-tpl-name, .plan-price, .kw-tpl-badge') || el);
      if (isVisible(rectOf(inside)) && perch !== inside && state === S.SIT && !carrying) {
        pendingTarget = inside;
        nextHopAt = performance.now();
      }
    });

    // click em botão → pulinho no lugar + fala
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn') : null;
      if (!btn) return;
      speak('CLICA JÁ! 🚀');
      if (state === S.SIT && perch && !carrying) {
        hop = { x0: x, y0: y, x1: x, y1: y, arc: 58, dur: 0.42, t: 0, target: perch, targetWalk: walk, steal: false };
        state = S.HOP;
      }
    });

    window.addEventListener('resize', function () {
      x = Math.min(x, window.innerWidth - W - 4);
      y = Math.min(y, window.innerHeight - H - 4);
    });
  }
})();
