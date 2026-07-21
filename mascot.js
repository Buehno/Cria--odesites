/*!
 * mascot.js — Monstrinho que anda pelo site, se pendura, aponta e segura mouse
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMascot, { once: true });
  } else {
    initMascot();
  }

  function initMascot() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    var mascot = document.getElementById('mascot');
    var mascotHead = mascot.querySelector('.mascot-head');
    var mascotPointer = mascot.querySelector('.mascot-pointer');
    var mouseX = 0, mouseY = 0;
    var windowHeight = window.innerHeight;
    var scrollProgress = 0;

    // Mouse tracking for mascot
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Scroll tracking
    window.addEventListener('scroll', function () {
      scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - windowHeight));
    });

    // Mascot follow scroll + parallax
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: function (self) {
          var scrollPercent = self.progress;
          var mascotY = scrollPercent * (document.documentElement.scrollHeight - windowHeight);

          gsap.to(mascot, {
            y: mascotY,
            duration: 0,
            overwrite: 'auto'
          });
        }
      }
    });

    // Mascot idle animations (floating)
    gsap.to(mascot, {
      y: '+=10',
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Mascot head look at mouse
    document.addEventListener('mousemove', function (e) {
      var mascotRect = mascot.getBoundingClientRect();
      var mascotCenterX = mascotRect.left + mascotRect.width / 2;
      var mascotCenterY = mascotRect.top + mascotRect.height / 2;

      var angle = Math.atan2(e.clientY - mascotCenterY, e.clientX - mascotCenterX);
      gsap.to(mascotHead, {
        rotateZ: angle * (180 / Math.PI),
        duration: 0.3,
        overwrite: 'auto'
      });
    });

    // Arm swing animation (pointing)
    gsap.to('.mascot-arm-left', {
      rotateZ: 45,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: 0
    });

    gsap.to('.mascot-arm-right', {
      rotateZ: -45,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: 0.3
    });

    // Mascot pointer animation
    var pointTargets = [
      { selector: '.hero-title', text: '👉 Leia isso!' },
      { selector: '.kw-gallery-title', text: '👉 Veja os templates!' },
      { selector: '.kw-tpl-card', text: '👉 Escolha um modelo!' },
      { selector: '.plans-grid', text: '👉 Veja os planos!' },
      { selector: '.wizard-section', text: '👉 Configure aqui!' }
    ];

    pointTargets.forEach(function (target, idx) {
      var el = document.querySelector(target.selector);
      if (!el) return;

      gsap.to(mascotPointer, {
        scrollTrigger: {
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: function () {
            gsap.to(mascotPointer, {
              opacity: 1,
              scale: 1,
              duration: 0.4
            });
          },
          onLeave: function () {
            gsap.to(mascotPointer, {
              opacity: 0,
              scale: 0,
              duration: 0.4
            });
          }
        }
      });
    });

    // Mascot grabs mouse at form (end)
    var wizardForm = document.querySelector('.wizard-section');
    if (wizardForm) {
      ScrollTrigger.create({
        trigger: wizardForm,
        start: 'top center',
        onEnter: function () {
          // Mascot grabs mouse
          gsap.to(mascot, {
            scale: 1.2,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out'
          });

          // Freeze cursor hint
          var formInputs = wizardForm.querySelectorAll('input, textarea, button');
          formInputs.forEach(function (input) {
            input.style.cursor = 'grab';
          });
        }
      });
    }
  }
})();
