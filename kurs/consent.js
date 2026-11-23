/* Съгласие за бисквитки (виж /poveritelnost/#biskvitki).

   Защо е така: в ЕС рекламният код (Meta Pixel) може да се зареди САМО след
   „Приемам“. Затова пикселът не стои в страниците — този файл го зарежда, и то
   чак след съгласие. „Само необходимите“ е бутон със същата тежест като
   „Приемам“ (законът не позволява отказът да е скрит или по-труден).

   Банерът се показва само когато има какво да се приеме: докато PIXEL_ID е
   празен, на сайта няма рекламни бисквитки и не питаме за тях. За преглед на
   банера преди това: добави ?cookies към адреса. */
(function () {
  var PIXEL_ID = '1354427722794407'; // „Brows Simona Пиксел на Facebook“ в бизнеса на Симона
  var KEY = 'cookieConsent';
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // питаме отново след ~6 месеца
  var preview = /[?&]cookies\b/.test(location.search);

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && Date.now() - v.at < MAX_AGE) return v;
    } catch (e) {}
    return null;
  }
  function save(marketing) {
    try { localStorage.setItem(KEY, JSON.stringify({ marketing: marketing, at: Date.now() })); } catch (e) {}
  }

  // Meta Pixel — стандартният код на Meta, извикан едва след съгласие.
  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded || !PIXEL_ID) return;
    pixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    flush();
  }

  // Страниците слагат събитията си в опашка window._stq (виж track() в тях) —
  // често преди този файл да е зареден. Изпращат се само след съгласие;
  // без съгласие опашката просто остава неизпратена.
  function flush() {
    if (!pixelLoaded || !window.fbq) return;
    var q = window._stq || [];
    while (q.length) { var e = q.shift(); window.fbq('track', e[0], e[1] || {}); }
  }
  window.siteTrackFlush = flush;

  var banner;
  function close() { if (banner) { banner.classList.remove('is-on'); setTimeout(function () { banner.hidden = true; }, 400); } }
  function choose(marketing) {
    save(marketing);
    close();
    if (marketing) loadPixel();
    // отказ след приемане: бисквитките на Meta остават до презареждане — презареждаме
    else if (pixelLoaded) location.reload();
  }
  function show() {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Бисквитки');
      banner.innerHTML =
        '<p class="consent__text">Сайтът ползва бисквитки за реклами в Instagram и Facebook — само ако ги приемеш. ' +
        'Необходимите за работата на сайта са винаги включени. <a href="/poveritelnost/#biskvitki">Научи повече</a></p>' +
        '<div class="consent__btns">' +
        '<button type="button" class="btn btn--line" data-c="0">Само необходимите</button>' +
        '<button type="button" class="btn btn--dark" data-c="1">Приемам</button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-c]');
        if (b) choose(b.getAttribute('data-c') === '1');
      });
      document.body.appendChild(banner);
    }
    banner.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { banner.classList.add('is-on'); }); });
  }

  function init() {
    var active = !!PIXEL_ID || preview;
    // „Промени избора си“ (долу на страниците и в политиката) — само когато има избор
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      if (!active) { el.hidden = true; return; }
      el.hidden = false;
      el.addEventListener('click', function (e) { e.preventDefault(); show(); });
    });
    if (!active) return;
    var c = read();
    if (c && !preview) { if (c.marketing) loadPixel(); }
    else show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
