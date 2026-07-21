/*!
 * mascot.js — Monstrinho INTERATIVO: segue mouse, reage, brinca, segura no form
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
    var mascotBody = mascot.querySelector('.mascot-body');
    var mascotHead = mascot.querySelector('.mascot-head');
    var mascotPointer = mascot.querySelector('.mascot-pointer');
    var mascotArmLeft = mascot.querySelector('.mascot-arm-left');
    var mascotArmRight = mascot.querySelector('.mascot-arm-right');

    var mouseX = 0, mouseY = 0;
    var mascotX = 40, mascotY = window.innerHeight / 2;
    var isChasing = false;
    var isFleeing = false;
    var lastMascotY = mascotY;

    // Real-time mouse tracking
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Mascote segue mouse com delay
      var dist = Math.sqrt(Math.pow(mouseX - mascotX, 2) + Math.pow(mouseY - mascotY, 2));

      // Se mouse muito perto (<150px), mascote foge
      if (dist < 150) {
        mascotFlee(e);
      } else {
        mascotChase(e);
      }

      // Mascote olha para o mouse
      mascotLookAtMouse(e);
    });

    function mascotChase(e) {
      var angle = Math.atan2(e.clientY - mascotY, e.clientX - mascotX);
      var targetX = mascotX + Math.cos(angle) * 3;
      var targetY = mascotY + Math.sin(angle) * 2;

      gsap.to(mascot, {
        left: targetX,
        top: targetY,
        duration: 0.5,
        overwrite: 'auto'
      });

      mascotX = targetX;
      mascotY = targetY;
      isChasing = true;
      isFleeing = false;
    }

    function mascotFlee(e) {
      // Mascote foge para longe
      var angle = Math.atan2(e.clientY - mascotY, e.clientX - mascotX);
      var fleeX = mascotX - Math.cos(angle) * 60;
      var fleeY = mascotY - Math.sin(angle) * 60;

      // Limita aos limites da tela
      fleeX = Math.max(20, Math.min(window.innerWidth - 100, fleeX));
      fleeY = Math.max(100, Math.min(window.innerHeight - 100, fleeY));

      gsap.to(mascot, {
        left: fleeX,
        top: fleeY,
        duration: 0.3,
        ease: 'back.out',
        overwrite: 'auto'
      });

      mascotX = fleeX;
      mascotY = fleeY;
      isFleeing = true;
      isChasing = false;

      // Mascote salta assustado
      gsap.to(mascotBody, {
        scaleY: 0.8,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }

    function mascotLookAtMouse(e) {
      var mascotRect = mascot.getBoundingClientRect();
      var mascotCenterX = mascotRect.left + mascotRect.width / 2;
      var mascotCenterY = mascotRect.top + mascotRect.height / 2;

      var angle = Math.atan2(e.clientY - mascotCenterY, e.clientX - mascotCenterX);
      gsap.to(mascotHead, {
        rotateZ: angle * (180 / Math.PI),
        duration: 0.2,
        overwrite: 'auto'
      });
    }

    // Scroll tracking
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: function (self) {
        var scrollPercent = self.progress;
        var scrollMax = document.documentElement.scrollHeight - window.innerHeight;
        var targetScrollY = scrollPercent * scrollMax;

        gsap.to(mascot, {
          top: window.innerHeight / 2 + targetScrollY,
          duration: 0,
          overwrite: 'auto'
        });

        mascotY = window.innerHeight / 2 + targetScrollY;
      }
    });

    // Idle animations (floating + arm swinging)
    gsap.to(mascotHead, {
      y: '+=8',
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Arm animations - alcançando para o mouse
    gsap.to(mascotArmLeft, {
      rotateZ: 60,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    gsap.to(mascotArmRight, {
      rotateZ: -60,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: 0.3
    });

    // Mascote aponta para seções importantes
    var pointTargets = [
      '.hero-title',
      '.kw-gallery-title',
      '.kw-tpl-card',
      '.plans-grid',
      '.wizard-section'
    ];

    pointTargets.forEach(function (selector) {
      var el = document.querySelector(selector);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: function () {
          gsap.to(mascotPointer, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'back.out'
          });
        },
        onLeave: function () {
          gsap.to(mascotPointer, {
            opacity: 0,
            scale: 0,
            duration: 0.3
          });
        }
      });
    });

    // FORM: Mascote segura o mouse e não deixa sair
    var wizardForm = document.querySelector('.wizard-section');
    if (wizardForm) {
      ScrollTrigger.create({
        trigger: wizardForm,
        start: 'top center',
        onEnter: function () {
          // Mascote fica GRANDE e segura mouse
          gsap.to(mascot, {
            scale: 1.4,
            left: '50%',
            xPercent: -50,
            duration: 0.6,
            ease: 'back.out'
          });

          gsap.to(mascotHead, {
            rotation: 360,
            duration: 0.8,
            ease: 'power1.inOut'
          });

          // Mascote "abraça" o mouse
          mascotGrabsMouse();
        }
      });
    }

    function mascotGrabsMouse() {
      // Mascote tenta seguir o mouse no form
      var grabbing = setInterval(function () {
        if (!wizardForm.classList.contains('active-step')) return;

        var distToMouse = Math.sqrt(
          Math.pow(mouseX - mascotX, 2) +
          Math.pow(mouseY - mascotY, 2)
        );

        if (distToMouse > 400) {
          gsap.to(mascot, {
            left: mouseX - 40,
            top: mouseY - 40,
            duration: 0.4,
            overwrite: 'auto'
          });

          // Braços tentam abraçar
          gsap.to(mascotArmLeft, {
            rotateZ: -45,
            duration: 0.3
          });
          gsap.to(mascotArmRight, {
            rotateZ: 45,
            duration: 0.3
          });
        }
      }, 300);
    }

    // Mouse hover em buttons = mascote reage
    document.addEventListener('mouseover', function (e) {
      if (e.target.classList.contains('btn') || e.target.classList.contains('btn-gold')) {
        gsap.to(mascotHead, {
          scale: 1.2,
          duration: 0.2
        });
        gsap.to(mascotPointer, {
          opacity: 0.8,
          scale: 0.8,
          duration: 0.2
        });
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.classList.contains('btn') || e.target.classList.contains('btn-gold')) {
        gsap.to(mascotHead, {
          scale: 1,
          duration: 0.2
        });
      }
    });

    // Click = mascote comemora
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn') || e.target.classList.contains('btn-gold')) {
        gsap.to(mascotBody, {
          rotation: 360,
          scale: 1.3,
          duration: 0.4,
          ease: 'back.out',
          onComplete: function () {
            gsap.to(mascotBody, {
              rotation: 0,
              scale: 1,
              duration: 0.3
            });
          }
        });
      }
    });
  }
})();
