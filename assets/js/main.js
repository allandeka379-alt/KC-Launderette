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
})();
