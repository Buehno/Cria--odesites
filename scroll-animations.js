/*!
 * scroll-animations.js — 3D scroll animations + card hover effects
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero section: perspective reveal
    var hero = document.querySelector('.hero-section');
    if (hero) {
      gsap.from(hero.querySelector('.hero-content'), {
        scrollTrigger: {
          trigger: hero,
          start: 'top center',
          end: 'center center',
          scrub: 1
        },
        opacity: 0,
        x: -100,
        rotateY: 30,
        duration: 1,
        ease: 'power2.out'
      });

      gsap.from(hero.querySelector('.hero-visual'), {
        scrollTrigger: {
          trigger: hero,
          start: 'top center',
          end: 'center center',
          scrub: 1
        },
        opacity: 0,
        x: 100,
        rotateY: -30,
        duration: 1,
        ease: 'power2.out'
      });
    }

    // Gallery section: staggered card reveals
    var galleryCards = document.querySelectorAll('.kw-tpl-card');
    galleryCards.forEach(function (card, idx) {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        rotateX: 20,
        scale: 0.9,
        duration: 0.8,
        delay: idx * 0.1,
        ease: 'back.out(1.2)'
      });

      // Card parallax on scroll
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 60%',
          end: 'bottom 20%',
          scrub: 1.5
        },
        y: -40,
        rotateX: 5,
        ease: 'none'
      });

      // Card hover: 3D tilt + glow
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          scale: 1.05,
          rotateX: -5,
          rotateY: 8,
          boxShadow: '0 20px 40px rgba(255, 200, 0, 0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Plans section: flip reveal
    var planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(function (card, idx) {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 80,
        rotateY: idx % 2 === 0 ? 90 : -90,
        duration: 1,
        delay: idx * 0.15,
        ease: 'back.out(1.3)'
      });

      // Hover scale
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          scale: 1.08,
          y: -10,
          boxShadow: '0 30px 60px rgba(255, 200, 0, 0.25)',
          duration: 0.3
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          scale: 1,
          y: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });
      });
    });

    // CTA buttons: press effect
    var ctaButtons = document.querySelectorAll('.btn-gold, .btn-lg');
    ctaButtons.forEach(function (btn) {
      btn.addEventListener('mousedown', function () {
        gsap.to(btn, {
          scale: 0.92,
          duration: 0.1,
          ease: 'power2.in'
        });
      });

      btn.addEventListener('mouseup', function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.2,
          ease: 'back.out(1.5)'
        });
      });

      btn.addEventListener('mouseenter', function () {
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.3
        });
      });

      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, {
          scale: 1,
          duration: 0.3
        });
      });
    });

    // Section titles: fade + slide
    var sectionTitles = document.querySelectorAll('.kw-gallery-title, .plans-title, .trust-subtitle');
    sectionTitles.forEach(function (title) {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    // Navbar scroll effect
    var navbar = document.querySelector('.navbar');
    gsap.to(navbar, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top 0',
        end: 'top 50px',
        scrub: 0.5,
        onUpdate: function (self) {
          if (self.progress > 0.1) {
            gsap.to(navbar, {
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              duration: 0.3,
              overwrite: 'auto'
            });
          } else {
            gsap.to(navbar, {
              boxShadow: 'none',
              backdropFilter: 'blur(0px)',
              duration: 0.3,
              overwrite: 'auto'
            });
          }
        }
      }
    });
  }
})();
