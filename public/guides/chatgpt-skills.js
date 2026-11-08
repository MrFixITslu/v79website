"use strict";
(() => {
  const byId = (id) => document.getElementById(id);
  const total = 6;
  let current = 0;
  const steps = [...document.querySelectorAll(".step")];
  const dots = [...document.querySelectorAll("[data-go]")];
  if(steps.length === total) document.documentElement.classList.add("js-enabled");
  function showStep(n) {
    current = Math.max(0, Math.min(total - 1, n));
    steps.forEach((el, i) => el.classList.toggle("active", i === current));
    dots.forEach((el, i) => {
      el.classList.toggle("active", i === current);
      el.classList.toggle("visited", i < current);
      if (i === current) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
    });
    byId("stepCounter").textContent = "Step " + (current + 1) + " of " + total;
    byId("progressBar").style.width = ((current + 1) / total * 100) + "%";
    byId("progress").setAttribute("aria-valuenow", String(current + 1));
    byId("prevStep").disabled = current === 0;
    byId("nextStep").textContent = current === total - 1 ? "Start again ↻" : "Next step →";
  }
  dots.forEach((el) => el.addEventListener("click", () => showStep(Number(el.dataset.go))));
  byId("prevStep").addEventListener("click", () => showStep(current - 1));
  byId("nextStep").addEventListener("click", () => {
    if (current === total - 1) showStep(0); else showStep(current + 1);
  });
  showStep(0);
  async function copyText(text, control, label) {
    const original = control.textContent;
    try {
      if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea");
        area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        if (!document.execCommand("copy")) throw new Error("Copy unavailable");
        area.remove();
      }
      control.textContent = label;
    } catch {
      control.textContent = "Select & copy manually";
    }
    window.setTimeout(() => control.textContent = original, 2400);
  }
  byId("copyPrompt").addEventListener("click", (ev) => copyText(byId("promptText").textContent, ev.currentTarget, "Copied ✓"));
  const share = (ev) => {
    const url = "https://v79sl.com/guides/chatgpt-skills.html";
    if(navigator.share) {
      navigator.share({title:"Build your first ChatGPT Skill — V79 Digital",text:"Free interactive guide with steps, example and quiz.",url}).catch(() => {});
    } else copyText(url, ev.currentTarget, "Link copied ✓");
  };
  byId("shareTop").addEventListener("click", share);
  byId("shareBottom").addEventListener("click", share);
  const checks = [...document.querySelectorAll(".skill-check")];
  function updateChecks() {
    const done = checks.filter((el) => el.checked).length;
    byId("checkCount").textContent = done + " of 4 complete";
    byId("checkBar").style.width = (done / 4 * 100) + "%";
    byId("checkMessage").textContent = done === 4 ? "Excellent! Your skill has passed the checklist." : "Keep going — you've got this.";
  }
  checks.forEach((el) => el.addEventListener("change", updateChecks));
  byId("resetChecks").addEventListener("click", () => { checks.forEach((el) => el.checked = false); updateChecks(); });
  updateChecks();
  // Switch install methods without hiding the content when JavaScript is disabled.
  const methodTabs = [...document.querySelectorAll("[data-method]")];
  const methodPanels = [...document.querySelectorAll("[data-panel]")];
  methodTabs.forEach((tab) => tab.addEventListener("click", () => {
    const selected = tab.dataset.method;
    methodTabs.forEach((el) => {
      const active = el === tab;
      el.classList.toggle("active", active);
      el.setAttribute("aria-pressed", String(active));
    });
    methodPanels.forEach((el) => el.classList.toggle("active", el.dataset.panel === selected));
  }));
  byId("copyUseExample").addEventListener("click", (ev) => copyText(byId("useExample").textContent.trim(), ev.currentTarget, "Copied ✓"));
  const quiz = byId("quizForm");
  quiz.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(quiz);
    const answers = ["q1","q2","q3","q4"].map((q) => data.get(q));
    const result = byId("quizResult");
    if (answers.some((x) => !x)) {
      result.className = "quiz-result error";
      result.textContent = "Choose an answer for all four questions first.";
      return;
    }
    const score = Number(answers[0]==="b") + Number(answers[1]==="a") + Number(answers[2]==="c") + Number(answers[3]==="b");
    result.className = "quiz-result " + (score===4?"success":"");
    result.textContent = score===4 ? "4/4 — Brilliant! You're ready to make your own skill." : score + "/4 — Nice try! Review the guide and try again.";
  });
  quiz.addEventListener("reset", () => {
    byId("quizResult").textContent = "";
    byId("quizResult").className = "quiz-result";
  });
})();
