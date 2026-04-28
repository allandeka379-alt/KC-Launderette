/* ==========================================================================
   KC Launderette — Site behaviour
   - Mobile menu overlay
   - Pricing tabs
   - FAQ accordions
   - WhatsApp click event tracking (per Section 10)
   ========================================================================== */
(function () {
  'use strict';

  // --- Mobile menu --------------------------------------------------------
  var hamburger = document.querySelector('[data-menu-open]');
  var menu = document.querySelector('[data-menu]');
  var menuClose = document.querySelector('[data-menu-close]');

  function toggleMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (hamburger) hamburger.setAttribute('aria-expanded', String(open));
  }

  if (hamburger) hamburger.addEventListener('click', function () { toggleMenu(true); });
  if (menuClose) menuClose.addEventListener('click', function () { toggleMenu(false); });

  if (menu) {
    var menuLinks = menu.querySelectorAll('a[href]');
    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });

  // --- Pricing tabs -------------------------------------------------------
  var tabGroups = document.querySelectorAll('[data-tabs]');
  Array.prototype.forEach.call(tabGroups, function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    var panels = document.querySelectorAll('[data-tab-panel]');

    function activate(targetId) {
      Array.prototype.forEach.call(tabs, function (t) {
        var active = t.getAttribute('aria-controls') === targetId;
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });
      Array.prototype.forEach.call(panels, function (p) {
        p.classList.toggle('is-active', p.id === targetId);
      });
    }

    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('aria-controls'));
      });
      tab.addEventListener('keydown', function (e) {
        var index = Array.prototype.indexOf.call(tabs, tab);
        var next;
        if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (e.key === 'ArrowLeft')  next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  });

  // --- FAQ accordions -----------------------------------------------------
  var faqQuestions = document.querySelectorAll('.faq__q');
  Array.prototype.forEach.call(faqQuestions, function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      if (!item) return;
      var isOpen = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // --- WhatsApp click tracking (analytics event hook) --------------------
  // Per Section 10: each WhatsApp click should fire an event with source page
  // and CTA label. This ships a simple console log; replace with a Plausible
  // or Fathom event call when analytics is wired in.
  var waLinks = document.querySelectorAll('a[href*="wa.me"]');
  Array.prototype.forEach.call(waLinks, function (link) {
    link.addEventListener('click', function () {
      var source = link.getAttribute('data-source') || document.title;
      var label  = link.getAttribute('data-label')  || (link.textContent || '').trim();
      if (window.plausible) window.plausible('WhatsApp click', { props: { source: source, label: label } });
      // Generic fallback for inspection during development:
      try { console.log('[wa]', { source: source, label: label }); } catch (e) {}
    });
  });

  // --- Year in footer -----------------------------------------------------
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Hero carousel ------------------------------------------------------
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var carousels = document.querySelectorAll('[data-carousel]');
  Array.prototype.forEach.call(carousels, function (root) {
    var track = root.querySelector('[data-carousel-track]');
    var slides = root.querySelectorAll('[data-carousel-slide]');
    var dotsWrap = root.querySelector('[data-carousel-dots]');
    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var captionEl = root.querySelector('[data-carousel-caption]');
    var creditEl  = root.querySelector('[data-carousel-credit]');
    if (!track || slides.length === 0) return;

    var index = 0;
    var total = slides.length;
    var autoplayMs = parseInt(root.getAttribute('data-autoplay') || '5500', 10);
    var timer = null;

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        (function (idx) {
          b.addEventListener('click', function () { goTo(idx, true); });
        })(i);
        dotsWrap.appendChild(b);
      }
    }

    function update() {
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('.carousel__dot');
        Array.prototype.forEach.call(dots, function (d, di) {
          d.setAttribute('aria-selected', di === index ? 'true' : 'false');
        });
      }
      Array.prototype.forEach.call(slides, function (s, si) {
        s.setAttribute('aria-hidden', si === index ? 'false' : 'true');
      });
      var slide = slides[index];
      if (captionEl) captionEl.textContent = slide.getAttribute('data-caption') || '';
      if (creditEl) {
        var credit = slide.getAttribute('data-credit');
        var creditUrl = slide.getAttribute('data-credit-url');
        creditEl.textContent = credit ? 'Photo · ' + credit : '';
        if (creditUrl) creditEl.setAttribute('href', creditUrl);
        creditEl.style.display = credit ? '' : 'none';
      }
    }

    function goTo(i, userInitiated) {
      index = (i + total) % total;
      update();
      if (userInitiated) restartAutoplay();
    }
    function next(userInitiated) { goTo(index + 1, userInitiated); }
    function prev(userInitiated) { goTo(index - 1, userInitiated); }

    function startAutoplay() {
      if (prefersReducedMotion || autoplayMs <= 0) return;
      stopAutoplay();
      timer = window.setInterval(function () { next(false); }, autoplayMs);
    }
    function stopAutoplay() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(true); });

    // Pause on hover / focus
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);

    // Pause when tab not visible
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });

    // Keyboard navigation when carousel is focused
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(true); }
    });

    // Touch swipe
    var startX = 0, dx = 0, swiping = false;
    root.addEventListener('touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      dx = 0;
      swiping = true;
      stopAutoplay();
    }, { passive: true });
    root.addEventListener('touchmove', function (e) {
      if (!swiping || !e.touches) return;
      dx = e.touches[0].clientX - startX;
    }, { passive: true });
    root.addEventListener('touchend', function () {
      if (!swiping) return;
      swiping = false;
      var threshold = Math.max(40, root.clientWidth * 0.12);
      if (dx >  threshold) prev(true);
      else if (dx < -threshold) next(true);
      else startAutoplay();
    });

    // Initial state + autoplay
    update();
    startAutoplay();
  });
})();
