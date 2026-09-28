/* Shield Engineering — style guide interactivity.
   Vanilla JS, no dependencies, no build step. Every helper here drives the
   same class names and states the real sl-* component library uses in the
   Poom app (src/components/ui/*.jsx) — this is a live rendering of that
   system, not a mockup of it. */

/* ---------- Theme (light/dark) ---------- */
const SG_THEME_KEY = "sg-theme-mode";
function sgApplyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  try { localStorage.setItem(SG_THEME_KEY, mode); } catch {}
  document.querySelectorAll("[data-theme-seg] button").forEach((b) => {
    b.classList.toggle("on", b.dataset.mode === mode);
  });
}
function sgInitTheme() {
  let mode = "light";
  try { mode = localStorage.getItem(SG_THEME_KEY) === "dark" ? "dark" : "light"; } catch {}
  sgApplyTheme(mode);
}
function sgSetTheme(mode) { sgApplyTheme(mode); }

/* ---------- Segmented control (generic) ---------- */
function sgSegPick(el, group) {
  el.closest(".sl-seg").querySelectorAll("button").forEach((b) => b.classList.remove("on"));
  el.classList.add("on");
}

/* ---------- Checkbox ---------- */
const SG_CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
function sgToggleCheckbox(el) {
  if (el.classList.contains("disabled")) return;
  const on = el.classList.toggle("on");
  if (on && !el.querySelector("svg")) el.innerHTML = SG_CHECK_SVG;
}

/* ---------- Radio ---------- */
function sgSelectRadio(el) {
  const group = el.dataset.group;
  document.querySelectorAll('.sl-radio[data-group="' + group + '"]').forEach((r) => r.classList.remove("on"));
  el.classList.add("on");
}

/* ---------- Switch ---------- */
function sgToggleSwitch(el) {
  if (el.disabled) return;
  el.classList.toggle("on");
  el.setAttribute("aria-checked", el.classList.contains("on"));
}

/* ---------- Select — single + multiple, filter-as-you-type ---------- */
function sgCloseAllSelects(except) {
  document.querySelectorAll(".sl-select.open").forEach((s) => {
    if (s !== except) s.classList.remove("open");
  });
}
function sgSelectOpen(id) {
  const root = document.getElementById(id);
  const wasOpen = root.classList.contains("open");
  sgCloseAllSelects(root);
  if (!wasOpen) root.classList.add("open");
}
function sgSelectFilter(id, input) {
  const root = document.getElementById(id);
  root.classList.add("open");
  sgCloseAllSelects(root);
  const q = input.value.trim().toLowerCase();
  let anyVisible = false;
  root.querySelectorAll(".sl-select-opt").forEach((opt) => {
    const match = opt.dataset.label.toLowerCase().includes(q);
    opt.style.display = match ? "" : "none";
    if (match) anyVisible = true;
  });
  const empty = root.querySelector(".sl-select-empty");
  if (empty) empty.style.display = anyVisible ? "none" : "";
}
function sgSelectPick(id, value, label) {
  const root = document.getElementById(id);
  const multiple = root.classList.contains("multiple");
  if (multiple) {
    const box = root.querySelector(".sl-select-box");
    if (box.querySelector('[data-chip="' + value + '"]')) return;
    const chip = document.createElement("span");
    chip.className = "sl-select-tag";
    chip.dataset.chip = value;
    chip.innerHTML = label + ' <button type="button" class="sl-select-tag-remove" onclick="sgSelectRemoveChip(\'' + id + '\',\'' + value + '\')"><svg class="sl-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    box.insertBefore(chip, box.querySelector(".sl-select-search"));
    root.querySelector('.sl-select-opt[data-value="' + value + '"]').classList.add("selected");
    const search = root.querySelector(".sl-select-search");
    search.value = "";
    search.focus();
  } else {
    root.querySelectorAll(".sl-select-opt").forEach((o) => o.classList.toggle("selected", o.dataset.value === value));
    const search = root.querySelector(".sl-select-search");
    search.value = label;
    search.dataset.picked = label;
    root.classList.remove("open");
  }
}
function sgSelectRemoveChip(id, value) {
  const root = document.getElementById(id);
  root.querySelector('.sl-select-tag[data-chip="' + value + '"]')?.remove();
  root.querySelector('.sl-select-opt[data-value="' + value + '"]')?.classList.remove("selected");
}
function sgSelectClear(e, id) {
  e.stopPropagation();
  const root = document.getElementById(id);
  root.querySelectorAll(".sl-select-tag").forEach((t) => t.remove());
  root.querySelectorAll(".sl-select-opt.selected").forEach((o) => o.classList.remove("selected"));
  const search = root.querySelector(".sl-select-search");
  search.value = "";
  search.dataset.picked = "";
}
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".sl-select")) sgCloseAllSelects();
});
document.addEventListener("focusout", (e) => {
  const root = e.target.closest(".sl-select:not(.multiple)");
  if (root && !root.classList.contains("multiple")) {
    setTimeout(() => {
      const search = root.querySelector(".sl-select-search");
      if (document.activeElement && root.contains(document.activeElement)) return;
      if (!search.dataset.picked) search.value = "";
    }, 150);
  }
});

/* ---------- Tabs ---------- */
function sgShowTab(groupId, tabId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll(".sl-tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === tabId));
  document.querySelectorAll('[data-tabpanel-group="' + groupId + '"]').forEach((p) => {
    p.style.display = p.dataset.tabpanel === tabId ? "" : "none";
  });
}

/* ---------- Dropdown (click trigger) ---------- */
function sgDropdownToggle(el) {
  const root = el.closest(".sl-dropdown");
  const wasOpen = root.classList.contains("open");
  document.querySelectorAll(".sl-dropdown.open").forEach((d) => d.classList.remove("open"));
  if (!wasOpen) root.classList.add("open");
}
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".sl-dropdown")) {
    document.querySelectorAll(".sl-dropdown.open").forEach((d) => d.classList.remove("open"));
  }
});

/* ---------- Modal ---------- */
function sgOpenModal(id) { document.getElementById(id).classList.add("open"); }
function sgCloseModal(id) { document.getElementById(id).classList.remove("open"); }
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".sl-modal-backdrop.open").forEach((o) => o.classList.remove("open"));
});
function sgModalBackdropClick(e, id) {
  if (e.target === e.currentTarget) sgCloseModal(id);
}
function sgDeleteConfirmInput(input, btnId) {
  document.getElementById(btnId).disabled = input.value !== "Delete";
}

/* ---------- Tag — removable ---------- */
function sgRemoveTag(btn) {
  const tag = btn.closest(".sl-tag");
  tag.style.transition = "opacity .12s";
  tag.style.opacity = "0";
  setTimeout(() => tag.remove(), 120);
}
function sgToggleCheckableTag(el) {
  el.classList.toggle("checked");
}

/* ---------- Alert — dismissible ---------- */
function sgDismissAlert(el) {
  const a = el.closest(".sl-alert");
  a.style.transition = "opacity .15s";
  a.style.opacity = "0";
  setTimeout(() => a.remove(), 150);
}

/* ---------- Steps — clickable ---------- */
function sgSetStep(groupId, index) {
  const group = document.getElementById(groupId);
  const steps = group.querySelectorAll(".sl-step");
  const lines = group.querySelectorAll(".sl-step-line");
  steps.forEach((s, i) => {
    s.classList.remove("done", "current");
    if (i < index) s.classList.add("done");
    else if (i === index) s.classList.add("current");
    const dot = s.querySelector(".sl-step-dot");
    dot.innerHTML = i < index
      ? '<svg class="sl-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : String(i + 1);
  });
  lines.forEach((l, i) => l.classList.toggle("done", i < index));
}

/* ---------- Menu (sidebar nav demo) ---------- */
function sgSelectMenuItem(el) {
  const menu = el.closest(".sl-menu");
  menu.querySelectorAll(".sl-menu-item").forEach((i) => i.classList.remove("on"));
  el.classList.add("on");
}

/* ---------- Input — clearable / password reveal ---------- */
function sgClearInput(btn) {
  const input = btn.closest(".sl-input-wrap").querySelector("input");
  input.value = "";
  input.focus();
  btn.style.display = "none";
}
function sgTogglePassword(btn) {
  const input = btn.closest(".sl-input-wrap").querySelector("input");
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "👁" : "🙈";
}

/* ---------- File upload (proposed component, not in ui.css yet) ---------- */
function sgFormatFileSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}
function sgRenderUploadFiles(files) {
  const list = document.getElementById("upload-list");
  if (!list) return;
  Array.from(files).forEach((f) => {
    const item = document.createElement("div");
    item.className = "sg-upload-item";
    const icon = document.createElement("span");
    icon.innerHTML = '<svg class="sl-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    const name = document.createElement("span");
    name.className = "sg-upload-name";
    name.textContent = f.name;
    const size = document.createElement("span");
    size.className = "sg-upload-size";
    size.textContent = sgFormatFileSize(f.size);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "sg-upload-remove";
    remove.innerHTML = '<svg class="sl-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    remove.onclick = () => item.remove();
    item.append(icon, name, size, remove);
    list.appendChild(item);
  });
}
function sgHandleUpload(input) {
  sgRenderUploadFiles(input.files);
  input.value = "";
}
function sgHandleDrop(e, zone) {
  e.preventDefault();
  zone.classList.remove("drag");
  if (e.dataTransfer && e.dataTransfer.files) sgRenderUploadFiles(e.dataTransfer.files);
}

/* ---------- Toast ---------- */
let sgToastId = 0;
function sgPushToast(type, msg) {
  const stack = document.querySelector(".sl-toast-stack");
  const id = "toast-" + ++sgToastId;
  const el = document.createElement("div");
  el.className = "sl-toast " + type;
  el.id = id;
  const icon = type === "success"
    ? '<svg class="sl-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg class="sl-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  el.innerHTML = icon + "<span>" + msg + "</span>";
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .2s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 3000);
}

sgInitTheme();
