const tooltip = document.querySelector("#floating-tooltip");
let activeTooltip = null;
let dismissTimer = 0;

function cancelDismiss() {
  window.clearTimeout(dismissTimer);
}

function dismissTooltip() {
  cancelDismiss();
  if (!activeTooltip) return;

  const { trigger } = activeTooltip;
  trigger.removeAttribute("data-active");
  trigger.setAttribute("aria-pressed", "false");
  tooltip.hidden = true;
  activeTooltip = null;
}

function positionTooltip() {
  const { trigger, point } = activeTooltip;
  const bounds = trigger.getBoundingClientRect();
  const { width, height } = tooltip.getBoundingClientRect();
  const gap = point ? 14 : 8;
  const preferredLeft = point ? point.x + gap : bounds.right - width;
  const preferredTop = point ? point.y + gap : bounds.bottom + gap;
  const above = (point ? point.y : bounds.top) - height - gap;
  const top = preferredTop + height + 10 <= window.innerHeight ? preferredTop : above;

  tooltip.style.left = `${Math.max(10, Math.min(preferredLeft, window.innerWidth - width - 10))}px`;
  tooltip.style.top = `${Math.max(10, top)}px`;
}

function showTooltip(trigger, mode, point = null) {
  dismissTooltip();
  const description = document.getElementById(trigger.dataset.tooltip);
  if (!description) return;

  activeTooltip = { trigger, mode, point };
  tooltip.textContent = description.textContent.trim();
  tooltip.hidden = false;
  trigger.setAttribute("data-active", "");
  trigger.setAttribute("aria-pressed", String(mode === "pinned"));
  positionTooltip();
}

for (const trigger of document.querySelectorAll("[data-tooltip]")) {
  trigger.setAttribute("aria-pressed", "false");

  trigger.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse" || activeTooltip?.mode === "pinned") return;
    showTooltip(trigger, "hover");
  });

  trigger.addEventListener("pointerleave", () => {
    if (activeTooltip?.trigger === trigger && activeTooltip.mode === "hover") {
      dismissTimer = window.setTimeout(dismissTooltip, 150);
    }
  });

  trigger.addEventListener("focus", () => {
    if (trigger.matches(":focus-visible")) showTooltip(trigger, "focus");
  });

  trigger.addEventListener("blur", () => {
    if (activeTooltip?.trigger === trigger && activeTooltip.mode === "focus") dismissTooltip();
  });

  trigger.addEventListener("click", () => {
    if (activeTooltip?.trigger === trigger && activeTooltip.mode === "pinned") {
      dismissTooltip();
    } else {
      showTooltip(trigger, "pinned");
    }
  });
}

tooltip.addEventListener("pointerenter", cancelDismiss);
tooltip.addEventListener("pointerleave", (event) => {
  if (activeTooltip?.mode === "hover" && !activeTooltip.trigger.contains(event.relatedTarget)) dismissTooltip();
});

document.addEventListener("pointerdown", (event) => {
  if (activeTooltip && !activeTooltip.trigger.contains(event.target) && !tooltip.contains(event.target)) {
    dismissTooltip();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeTooltip) dismissTooltip();
});

window.addEventListener("scroll", () => {
  if (!activeTooltip) return;

  const bounds = activeTooltip.trigger.getBoundingClientRect();
  if (activeTooltip.mode === "hover" || bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
    dismissTooltip();
  } else {
    positionTooltip();
  }
}, { passive: true, capture: true });

window.addEventListener("resize", () => {
  if (activeTooltip) positionTooltip();
});
