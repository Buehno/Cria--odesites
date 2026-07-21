/*!
 * mascot.js — Monstrinho INTERATIVO: segue mouse com lerp, foge, aponta, segura no form
 * Loop rAF único controla posição via transform (sem GSAP brigando pelo top/left).
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMascot, { once: true });
  } else {
    initMascot();
  }

  function initMascot() {
    var mascot = document.getElementById('mascot');
    if (!mascot) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    var mascotBody = mascot.querySelector('.mascot-body');
    var mascotHead = mascot.querySelector('.mascot-head');
    var mascotPointer = mascot.querySelector('.mascot-pointer');
    var mascotArmLeft = mascot.querySelector('.mascot-arm-left');
    var mascotArmRight = mascot.querySelector('.mascot-arm-right');

    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    // Mouse alvo
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var hasMouse = false;

    // Posição atual do mascote (canto do elemento)
    var posX = 60;
    var posY = window.innerHeight / 2;

    // Modo comportamento
    var MODE = { FOLLOW: 'follow', FLEE: 'flee', GRAB: 'grab' };
    var mode = MODE.FOLLOW;

    var OFFSET = 70;   // distância que o mascote mantém do cursor ao seguir
    var FLEE_DIST = 130; // se cursor mais perto que isso, foge
    var SIZE = 80;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;
    });

    document.addEventListener('mouseleave', function () { hasMouse = false; });

    window.addEventListener('resize', function () {
      posX = Math.min(posX, window.innerWidth - SIZE);
      posY = Math.min(posY, window.innerHeight - SIZE);
    });

    // ---- Loop principal ----
    var idleT = 0;
    function tick() {
      idleT += 0.03;

      // centro atual do mascote
      var cx = posX + SIZE / 2;
      var cy = posY + SIZE / 2;

      var dx = mouseX - cx;
      var dy = mouseY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

      var targetX = posX;
      var targetY = posY;
      var lerp = 0.08;

      if (mode === MODE.GRAB) {
        // Gruda perto do cursor
        targetX = mouseX - SIZE / 2;
        targetY = mouseY - SIZE / 2;
        lerp = 0.25;
      } else if (hasMouse && dist < FLEE_DIST) {
        // Foge: move no sentido oposto ao cursor
        mode = MODE.FLEE;
        var fx = cx - (dx / dist) * (FLEE_DIST + 40);
        var fy = cy - (dy / dist) * (FLEE_DIST + 40);
        targetX = fx - SIZE / 2;
        targetY = fy - SIZE / 2;
        lerp = 0.18;
      } else if (hasMouse) {
        // Segue mantendo distância OFFSET do cursor
        mode = MODE.FOLLOW;
        var stopAt = OFFSET;
        var followX = mouseX - (dx / dist) * stopAt;
        var followY = mouseY - (dy / dist) * stopAt;
        targetX = followX - SIZE / 2;
        targetY = followY - SIZE / 2;
        lerp = 0.06;
      }

      // Clamp na tela
      targetX = Math.max(8, Math.min(window.innerWidth - SIZE - 8, targetX));
      targetY = Math.max(80, Math.min(window.innerHeight - SIZE - 8, targetY));

      posX += (targetX - posX) * lerp;
      posY += (targetY - posY) * lerp;

      // Flutuação idle vertical
      var floatY = reduced ? 0 : Math.sin(idleT) * 6;

      // Squash quando fugindo
      var scaleY = mode === MODE.FLEE ? 0.85 : 1;
      var scale = mode === MODE.GRAB ? 1.35 : 1;

      mascot.style.transform =
        'translate3d(' + posX.toFixed(1) + 'px,' + (posY + floatY).toFixed(1) + 'px,0) scale(' + scale + ')';

      // Cabeça olha pro cursor (inclina)
      if (mascotHead) {
        var lookAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        // limita inclinação pra não virar de cabeça pra baixo
        var tilt = Math.max(-25, Math.min(25, lookAngle * 0.25));
        mascotHead.style.transform = 'rotate(' + tilt.toFixed(1) + 'deg) scaleY(' + scaleY + ')';
      }

      // Braços "alcançam" o cursor
      if (mascotArmLeft && mascotArmRight) {
        var reach = mode === MODE.GRAB ? 50 : (mode === MODE.FLEE ? -40 : 25 + Math.sin(idleT * 2) * 15);
        mascotArmLeft.style.transform = 'rotate(' + reach.toFixed(1) + 'deg)';
        mascotArmRight.style.transform = 'rotate(' + (-reach).toFixed(1) + 'deg)';
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // ---- Ponteiro aponta seções importantes (via scroll) ----
    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      var pointTargets = ['.hero-title', '.kw-gallery-title', '.plans-grid', '.wizard-section', '.contact-section'];
      pointTargets.forEach(function (selector) {
        var el = document.querySelector(selector);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'bottom 30%',
          onToggle: function (self) {
            if (mascotPointer) {
              mascotPointer.style.opacity = self.isActive ? '1' : '0';
              mascotPointer.style.transform = 'translateX(-50%) scale(' + (self.isActive ? 1 : 0) + ')';
            }
          }
        });
      });

      // ---- No form: mascote entra em modo GRAB ----
      var wizardForm = document.querySelector('.wizard-section');
      if (wizardForm) {
        ScrollTrigger.create({
          trigger: wizardForm,
          start: 'top center',
          end: 'bottom center',
          onToggle: function (self) {
            mode = self.isActive ? MODE.GRAB : MODE.FOLLOW;
          }
        });
      }
    } else {
      // Fallback sem GSAP: ativa GRAB perto do form via scroll nativo
      var wf = document.querySelector('.wizard-section');
      if (wf) {
        window.addEventListener('scroll', function () {
          var r = wf.getBoundingClientRect();
          var inView = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
          mode = inView ? MODE.GRAB : MODE.FOLLOW;
        }, { passive: true });
      }
    }

    // ---- Reações a hover/click em botões ----
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('.btn')) {
        if (mascotPointer) {
          mascotPointer.style.opacity = '1';
          mascotPointer.style.transform = 'translateX(-50%) scale(1)';
        }
        if (mascotHead) mascotHead.style.fontSize = '68px';
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest('.btn')) {
        if (mascotHead) mascotHead.style.fontSize = '';
      }
    });

    // Click comemora (bounce)
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.btn')) {
        if (!mascotBody) return;
        var start = performance.now();
        function celebrate(now) {
          var t = (now - start) / 500;
          if (t >= 1) { mascotBody.style.transform = ''; return; }
          var rot = t * 360;
          var sc = 1 + Math.sin(t * Math.PI) * 0.3;
          mascotBody.style.transform = 'rotate(' + rot + 'deg) scale(' + sc + ')';
          requestAnimationFrame(celebrate);
        }
        requestAnimationFrame(celebrate);
      }
    });
  }
})();
