/* Transitional article routing bridge. No analytics, network calls or data storage.
 * The source-level routing is tracked in the approved PR and should replace this
 * compatibility bridge once production source parity is restored.
 */
(() => {
  "use strict";
  const lesson = "/resources/chatgpt-skills-how-to.html";
  const slug = "chatgpt-skills-how-to";
  if (new URLSearchParams(window.location.search).get("article") === slug) {
    window.location.replace(lesson);
    return;
  }
  document.addEventListener("click", event => {
    const target = event.target;
    const card = target && target.closest ? target.closest("button") : null;
    const title = card && card.querySelector ? card.querySelector("h3") : null;
    if (title && title.textContent.trim() === "How to Create, Install, Use and Edit ChatGPT Skills") {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(lesson);
    }
  }, true);
})();
