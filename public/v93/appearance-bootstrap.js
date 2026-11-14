(function () {
  "use strict";
  var preference = "auto";
  try {
    var saved = localStorage.getItem("v79-web-appearance-v1");
    if (["auto", "light", "dark"].indexOf(saved) !== -1) preference = saved;
  } catch (_) {}
  var hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/St_Lucia", hour: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date()).find(function (part) { return part.type === "hour"; }).value);
  var effective = preference === "auto" ? (hour >= 6 && hour < 18 ? "light" : "dark") : preference;
  var root = document.documentElement;
  root.classList.toggle("dark", effective === "dark");
  root.classList.toggle("light", effective === "light");
  root.dataset.theme = effective;
  root.dataset.themePreference = preference;
  root.style.colorScheme = effective;
})();
