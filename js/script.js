// Custom Stack Tags State
let customTags = ["#Nix", "#DuckDB"];

// DOM References
const form = document.getElementById("engineerForm");
const customTagInput = document.getElementById("customTagInput");
const addCustomTagBtn = document.getElementById("addCustomTagBtn");
const customTagContainer = document.getElementById("customTagContainer");
const workflowNotes = document.getElementById("workflowNotes");

/**
 * HTML Escaping Utility
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format custom tag to always start with '#'
 */
function normalizeTag(raw) {
  const cleaned = raw.trim().replace(/^#+/, "");
  return cleaned ? `#${cleaned}` : "";
}

/**
 * Render Custom Tech Stack Tag Pills
 */
function renderCustomTags() {
  customTagContainer.innerHTML = "";
  customTags.forEach((tag, idx) => {
    const pill = document.createElement("span");
    pill.className =
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-medium bg-surface text-ink border border-border shadow-sm";
    pill.innerHTML = `
          <span>${escapeHtml(tag)}</span>
          <button type="button" class="text-ink-muted hover:text-terracotta transition" aria-label="Remove ${escapeHtml(tag)}">✕</button>
        `;
    pill.querySelector("button").addEventListener("click", () => {
      customTags.splice(idx, 1);
      renderCustomTags();
      syncAll();
    });
    customTagContainer.appendChild(pill);
  });
}

function handleAddCustomTag() {
  const formatted = normalizeTag(customTagInput.value);
  if (!formatted) return;
  if (
    !customTags.some((t) => t.toLowerCase() === formatted.toLowerCase())
  ) {
    customTags.push(formatted);
    renderCustomTags();
    syncAll();
  }
  customTagInput.value = "";
}

addCustomTagBtn.addEventListener("click", handleAddCustomTag);
customTagInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAddCustomTag();
  }
});

/**
 * "Select Popular" & "Clear" Stack Helpers
 */
document
  .getElementById("selectPopularStackBtn")
  .addEventListener("click", () => {
    const popular = [
      "TypeScript",
      "Python",
      "React / Next.js",
      "Node.js / Bun",
      "PostgreSQL",
      "Docker / K8s",
    ];
    document.querySelectorAll('input[name="techStack"]').forEach((cb) => {
      cb.checked = popular.includes(cb.value);
    });
    syncAll();
  });

document.getElementById("clearStackBtn").addEventListener("click", () => {
  document.querySelectorAll('input[name="techStack"]').forEach((cb) => {
    cb.checked = false;
  });
  customTags = [];
  renderCustomTags();
  syncAll();
});

/**
 * Quick-Insert Reflection Prompt Chips
 */
document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const snippet = chip.getAttribute("data-prompt");
    const current = workflowNotes.value.trim();
    const combined = current ? `${current} ${snippet}` : snippet;
    workflowNotes.value = combined.slice(0, 500);
    syncAll();
  });
});

/**
 * Inspector Dual-Tab Toggle (Engineer Card vs JSON Payload)
 */
const tabCardBtn = document.getElementById("tabCardBtn");
const tabJsonBtn = document.getElementById("tabJsonBtn");
const inspectorCardView = document.getElementById("inspectorCardView");
const inspectorJsonView = document.getElementById("inspectorJsonView");

tabCardBtn.addEventListener("click", () => {
  inspectorCardView.classList.remove("hidden");
  inspectorJsonView.classList.add("hidden");
  tabCardBtn.className =
    "px-3 py-1 rounded-full bg-ink text-white transition";
  tabJsonBtn.className =
    "px-3 py-1 rounded-full text-ink-secondary hover:text-ink transition";
});

tabJsonBtn.addEventListener("click", () => {
  inspectorJsonView.classList.remove("hidden");
  inspectorCardView.classList.add("hidden");
  tabJsonBtn.className =
    "px-3 py-1 rounded-full bg-ink text-white transition";
  tabCardBtn.className =
    "px-3 py-1 rounded-full text-ink-secondary hover:text-ink transition";
});

/**
 * Collect Form Payload & Compute Agentic Readiness Score
 */
function collectFormState() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const githubUrl = document.getElementById("githubUrl").value.trim();
  const roleTitle = document.getElementById("roleTitle").value.trim();
  const engineeringTrack =
    document.getElementById("engineeringTrack").value;
  const seniorityLevel = document.getElementById("seniorityLevel").value;
  const yearsExp = parseInt(
    document.getElementById("yearsExp").value,
    10,
  );
  const workRadio = document.querySelector(
    'input[name="workArrangement"]:checked',
  );
  const workArrangement = workRadio ? workRadio.value : "Remote-First";

  const selectedStack = Array.from(
    document.querySelectorAll('input[name="techStack"]:checked'),
  ).map((el) => el.value);
  const cloudProvider = document.getElementById("cloudProvider").value;
  const dailyOs = document.getElementById("dailyOs").value;

  const levelRadio = document.querySelector(
    'input[name="agenticLevel"]:checked',
  );
  const agenticLevel = levelRadio
    ? levelRadio.value
    : "Level 2: IDE Agentic Composer";
  const aiTools = Array.from(
    document.querySelectorAll('input[name="aiTools"]:checked'),
  ).map((el) => el.value);
  const aiCodePercent = parseInt(
    document.getElementById("aiCodePercent").value,
    10,
  );
  const ossCadence = parseInt(
    document.getElementById("ossCadence").value,
    10,
  );
  const guardrails = Array.from(
    document.querySelectorAll('input[name="guardrails"]:checked'),
  ).map((el) => el.value);

  const notes = workflowNotes.value.trim();
  const verified = document.getElementById("verifyConfirm").checked;

  // Compute Agentic Readiness Score (0 - 100)
  let levelPoints = 0;
  if (agenticLevel.startsWith("Level 1")) levelPoints = 18;
  else if (agenticLevel.startsWith("Level 2")) levelPoints = 32;
  else if (agenticLevel.startsWith("Level 3")) levelPoints = 42;

  const toolPoints = Math.min(24, aiTools.length * 6);
  const codeSharePoints = Math.round((aiCodePercent / 100) * 19);
  const guardrailPoints = guardrails.length * 5; // up to 15 pts
  const readinessScore = Math.min(
    100,
    levelPoints + toolPoints + codeSharePoints + guardrailPoints,
  );

  return {
    schema: "dev.spec/v2.6",
    capturedAt: new Date().toISOString(),
    identity: {
      fullName: fullName || null,
      email: email || null,
      githubUrl: githubUrl || null,
      roleTitle: roleTitle || null,
      engineeringTrack,
      seniorityLevel,
      yearsExperience: yearsExp,
      workArrangement,
    },
    stackAndInfra: {
      coreStack: selectedStack,
      customTags: [...customTags],
      cloudProvider,
      dailyDriverOs: dailyOs,
    },
    agenticWorkflow: {
      adoptionLevel: agenticLevel,
      toolsInRotation: aiTools,
      aiAssistedCodePercent: aiCodePercent,
      openSourcePRsPerMonth: ossCadence,
      engineeringGuardrails: guardrails,
      agenticReadinessScore: readinessScore,
    },
    reflections: {
      architectureNotes: notes || null,
      verifiedByEngineer: verified,
    },
  };
}

/**
 * Synchronize All Badges, Completion Progress, Live Engineer Card & JSON View
 */
function syncAll() {
  const state = collectFormState();

  // 1. Range Slider Value Pills
  const yrs = state.identity.yearsExperience;
  document.getElementById("yearsExpBadge").textContent =
    yrs === 25 ? "25+ yrs" : `${yrs} ${yrs === 1 ? "yr" : "yrs"}`;
  document.getElementById("aiCodeBadge").textContent =
    `${state.agenticWorkflow.aiAssistedCodePercent}%`;
  const oss = state.agenticWorkflow.openSourcePRsPerMonth;
  document.getElementById("ossCadenceBadge").textContent =
    oss === 20 ? "20+ PRs/mo" : `${oss} PRs/mo`;

  // 2. Stack Counter & Notes Counter
  const totalStackCount =
    state.stackAndInfra.coreStack.length +
    state.stackAndInfra.customTags.length;
  document.getElementById("stackSelectedCounter").textContent =
    `${totalStackCount} selected`;
  document.getElementById("notesCharCounter").textContent =
    `${workflowNotes.value.length} / 500`;

  // 3. Top Bar Completion Progress Calculation
  let completedChecks = 0;
  const totalChecks = 6;
  if (state.identity.fullName && state.identity.fullName.length >= 2)
    completedChecks++;
  if (
    state.identity.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.identity.email)
  )
    completedChecks++;
  if (totalStackCount > 0) completedChecks++;
  if (state.agenticWorkflow.adoptionLevel) completedChecks++;
  if (
    state.reflections.architectureNotes &&
    state.reflections.architectureNotes.length >= 10
  )
    completedChecks++;
  if (state.reflections.verifiedByEngineer) completedChecks++;

  const pctComplete = Math.round((completedChecks / totalChecks) * 100);
  document.getElementById("completionBar").style.width =
    `${pctComplete}%`;
  document.getElementById("completionText").textContent =
    `${pctComplete}% Complete`;

  // 4. Update Live Engineer Card
  const displayName = state.identity.fullName || "Unnamed Engineer";
  document.getElementById("cardName").textContent = displayName;
  document.getElementById("cardAvatar").textContent = displayName
    .charAt(0)
    .toUpperCase();

  const roleLine = state.identity.roleTitle
    ? `${state.identity.roleTitle} • ${state.identity.seniorityLevel}`
    : `${state.identity.seniorityLevel} • ${state.identity.engineeringTrack}`;
  document.getElementById("cardTitleTrack").textContent = roleLine;
  document.getElementById("cardMetaSub").textContent =
    `${yrs} yrs exp • ${state.identity.workArrangement}`;

  const shortLevel = state.agenticWorkflow.adoptionLevel.split(":")[0];
  document.getElementById("cardLevelPill").textContent = shortLevel;

  // Readiness Score Meter
  const score = state.agenticWorkflow.agenticReadinessScore;
  document.getElementById("readinessScoreValue").innerHTML =
    `${score}<span class="text-base text-ink-muted">/100</span>`;
  document.getElementById("readinessBar").style.width = `${score}%`;

  // Environment Grid
  document.getElementById("cardCloud").textContent =
    state.stackAndInfra.cloudProvider;
  document.getElementById("cardOs").textContent =
    state.stackAndInfra.dailyDriverOs;
  document.getElementById("cardAiShare").textContent =
    `${state.agenticWorkflow.aiAssistedCodePercent}% assisted`;
  document.getElementById("cardOss").textContent =
    `${oss}${oss === 20 ? "+" : ""} PRs / month`;

  // Stack Chips
  const allStack = [
    ...state.stackAndInfra.coreStack,
    ...state.stackAndInfra.customTags,
  ];
  document.getElementById("cardStackCount").textContent =
    `${allStack.length} items`;
  const stackChipsEl = document.getElementById("cardStackChips");
  if (allStack.length === 0) {
    stackChipsEl.innerHTML =
      '<span class="text-xs text-ink-muted italic">No stack selected</span>';
  } else {
    stackChipsEl.innerHTML = allStack
      .map((item) => {
        const isTag = item.startsWith("#");
        return `<span class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium ${isTag ? "bg-terracotta-tint text-terracotta border border-terracotta-border" : "bg-muted text-ink border border-border"}">${escapeHtml(item)}</span>`;
      })
      .join("");
  }

  // AI Tools & Guardrail Chips
  const aiTools = state.agenticWorkflow.toolsInRotation;
  document.getElementById("cardAiToolsCount").textContent =
    `${aiTools.length} tools • ${state.agenticWorkflow.engineeringGuardrails.length} guardrails`;
  const aiChipsEl = document.getElementById("cardAiChips");
  if (aiTools.length === 0) {
    aiChipsEl.innerHTML =
      '<span class="text-xs text-ink-muted italic">No AI tools selected</span>';
  } else {
    aiChipsEl.innerHTML = aiTools
      .map(
        (tool) =>
          `<span class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium bg-sage-tint text-sage border border-sage-border">${escapeHtml(tool)}</span>`,
      )
      .join("");
  }

  // Reflection Quote Preview
  document.getElementById("cardNotesPreview").textContent = state
    .reflections.architectureNotes
    ? `"${state.reflections.architectureNotes}"`
    : '"No architecture reflection added yet..."';

  // 5. Update Live JSON Inspector
  document.getElementById("liveJsonPre").textContent = JSON.stringify(
    state,
    null,
    2,
  );
}

form.addEventListener("input", syncAll);
form.addEventListener("change", syncAll);

/**
 * Form Validation
 */
function clearValidationStyles() {
  document.getElementById("validationBanner").classList.add("hidden");
  ["fullName", "email", "githubUrl", "workflowNotes"].forEach((id) => {
    document.getElementById(id).classList.remove("border-terracotta");
    const errEl = document.getElementById(`err-${id}`);
    if (errEl) errEl.classList.add("hidden");
  });
  document.getElementById("err-techStack").classList.add("hidden");
  document.getElementById("err-verifyConfirm").classList.add("hidden");
}

function validateForm() {
  clearValidationStyles();
  const state = collectFormState();
  let isValid = true;
  let firstInvalidEl = null;

  if (!state.identity.fullName || state.identity.fullName.length < 2) {
    isValid = false;
    const el = document.getElementById("fullName");
    el.classList.add("border-terracotta");
    document.getElementById("err-fullName").classList.remove("hidden");
    firstInvalidEl = firstInvalidEl || el;
  }

  if (
    !state.identity.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.identity.email)
  ) {
    isValid = false;
    const el = document.getElementById("email");
    el.classList.add("border-terracotta");
    document.getElementById("err-email").classList.remove("hidden");
    firstInvalidEl = firstInvalidEl || el;
  }

  if (
    state.identity.githubUrl &&
    !/^https?:\/\/.+/i.test(state.identity.githubUrl)
  ) {
    isValid = false;
    const el = document.getElementById("githubUrl");
    el.classList.add("border-terracotta");
    document.getElementById("err-githubUrl").classList.remove("hidden");
    firstInvalidEl = firstInvalidEl || el;
  }

  const totalStack =
    state.stackAndInfra.coreStack.length +
    state.stackAndInfra.customTags.length;
  if (totalStack === 0) {
    isValid = false;
    document.getElementById("err-techStack").classList.remove("hidden");
    firstInvalidEl = firstInvalidEl || document.getElementById("sec-02");
  }

  if (
    !state.reflections.architectureNotes ||
    state.reflections.architectureNotes.length < 10
  ) {
    isValid = false;
    const el = document.getElementById("workflowNotes");
    el.classList.add("border-terracotta");
    document
      .getElementById("err-workflowNotes")
      .classList.remove("hidden");
    firstInvalidEl = firstInvalidEl || el;
  }

  if (!state.reflections.verifiedByEngineer) {
    isValid = false;
    document
      .getElementById("err-verifyConfirm")
      .classList.remove("hidden");
    firstInvalidEl =
      firstInvalidEl || document.getElementById("verifyConfirm");
  }

  if (!isValid) {
    document
      .getElementById("validationBanner")
      .classList.remove("hidden");
    if (firstInvalidEl) {
      firstInvalidEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  return isValid;
}

/**
 * Auto-Fill Demo Button (Populates realistic Staff Engineer data with 1 click)
 */
document.getElementById("autoFillBtn").addEventListener("click", () => {
  document.getElementById("fullName").value =
    "Soren Lindqvist (@slindqvist)";
  document.getElementById("email").value = "soren@distributed-core.dev";
  document.getElementById("githubUrl").value =
    "https://github.com/slindqvist";
  document.getElementById("roleTitle").value =
    "Staff Distributed Systems Engineer";
  document.getElementById("engineeringTrack").value =
    "Backend & Distributed Systems";
  document.getElementById("seniorityLevel").value =
    "Staff / Principal (L6+)";
  document.getElementById("yearsExp").value = 11;

  const workRadios = document.querySelectorAll(
    'input[name="workArrangement"]',
  );
  workRadios.forEach((r) => {
    r.checked = r.value === "Remote-First";
  });

  const demoStack = [
    "TypeScript",
    "Rust",
    "Go",
    "Python",
    "React / Next.js",
    "PostgreSQL",
    "Redis",
    "Docker / K8s",
    "Terraform",
  ];
  document.querySelectorAll('input[name="techStack"]').forEach((cb) => {
    cb.checked = demoStack.includes(cb.value);
  });

  customTags = ["#Nix", "#DuckDB", "#Temporal"];
  renderCustomTags();

  document.getElementById("cloudProvider").value = "AWS";
  document.getElementById("dailyOs").value =
    "Linux (NixOS / Ubuntu / Arch)";

  document.querySelectorAll('input[name="agenticLevel"]').forEach((r) => {
    r.checked = r.value.startsWith("Level 3");
  });

  const demoAiTools = [
    "Claude Code CLI",
    "Cursor",
    "Custom MCP Servers",
    "Local LLMs (Ollama)",
  ];
  document.querySelectorAll('input[name="aiTools"]').forEach((cb) => {
    cb.checked = demoAiTools.includes(cb.value);
  });

  document.getElementById("aiCodePercent").value = 70;
  document.getElementById("ossCadence").value = 9;

  document.querySelectorAll('input[name="guardrails"]').forEach((cb) => {
    cb.checked = true;
  });

  workflowNotes.value =
    "Maintaining a strict CLAUDE.md architecture specification alongside custom PostgreSQL and GitHub MCP servers allows Claude Code CLI to autonomously scaffold migrations, write property-based tests, and triage regressions while keeping human review focused on core domain invariants.";
  document.getElementById("verifyConfirm").checked = true;

  clearValidationStyles();
  syncAll();
});

/**
 * Top Bar Reset Button
 */
document.getElementById("topResetBtn").addEventListener("click", () => {
  form.reset();
  customTags = [];
  renderCustomTags();
  clearValidationStyles();
  syncAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/**
 * Clipboard Copy Helper (Uses document.execCommand('copy') for iframe compatibility)
 */
function copyTextToClipboard(text, btnElement) {
  const temp = document.createElement("textarea");
  temp.value = text;
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand("copy");
    const originalText = btnElement.textContent;
    btnElement.textContent = "Copied ✓";
    setTimeout(() => {
      btnElement.textContent = originalText;
    }, 1800);
  } catch (err) {
    console.error("Copy failed", err);
  }
  document.body.removeChild(temp);
}

document
  .getElementById("copyJsonSidebarBtn")
  .addEventListener("click", (e) => {
    const payload = JSON.stringify(collectFormState(), null, 2);
    copyTextToClipboard(payload, e.currentTarget);
  });

/**
 * Form Submit Handler & Modal Controls
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const state = collectFormState();
  document.getElementById("modalEngineerName").textContent =
    state.identity.fullName;
  document.getElementById("modalStatRole").textContent =
    `${state.identity.seniorityLevel} • ${state.identity.engineeringTrack}`;
  const totalTech =
    state.stackAndInfra.coreStack.length +
    state.stackAndInfra.customTags.length;
  document.getElementById("modalStatStack").textContent =
    `${totalTech} technologies`;
  document.getElementById("modalStatAgent").textContent =
    state.agenticWorkflow.adoptionLevel.split(":")[0];
  document.getElementById("modalStatScore").textContent =
    `${state.agenticWorkflow.agenticReadinessScore} / 100`;
  document.getElementById("modalJsonPre").textContent = JSON.stringify(
    state,
    null,
    2,
  );

  const modal = document.getElementById("submissionModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

function closeSubmissionModal() {
  const modal = document.getElementById("submissionModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document
  .getElementById("closeModalBtn")
  .addEventListener("click", closeSubmissionModal);
document
  .getElementById("modalDoneBtn")
  .addEventListener("click", closeSubmissionModal);

document
  .getElementById("modalCopyJsonBtn")
  .addEventListener("click", (e) => {
    const payload = JSON.stringify(collectFormState(), null, 2);
    copyTextToClipboard(payload, e.currentTarget);
  });

document
  .getElementById("modalDownloadJsonBtn")
  .addEventListener("click", () => {
    const state = collectFormState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (state.identity.fullName || "engineer")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `dev-spec-${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

/**
 * Scroll-Spy & Direct Click Highlight Lock for Top Navigation Section Pills
 */
const sectionIds = ["sec-01", "sec-02", "sec-03", "sec-04"];
const sectionEls = sectionIds.map((id) => document.getElementById(id));
const navPills = document.querySelectorAll(".nav-pill");
let scrollLockUntil = 0;

function setActiveSection(activeId) {
  // 1. Update Top Navigation Pills (.active state + styling)
  navPills.forEach((pill) => {
    const isActive = pill.getAttribute("data-section") === activeId;
    const numSpan = pill.querySelector("span");
    if (isActive) {
      pill.className =
        "nav-pill active px-3.5 py-1 rounded-full text-xs font-semibold bg-surface text-ink shadow-sm transition-all";
      if (numSpan) numSpan.className = "font-mono text-terracotta mr-1";
    } else {
      pill.className =
        "nav-pill px-3.5 py-1 rounded-full text-xs font-medium text-ink-secondary hover:text-ink transition-all";
      if (numSpan) numSpan.className = "font-mono text-ink-muted mr-1";
    }
  });

  // 2. Toggle .is-active-section on the corresponding form section card (#sec-01..#sec-04)
  sectionEls.forEach((sec) => {
    if (!sec) return;
    if (sec.id === activeId) {
      sec.classList.add("is-active-section");
    } else {
      sec.classList.remove("is-active-section");
    }
  });
}

function updateScrollSpy() {
  if (Date.now() < scrollLockUntil) return;

  const sec04 = document.getElementById("sec-04");
  const nearPageBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 120;
  const sec04InView =
    sec04 &&
    sec04.getBoundingClientRect().top <= window.innerHeight * 0.55;

  if (nearPageBottom || sec04InView) {
    setActiveSection("sec-04");
    return;
  }

  const triggerLine = window.innerHeight * 0.38;
  let currentId = "sec-01";

  sectionEls.forEach((sec) => {
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top <= triggerLine) {
      currentId = sec.id;
    }
  });

  setActiveSection(currentId);
}

// Direct Click Highlight Lock on Nav Pills
navPills.forEach((pill) => {
  pill.addEventListener("click", (e) => {
    const targetId = pill.getAttribute("data-section");
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    scrollLockUntil = Date.now() + 650;
    setActiveSection(targetId);
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("scroll", updateScrollSpy, { passive: true });
window.addEventListener("resize", updateScrollSpy, { passive: true });

// Initialize on load
window.addEventListener("DOMContentLoaded", () => {
  renderCustomTags();
  syncAll();
  updateScrollSpy();
});