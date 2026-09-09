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

// Accordion toggle (Regulament page)
(function () {
  var headers = document.querySelectorAll('.accordion-header');
  if (!headers.length) return;
  headers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.accordion-item');
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
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
    '.premii-table-wrapper', '.trail-map', '.stats-card',
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

// Interactive GPX trail maps (Leaflet) — traseu page
(function () {
  var mapEls = document.querySelectorAll('.trail-map[data-gpx]');
  if (!mapEls.length || typeof L === 'undefined') return;

  mapEls.forEach(function (el) {
    var gpxUrl = el.getAttribute('data-gpx');
    var color = el.getAttribute('data-color') || '#F4A000';

    var map = L.map(el, { scrollWheelZoom: false }).setView([45.4091146, 22.1965201], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Scroll-zoom only once the visitor has clicked into the map (so page
    // scrolling over it doesn't get hijacked)
    el.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
    el.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

    fetch(gpxUrl)
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var xml = new DOMParser().parseFromString(text, 'application/xml');
        var pts = Array.prototype.slice.call(xml.getElementsByTagName('trkpt')).map(function (pt) {
          return [parseFloat(pt.getAttribute('lat')), parseFloat(pt.getAttribute('lon'))];
        });
        if (!pts.length) return;

        var line = L.polyline(pts, { color: color, weight: 4, opacity: 0.9 }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [24, 24] });

        var startIcon = L.divIcon({ className: 'trail-marker trail-marker-start', html: '<i class="fa-solid fa-flag"></i>', iconSize: [30, 30] });
        var endIcon = L.divIcon({ className: 'trail-marker trail-marker-end', html: '<i class="fa-solid fa-flag-checkered"></i>', iconSize: [30, 30] });
        L.marker(pts[0], { icon: startIcon }).addTo(map);
        L.marker(pts[pts.length - 1], { icon: endIcon }).addTo(map);
      })
      .catch(function (err) { console.error('Nu s-a putut încărca traseul GPX:', gpxUrl, err); });
  });
})();
