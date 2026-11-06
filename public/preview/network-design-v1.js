/* V79 Interactive Learning Post — Network Design pilot v0.1.0
 * All interactions run locally. No answers or business selections are uploaded.
 */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  const devices = {
    router: { title:"Router",symbol:"↔",detail:"Moves data between your local business network and other networks, usually including the internet.",example:"Example: an office laptop opens a website." },
    firewall: { title:"Firewall",symbol:"⬡",detail:"Applies rules about which network connections are allowed or blocked. It can be built into the router.",example:"Example: guest Wi-Fi is blocked from opening a payment terminal." },
    switch: { title:"Switch",symbol:"▤",detail:"Connects wired local devices. A managed switch can help create separate groups of network traffic.",example:"Example: staff computers and access points connect to different switch ports." },
    ap: { title:"Wireless access point",symbol:"◉",detail:"Provides Wi-Fi so phones and laptops can connect to the local network. It does not replace secure routing and firewall rules.",example:"Example: guests connect wirelessly to a separate guest network." }
  };
  all("[data-device]").forEach(button => button.addEventListener("click", () => {
    const data = devices[button.dataset.device];
    if (!data) return;
    all("[data-device]").forEach(b => { const active = b === button; b.classList.toggle("selected",active); b.setAttribute("aria-pressed",String(active)); });
    $("deviceTitle").textContent = data.title;
    $("deviceIcon").textContent = data.symbol;
    $("deviceDetail").textContent = data.detail;
    $("deviceExample").textContent = data.example;
  }));

  const simResult = $("simResult");
  $("simulateButton").addEventListener("click", () => {
    const isolated = $("segmentation").value === "protected";
    const signal = $("simSignal").parentElement;
    signal.classList.remove("blocked","open");
    signal.classList.add(isolated?"blocked":"open");
    simResult.classList.toggle("safe",isolated);
    simResult.classList.toggle("unsafe",!isolated);
    const strong = simResult.querySelector("strong");
    const explanation = simResult.querySelector("p");
    if (isolated) {
      strong.textContent = "Blocked — this is the safer result.";
      explanation.textContent = "In this example, guest traffic cannot reach the payment network. It can still reach the internet when guest access is configured correctly.";
    } else {
      strong.textContent = "Allowed — risky configuration.";
      explanation.textContent = "Without isolation rules, the guest may be able to reach sensitive devices. Configure and test guest restrictions with an authorised technician.";
    }
  });
  $("segmentation").addEventListener("change", () => {
    simResult.classList.remove("unsafe"); simResult.classList.add("safe");
    $("simSignal").parentElement.classList.remove("blocked","open");
    simResult.querySelector("strong").textContent = "Setting changed — test again.";
    simResult.querySelector("p").textContent = "Run the simulated connection attempt to see the new result.";
  });

  function cable() {
    const n = Number($("cableLength").value);
    const outdoors = $("separateBuilding").checked;
    $("lengthValue").textContent = n + " metres";
    let title,description,icon;
    if (outdoors) {
      title = "Get a professional outdoor/fibre assessment";
      description = "Separate buildings and outdoor runs need special care for lightning, earthing and environmental protection. Fibre is often a strong choice even when the distance is under 100 metres.";
      icon = "↗";
    } else if (n >= 100) {
      title = "Plan a fibre link or redesign the route";
      description = n === 100 ? "100 metres is the normal maximum total channel length, including patch leads. Avoid designs right at the limit without a qualified installer." : "This exceeds the normal 100-metre four-pair Ethernet channel limit. Consider an appropriate fibre link or another properly engineered solution.";
      icon = "!";
    } else {
      title = "Copper may be suitable";
      description = n + " metres is within the normal four-pair copper Ethernet channel limit. Cat6/Cat6A installation quality, interference and patch lengths still need checking.";
      icon = "✓";
    }
    $("cableTitle").textContent = title;
    $("cableDescription").textContent = description;
    $("cableIcon").textContent = icon;
  }
  $("cableLength").addEventListener("input", cable);
  $("separateBuilding").addEventListener("change", cable);
  cable();

  function power() {
    const checked = all(".power-check").filter(el=>el.checked).map(el=>el.value);
    const missing = ["router","switch","wifi"].filter(d=>!checked.includes(d));
    const count = checked.length;
    const feedback = missing.length === 0
      ? "3 of 3 example components have backup power. Now check each device's watt draw, UPS capacity, battery runtime and whether your ISP will remain online."
      : count + " of 3 components have backup power. Without " + missing.map(d=>d==="wifi"?"the access point":d==="router"?"the router/firewall":"the main switch").join(" and ") + " on the UPS, parts of the network may stop during an outage.";
    $("powerFeedback").textContent = feedback;
    $("powerLight").style.borderColor = missing.length === 0 ? "#98dcb7" : "#f7bb8d";
  }
  all(".power-check").forEach(box => box.addEventListener("change", power));
  power();

  function planText() {
    const type = $("businessType").value, count = $("deviceCount").value;
    const guests = $("guestUse").value === "yes";
    const pos = $("paymentUse").value === "yes";
    const outages = $("outageUse").value === "yes";
    const items = [
      "Network starter plan — " + type,
      "Business size: " + count + " connected devices",
      "",
      "1. List devices, owners, important apps and where each connects.",
      "2. Draw your current router, firewall, switches, access points and links.",
      "3. Change default admin passwords, keep firmware supported and enable WPA2/WPA3.",
      guests ? "4. Create and verify isolated guest Wi-Fi that cannot reach staff or private systems." : "4. Keep staff networks private and review who may connect.",
      pos ? "5. Confirm card/POS devices meet provider security rules and are separated from guest traffic." : "5. Separate any sensitive devices and restrict access with clear rules.",
      outages ? "6. Record equipment power needs, size UPS by watts and runtime, and plan an ISP outage fallback." : "6. Record backup and emergency procedures even if outages are rare.",
      "7. Test Wi-Fi coverage in real rooms and label/document cables.",
      "8. Back up configuration, plan rollback, change one thing at a time and retest.",
      "",
      "This is a conversation starter, not a final installation or security certification.",
      "Learn more: https://v79sl.com/resources"
    ];
    return items.join("\n");
  }
  function updatePlan() { $("planOutput").textContent = planText(); }
  ["businessType","deviceCount","guestUse","paymentUse","outageUse"].forEach(id => $(id).addEventListener("change",updatePlan));
  updatePlan();

  async function copyText(text, target, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text; field.setAttribute("readonly",""); field.style.position="fixed"; field.style.opacity="0"; document.body.appendChild(field);
        field.select();const ok=document.execCommand("copy");field.remove();
        if (!ok) throw new Error("Clipboard unavailable");
      }
      target.textContent = label + " copied. You can paste it into your notes.";
    } catch {
      target.textContent = "Copy was unavailable. Select the text above and copy it manually.";
    }
  }
  $("copyPlan").addEventListener("click",()=>copyText(planText(),$("copyPlanStatus"),"Network plan"));

  const checks = all(".task-check");
  function progress() {
    const count=checks.filter(box=>box.checked).length;
    $("progressText").textContent=count+" of "+checks.length+" done";
    $("progressFill").style.width=(count/checks.length*100)+"%";
  }
  checks.forEach(box=>box.addEventListener("change",progress));
  $("resetTasks").addEventListener("click",()=>{checks.forEach(b=>b.checked=false);progress();});
  progress();

  const answers={q1:"b",q2:"a",q3:"c",q4:"b"};
  const explanations={
    q1:"Guest Wi-Fi should not reach sensitive business networks.",
    q2:"Normal four-pair copper Ethernet channels are limited to 100 metres in total.",
    q3:"UPS planning needs the load, watt rating and manufacturer runtime data.",
    q4:"Back up configuration and plan a rollback before changing firewall rules."
  };
  $("quiz").addEventListener("submit",event=>{
    event.preventDefault();
    const data=new FormData($("quiz"));
    const missing=Object.keys(answers).filter(q=>!data.get(q));
    const output=$("quizResult");
    if(missing.length) { output.classList.add("error");output.textContent="Answer all four questions before checking.";return; }
    const incorrect=Object.keys(answers).filter(q=>data.get(q)!==answers[q]);
    output.classList.remove("error");
    output.textContent=incorrect.length===0
      ? "4/4 correct! You can explain the building blocks of a safer business network."
      : (4-incorrect.length)+"/4 correct. Review: "+incorrect.map(q=>explanations[q]).join(" ");
  });
  $("quiz").addEventListener("reset",()=>{
    $("quizResult").textContent="";$("quizResult").classList.remove("error");
  });

  const isPreview=Boolean(document.querySelector('meta[name="robots"][content*="noindex"]'));
  const articleUrl=isPreview?location.origin+location.pathname:"https://v79sl.com/resources/network-design-and-implementation-caribbean.html";
  $("shareLink").addEventListener("click",()=>copyText(articleUrl,$("shareStatus"),"Lesson link"));
  $("nativeShare").addEventListener("click",async()=>{
    if(navigator.share) {
      try { await navigator.share({title:"Build a Safer Small-Business Network | V79 Digital",text:"An interactive network-planning guide for Caribbean businesses.",url:articleUrl});$("shareStatus").textContent="Shared."; }
      catch(e) {if(e && e.name!=="AbortError")$("shareStatus").textContent="Sharing failed. You can copy the link instead.";}
    }else await copyText(articleUrl,$("shareStatus"),"Lesson link");
  });
})();