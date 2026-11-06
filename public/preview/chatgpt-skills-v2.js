"use strict";
/* V79 Interactive Learning Post v0.1.0. Educational interactions only; no network calls. */
(() => {
  const $ = (id) => document.getElementById(id);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const copiedStatus = (element, message) => { if (element) element.textContent = message; };
  async function copy(value, status, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const result = document.execCommand("copy");
        el.remove();
        if (!result) throw new Error("Manual copy needed");
      }
      copiedStatus(status, label + " copied. Paste it into ChatGPT when ready.");
      return true;
    } catch {
      copiedStatus(status, "Copy was not available. Please select the text and copy it manually.");
      return false;
    }
  }

  /* Clickable walkthrough: all six written steps stay readable at all times. */
  const stepMessages = [
    "Step 1: Open chatgpt.com and sign in.",
    "Step 2: Open Plugins from the sidebar.",
    "Step 3: Select the Skills tab.",
    "Step 4: Choose Create, then Create with chat.",
    "Step 5: Review the generated instructions and select Install.",
    "Step 6: Start a conversation and test your Skill."
  ];
  const markers = all("[data-instruction]");
  const highlights = [$("fakePlugin"), $("fakeSkill"), $("fakeCreate")];
  function chooseStep(index) {
    markers.forEach((item, i) => {
      const btn = item.querySelector("button");
      const active = i === index;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    copiedStatus($("mockCallout"), stepMessages[index]);
    highlights.forEach((node) => node.classList.remove("mock-highlight"));
    const highlight = index === 1 ? highlights[0] : index === 2 ? highlights[1] : index === 3 ? highlights[2] : null;
    if (highlight) highlight.classList.add("mock-highlight");
  }
  markers.forEach((item, index) => item.querySelector("button").addEventListener("click", () => chooseStep(index)));
  chooseStep(0);

  /* Prompt lab — all values rendered as text only, never HTML. */
  const fields = ["skillName", "skillAudience", "skillTone", "skillTask"].map($);
  const toneNames = { friendly: "friendly and encouraging", professional: "professional and clear", simple: "patient and very simple" };
  function refreshPrompt() {
    const [name, audience, tone, task] = fields.map((el) => (el.value || "").trim());
    const safeName = name || "My Helpful Skill";
    const safeAudience = audience || "a beginner";
    const safeTask = task || "help people learn practical topics";
    const safeTone = toneNames[tone] || toneNames.friendly;
    $("skillOutput").textContent =
      "Create a Skill called " + safeName + ".\n\n" +
      "Its job is to " + safeTask + " for " + safeAudience + ".\n\n" +
      "Follow these rules:\n" +
      "1. Use clear, simple English.\n" +
      "2. Give a useful everyday example.\n" +
      "3. Break harder ideas into short steps.\n" +
      "4. Ask three practice questions.\n" +
      "5. Explain mistakes kindly.\n" +
      "6. End with a short summary.\n" +
      "7. Never invent facts.\n\n" +
      "Use a " + safeTone + " tone.";
    copiedStatus($("copyStatus"), "");
  }
  fields.forEach((el) => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", refreshPrompt));
  refreshPrompt();
  $("copySkill").addEventListener("click", async () => {
    await copy($("skillOutput").textContent, $("copyStatus"), "Your Skill prompt");
  });

  /* Installation tabs: accessible mouse, touch and arrow-key interaction. */
  const tabs = all('#installTabs [role="tab"]');
  const panels = all('.tab-panels [role="tabpanel"]');
  function activateTab(tab, focus = false) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (ev) => {
      let to = null;
      if (ev.key === "ArrowRight") to = (i + 1) % tabs.length;
      if (ev.key === "ArrowLeft") to = (i - 1 + tabs.length) % tabs.length;
      if (ev.key === "Home") to = 0;
      if (ev.key === "End") to = tabs.length - 1;
      if (to !== null) { ev.preventDefault(); activateTab(tabs[to], true); }
    });
  });
  activateTab(tabs[0]);

  /* Choose a useful, copyable learning exercise. */
  const questions = {
    science: "@Study Buddy Explain photosynthesis like I'm 14. Give an everyday example and ask me three questions.",
    maths: "@Study Buddy Show me how percentages work using a shopping discount, then ask three questions.",
    history: "@Study Buddy Explain why the Industrial Revolution mattered. Use simple English and ask three questions."
  };
  all("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      all("[data-scenario]").forEach((b) => {
        const selected = b === button;
        b.setAttribute("aria-pressed", String(selected));
        b.classList.toggle("active", selected);
      });
      $("practiceMessage").textContent = questions[button.dataset.scenario] || questions.science;
      copiedStatus($("practiceStatus"), "");
    });
  });
  $("copyPractice").addEventListener("click", async () => {
    await copy($("practiceMessage").textContent, $("practiceStatus"), "Practice message");
  });

  /* Before and after is a demonstration, not a claim about real model output. */
  function improve(after) {
    $("beforeButton").classList.toggle("active", !after);
    $("afterButton").classList.toggle("active", after);
    $("beforeButton").setAttribute("aria-pressed", String(!after));
    $("afterButton").setAttribute("aria-pressed", String(after));
    $("improveTag").textContent = after ? "SPECIFIC RULE" : "VAGUE RULE";
    $("improveText").textContent = after ? "“Use fewer than 150 words unless I ask for more.”" : "“Keep answers short.”";
    $("improveExplain").textContent = after
      ? "Now ChatGPT has a clear limit, so you can test whether it follows it."
      : "How short? The instruction leaves room for guessing.";
  }
  $("beforeButton").addEventListener("click", () => improve(false));
  $("afterButton").addEventListener("click", () => improve(true));

  /* Progress checklist: no data is saved or uploaded. */
  const checks = all(".task-check");
  function checkProgress() {
    const count = checks.filter((item) => item.checked).length;
    $("progressText").textContent = count + " of " + checks.length + " done";
    $("progressFill").style.width = (100 * count / checks.length) + "%";
  }
  checks.forEach((item) => item.addEventListener("change", checkProgress));
  $("resetTasks").addEventListener("click", () => {
    checks.forEach((item) => { item.checked = false; });
    checkProgress();
  });
  checkProgress();

  /* Mini quiz, with specific explanations and no score gate. */
  const answers = { q1: "b", q2: "a", q3: "c", q4: "b" };
  const help = {
    q1: "A Skill is a set of reusable instructions, not a new AI model.",
    q2: "Create with chat lets you write instructions in ordinary English.",
    q3: "Improve the unclear rule and repeat the same test.",
    q4: "Read shared Skill instructions and check the source and permissions first."
  };
  const quiz = $("quiz");
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quiz);
    const missing = Object.keys(answers).filter((key) => !data.get(key));
    const output = $("quizResult");
    if (missing.length) {
      output.classList.add("error");
      output.textContent = "Please answer all four questions before checking.";
      return;
    }
    const incorrect = Object.keys(answers).filter((key) => data.get(key) !== answers[key]);
    output.classList.remove("error");
    if (!incorrect.length) {
      output.textContent = "4/4 — Great work! You now understand how to create, install, use and improve a Skill.";
    } else {
      const score = Object.keys(answers).length - incorrect.length;
      output.textContent = score + "/4 correct. Review these: " + incorrect.map((key) => help[key]).join(" ");
    }
  });
  quiz.addEventListener("reset", () => {
    $("quizResult").textContent = "";
    $("quizResult").classList.remove("error");
  });

  /* Optional sharing, placed after all article content. */
  const isPreview = Boolean(document.querySelector('meta[name="robots"][content*="noindex"]'));
  const liveUrl = isPreview
    ? (location.origin + location.pathname)
    : "https://v79sl.com/?article=chatgpt-skills-how-to";
  $("shareLink").addEventListener("click", async () => {
    await copy(liveUrl, $("shareStatus"), "Article link");
  });
  $("nativeShare").addEventListener("click", async () => {
    const data = { title: "Build your first ChatGPT Skill — V79 Digital", text: "An interactive beginner's tutorial you can read for free.", url: liveUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
        copiedStatus($("shareStatus"), "Shared using your device.");
      } catch (err) {
        if (err && err.name !== "AbortError") copiedStatus($("shareStatus"), "Sharing was unavailable. You can copy the link instead.");
      }
    } else {
      await copy(liveUrl, $("shareStatus"), "Article link");
    }
  });
})();