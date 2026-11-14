/* V79 Digital shared appearance controller — staging candidate only. */
(function () {
  'use strict';
  var KEY = 'v79-web-appearance-v1';
  var TZ = 'America/St_Lucia';
  var modes = ['auto', 'light', 'dark'];
  var root = document.documentElement;
  function preferred() {
    try {var v = localStorage.getItem(KEY); return modes.includes(v) ? v : 'auto';}
    catch (_) {return window.__v79MemoryTheme || 'auto';}
  }
  function saintLuciaHour(d) {
    var parts = new Intl.DateTimeFormat('en-GB', {timeZone:TZ,hour:'2-digit',hourCycle:'h23'}).formatToParts(d || new Date());
    return Number(parts.find(function (p) {return p.type === 'hour';}).value);
  }
  function themeAt(d) { var hour = saintLuciaHour(d); return (hour >= 6 && hour < 18) ? 'light' : 'dark'; }
  function apply() {
    var preference = preferred();
    var actual = preference === 'auto' ? themeAt() : preference;
    root.dataset.theme = actual;
    root.dataset.themePreference = preference;
    root.style.colorScheme = actual;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', actual === 'light' ? '#ffffff' : '#101e2b');
    document.querySelectorAll('[data-v79-theme-choice]').forEach(function (button) {
      var active = button.getAttribute('data-v79-theme-choice') === preference;
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-v79-theme-status]').forEach(function (label) {
      label.textContent = preference === 'auto'
        ? 'Auto · ' + actual + ' (Saint Lucia 06:00–18:00)'
        : 'Manual · ' + actual + ' (overrides schedule)';
    });
  }
  function set(preference) {
    if (!modes.includes(preference)) return;
    try {localStorage.setItem(KEY, preference);}catch (_) {window.__v79MemoryTheme = preference;}
    apply();
  }
  function init() {
    var target = root.dataset.v79Surface === 'admin' ? document.querySelector('.top-actions') : document.querySelector('.navbar');
    if (!target) return;
    var wrap = document.createElement('div');
    wrap.className = 'v79-appearance';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Appearance — Saint Lucia time');
    wrap.innerHTML = '<span class="v79-appearance-label">Appearance</span><div class="v79-appearance-options">'
      + '<button type="button" data-v79-theme-choice="auto" aria-pressed="false" title="Automatic Saint Lucia time: light 06:00–17:59, dark 18:00–05:59">Auto</button>'
      + '<button type="button" data-v79-theme-choice="light" aria-pressed="false" title="Keep light mode until you choose Auto or Dark">Light</button>'
      + '<button type="button" data-v79-theme-choice="dark" aria-pressed="false" title="Keep dark mode until you choose Auto or Light">Dark</button>'
      + '</div><span class="v79-sr-only" aria-live="polite" data-v79-theme-status></span>';
    if (root.dataset.v79Surface === 'admin') target.insertBefore(wrap, target.firstChild);
    else {var navCta = target.querySelector('.nav-cta'); target.insertBefore(wrap, navCta || target.lastChild);}
    wrap.addEventListener('click', function (ev) {
      var choice = ev.target.closest('[data-v79-theme-choice]');
      if (choice) set(choice.getAttribute('data-v79-theme-choice'));
    });
    apply();
    window.addEventListener('storage', function (ev) {if (ev.key === KEY) apply();});
    document.addEventListener('visibilitychange', function () {if (!document.hidden) apply();});
    window.addEventListener('focus', apply);
    // At most 30 seconds of boundary delay when page remains open.
    window.setInterval(function () {if (preferred() === 'auto') apply();}, 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  // Guarded test API: pure scheduler only; no mutating production data.
  window.V79Appearance = Object.freeze({getPreference:preferred, effectiveThemeAt: themeAt, saintLuciaHour: saintLuciaHour, setPreference:set, refresh:apply});
})();
