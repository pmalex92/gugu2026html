// Gugulan MTB - shared site behavior (navbar, mobile menu, countdown, motion)

// Navbar scroll state
(function () {
  var nav = document.getElementById('main-nav');
  if (!nav) return;
  function onScroll() {
    if (window.scrollY < 50) nav.classList.remove('scrolled');
    else nav.classList.add('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Mobile menu toggle
(function () {
  var btn = document.getElementById('hamburger-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
})();

// Countdown live — 12 Septembrie 2026, ora 09:00 EEST (only runs on pages with #countdown)
(function () {
  var eventDate = new Date('2026-09-12T09:00:00+03:00').getTime();
  var dEl = document.getElementById('cd-days');
  var hEl = document.getElementById('cd-hours');
  var mEl = document.getElementById('cd-mins');
  var sEl = document.getElementById('cd-secs');
  if (!dEl) return;

  function pulse(el) {
    if (!el) return;
    el.classList.remove('tick');
    void el.offsetWidth; // restart animation
    el.classList.add('tick');
  }

  function tick() {
    var now = new Date().getTime();
    var diff = Math.max(0, eventDate - now);
    dEl.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
    hEl.textContent = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    mEl.textContent = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    sEl.textContent = Math.floor((diff % (1000 * 60)) / 1000);
    pulse(sEl);
  }
  tick();
  setInterval(tick, 1000);
})();

// Scroll progress bar (energy meter for how far down the page you are)
(function () {
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  function update() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// Scroll-reveal micro-animation (progressive enhancement — elements are fully
// visible if this script or IntersectionObserver is unavailable)
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var selectors = [
    '.track-card', '.promo-card', '.program-item', '.inscriere-card',
    '.benefit-item', '.faq-item', '.partner-card', '.sponsor-logo',
    '.premii-table-wrapper', '.traseu-image img', '.stats-card',
    '.control-point'
  ];
  var els = document.querySelectorAll(selectors.join(','));
  if (!els.length) return;

  els.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 5) * 0.08) + 's';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
