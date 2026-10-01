/* =====================================================================
   Shield Engineering — style guide interactivity
   =====================================================================

   WHAT THIS FILE IS
   Plain JavaScript — no React, no build step, no npm packages. Every
   function below makes one component on the page (the Select, the
   Modal, the Switch, etc.) actually work when you click/type on it.

   HOW IT'S WIRED UP (read this before editing)
   There are no addEventListener() calls scattered around hooking up
   individual buttons. Instead, index.html calls these functions
   directly from HTML attributes, like this:

       <button onclick="sgToggleSwitch(this)">...</button>

   `this` refers to the exact HTML element that was clicked, and it
   gets passed straight in as the function's argument. So when you
   read a function below, picture it being called the moment someone
   clicks the element that has its name in an onclick="" attribute
   somewhere in index.html. If you want to find out what triggers a
   given function, search index.html for its name.

   The only things that DON'T work this way are the handful of
   document.addEventListener(...) calls further down — those exist for
   behavior that isn't tied to one specific element, like "close the
   dropdown if you click anywhere outside it" or "close an open modal
   if you press Escape." Those have to listen on the whole page.

   NAMING CONVENTION
   Every function starts with "sg" (Style Guide) so it's obvious at a
   glance that it belongs to this demo page and not to some library.
   The real app's components (src/components/ui/*.jsx) do the same
   jobs with React state instead of these functions — this file is a
   plain-JS stand-in that produces the same visible behavior.

   HOW TO ADD A NEW INTERACTIVE BIT
   1. Write a new function here, named sgDoTheThing(el, ...extraArgs).
   2. Give it a one-line comment above it saying what it does.
   3. In index.html, wire it up with onclick="sgDoTheThing(this)" (or
      oninput=, onchange=, etc. — whichever event fits) on the element
      that should trigger it.
   ===================================================================== */


/* ---------- Theme (light / dark mode toggle in the sidebar) ---------- */

// localStorage key used to remember which theme the visitor last chose.
const SG_THEME_KEY = "sg-theme-mode";

// Actually switches the page's theme. Setting data-theme="dark" on the
// <html> element is what flips every CSS variable in tokens.css over to
// its dark-mode value (see the :root[data-theme="dark"] block there) —
// this one line is the entire theming mechanism.
function sgApplyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  // Remember the choice so a page reload keeps the same theme. Wrapped in
  // try/catch because some browsers block localStorage (private/incognito
  // windows, strict privacy settings) — if that happens we just don't
  // persist the choice, instead of crashing the page.
  try { localStorage.setItem(SG_THEME_KEY, mode); } catch {}
  // Move the "on" highlight to whichever Light/Dark button matches.
  document.querySelectorAll("[data-theme-seg] button").forEach((b) => {
    b.classList.toggle("on", b.dataset.mode === mode);
  });
}

// Runs once when the page first loads: reads the saved theme (defaulting
// to light if none was saved, or if localStorage isn't available) and
// applies it. Called once at the very bottom of this file.
function sgInitTheme() {
  let mode = "light";
  try { mode = localStorage.getItem(SG_THEME_KEY) === "dark" ? "dark" : "light"; } catch {}
  sgApplyTheme(mode);
}

// Called by the Light/Dark buttons: onclick="sgSetTheme('light')" / 'dark'.
function sgSetTheme(mode) { sgApplyTheme(mode); }


/* ---------- Segmented control (generic "pick one of these buttons") ---------- */

// Used by the standalone Segmented demo (List/Grid). Finds the group of
// buttons this element belongs to (its closest .sl-seg ancestor), clears
// "on" from all of them, then adds "on" to just the one that was clicked.
function sgSegPick(el) {
  el.closest(".sl-seg").querySelectorAll("button").forEach((b) => b.classList.remove("on"));
  el.classList.add("on");
}


/* ---------- Checkbox ---------- */

// The checkmark SVG, kept as a string so it can be injected into a
// checkbox the first time it's checked (see sgToggleCheckbox below).
const SG_CHECK_SVG = '<svg width="2.19" height="2.5" viewBox="0 0 448 512" fill="#fff"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>';

// Called by onclick="sgToggleCheckbox(this)" on a .sl-checkbox span.
// Toggles the "on" (checked) class, and lazily adds the checkmark SVG
// the first time it's needed (components.css hides/shows it with
// `.sl-checkbox svg { display: none }` / `.sl-checkbox.on svg { display: block }`).
function sgToggleCheckbox(el) {
  if (el.classList.contains("disabled")) return;
  const on = el.classList.toggle("on");
  if (on && !el.querySelector("svg")) el.innerHTML = SG_CHECK_SVG;
}


/* ---------- Radio (pick exactly one option within a named group) ---------- */

// Each radio dot carries a data-group="..." attribute. Clicking one clears
// "on" from every other radio sharing that same group name, then turns
// this one on — that's what makes radios mutually exclusive.
function sgSelectRadio(el) {
  const group = el.dataset.group;
  document.querySelectorAll('.sl-radio[data-group="' + group + '"]').forEach((r) => r.classList.remove("on"));
  el.classList.add("on");
}


/* ---------- Switch (on/off toggle) ---------- */

// Called by onclick="sgToggleSwitch(this)" on a .sl-switch-track button.
// Flips the "on" class (which components.css uses to slide the thumb and
// change the track color) and keeps the aria-checked attribute in sync
// for screen readers.
function sgToggleSwitch(el) {
  if (el.disabled) return;
  el.classList.toggle("on");
  el.setAttribute("aria-checked", el.classList.contains("on"));
}


/* ---------- Select — single + multiple, filter-as-you-type ----------
   This is a hand-rolled combobox, not a native <select>. Each one is a
   small widget made of:
     .sl-select            the outer wrapper, identified by a unique id
       .sl-select-box       the visible box (holds the text input, and
                             — for multi-select — the chips)
       .sl-select-panel      the dropdown list of options, shown/hidden
                             via the .open class on .sl-select
   The functions below are all called with that wrapper's id (a string),
   which is how one shared set of functions can drive every Select on
   the page without getting them mixed up with each other. */

// Closes every open select dropdown except the one passed in as `except`
// (pass nothing to close all of them). Used so opening one select closes
// any other one that happened to be open.
function sgCloseAllSelects(except) {
  document.querySelectorAll(".sl-select.open").forEach((s) => {
    if (s !== except) s.classList.remove("open");
  });
}

// Called when a select's search input is focused or clicked
// (onfocus=/onclick="sgSelectOpen('some-id')"). Opens its dropdown panel.
function sgSelectOpen(id) {
  const root = document.getElementById(id);
  const wasOpen = root.classList.contains("open");
  sgCloseAllSelects(root);
  if (!wasOpen) root.classList.add("open");
}

// Called on every keystroke in a select's search input
// (oninput="sgSelectFilter('some-id', this)"). Hides any option whose
// label doesn't contain what's been typed so far, and shows the
// "No matches" message if everything got filtered out.
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

// Called when an option in the dropdown is clicked
// (onmousedown="sgSelectPick('some-id', value, label)").
// For a multi-select: adds a removable chip for the picked value (unless
// it's already there) and marks that option as .selected.
// For a single select: just marks the one matching option as .selected,
// puts its label into the search box, and closes the dropdown.
function sgSelectPick(id, value, label) {
  const root = document.getElementById(id);
  const multiple = root.classList.contains("multiple");
  if (multiple) {
    const box = root.querySelector(".sl-select-box");
    if (box.querySelector('[data-chip="' + value + '"]')) return; // already added
    const chip = document.createElement("span");
    chip.className = "sl-select-tag";
    chip.dataset.chip = value;
    // The × button inside the chip calls sgSelectRemoveChip when clicked.
    chip.innerHTML = label + ' <button type="button" class="sl-select-tag-remove" onclick="sgSelectRemoveChip(\'' + id + '\',\'' + value + '\')"><svg class="sl-icon" width="6.75" height="9" viewBox="0 0 384 512" fill="currentColor"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg></button>';
    box.insertBefore(chip, box.querySelector(".sl-select-search"));
    root.querySelector('.sl-select-opt[data-value="' + value + '"]').classList.add("selected");
    const search = root.querySelector(".sl-select-search");
    search.value = "";
    search.focus();
  } else {
    root.querySelectorAll(".sl-select-opt").forEach((o) => o.classList.toggle("selected", o.dataset.value === value));
    const search = root.querySelector(".sl-select-search");
    search.value = label;
    search.dataset.picked = label; // remembers the chosen label (see focusout handler below)
    root.classList.remove("open");
  }
}

// Called by a chip's × button (onclick="sgSelectRemoveChip('some-id', value)").
// Removes that one chip and un-marks the matching option in the panel.
function sgSelectRemoveChip(id, value) {
  const root = document.getElementById(id);
  root.querySelector('.sl-select-tag[data-chip="' + value + '"]')?.remove();
  root.querySelector('.sl-select-opt[data-value="' + value + '"]')?.classList.remove("selected");
}

// Clears every chip/selection in a multi-select. (Not currently wired to
// a button in index.html, but kept here because the real component
// supports a clear-all action and this is its JS equivalent.)
function sgSelectClear(e, id) {
  e.stopPropagation();
  const root = document.getElementById(id);
  root.querySelectorAll(".sl-select-tag").forEach((t) => t.remove());
  root.querySelectorAll(".sl-select-opt.selected").forEach((o) => o.classList.remove("selected"));
  const search = root.querySelector(".sl-select-search");
  search.value = "";
  search.dataset.picked = "";
}

// Page-wide listener: if you click anywhere that ISN'T inside a .sl-select,
// close whichever one is open. This is what makes "click outside to close"
// work without wiring a click handler onto every other element on the page.
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".sl-select")) sgCloseAllSelects();
});

// Page-wide listener: when a single-select's search input loses focus
// (tabbing away, clicking elsewhere) and nothing was actually picked,
// clear out whatever partial text was typed so the box doesn't show a
// half-typed search as if it were a real value. The 150ms delay gives a
// mousedown on an option time to fire sgSelectPick() first — otherwise
// the "clear it" logic here would run before the pick logic and wipe out
// a selection the instant it was made.
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

// Called by onclick="sgShowTab('group-id', 'tab-id')" on a tab button.
// Highlights the clicked tab within its group, and shows only the one
// panel whose data-tabpanel matches — every other panel in that same
// data-tabpanel-group gets hidden.
function sgShowTab(groupId, tabId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll(".sl-tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === tabId));
  document.querySelectorAll('[data-tabpanel-group="' + groupId + '"]').forEach((p) => {
    p.style.display = p.dataset.tabpanel === tabId ? "" : "none";
  });
}


/* ---------- Dropdown (a button that reveals a small menu) ---------- */

// Called by onclick="sgDropdownToggle(this)" on the trigger button.
// Closes any other open dropdown, then opens this one (or closes it, if
// it was already open — a second click toggles it shut).
function sgDropdownToggle(el) {
  const root = el.closest(".sl-dropdown");
  const wasOpen = root.classList.contains("open");
  document.querySelectorAll(".sl-dropdown.open").forEach((d) => d.classList.remove("open"));
  if (!wasOpen) root.classList.add("open");
}

// Page-wide listener: click anywhere outside a .sl-dropdown and close
// whichever one is open. Same "click outside" pattern as the Select above.
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".sl-dropdown")) {
    document.querySelectorAll(".sl-dropdown.open").forEach((d) => d.classList.remove("open"));
  }
});


/* ---------- Modal ---------- */

// Called by onclick="sgOpenModal('modal-id')" — adds the .open class,
// which is what components.css uses to actually show the backdrop+dialog
// (see .sl-modal-backdrop.open in components.css).
function sgOpenModal(id) { document.getElementById(id).classList.add("open"); }

// Called by the × button, Cancel button, etc. — hides the modal again.
function sgCloseModal(id) { document.getElementById(id).classList.remove("open"); }

// Page-wide listener: pressing Escape closes any modal that's currently open.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".sl-modal-backdrop.open").forEach((o) => o.classList.remove("open"));
});

// Called by onmousedown on the dark backdrop behind a modal. Only closes
// the modal if the click landed on the backdrop itself (e.target ===
// e.currentTarget) and not on the dialog box sitting on top of it —
// otherwise clicking inside the dialog would also close it.
function sgModalBackdropClick(e, id) {
  if (e.target === e.currentTarget) sgCloseModal(id);
}

// Powers the "type DELETE to confirm" pattern in the delete-partner modal:
// the Delete button stays disabled until the typed text exactly matches
// the word "Delete".
function sgDeleteConfirmInput(input, btnId) {
  document.getElementById(btnId).disabled = input.value !== "Delete";
}


/* ---------- Tag — removable / checkable ---------- */

// Called by a tag's × button. Fades the tag out, then removes it from
// the page once the fade finishes (the setTimeout delay just matches the
// CSS transition duration so it doesn't pop out abruptly).
function sgRemoveTag(btn) {
  const tag = btn.closest(".sl-tag");
  tag.style.transition = "opacity .12s";
  tag.style.opacity = "0";
  setTimeout(() => tag.remove(), 120);
}

// Called by onclick="sgToggleCheckableTag(this)" — a CheckableTag just
// toggles its own "checked" look; unlike radios, each one is independent.
function sgToggleCheckableTag(el) {
  el.classList.toggle("checked");
}


/* ---------- Alert — dismissible ---------- */

// Same fade-then-remove pattern as sgRemoveTag above, for the × button
// on an .sl-alert banner.
function sgDismissAlert(el) {
  const a = el.closest(".sl-alert");
  a.style.transition = "opacity .15s";
  a.style.opacity = "0";
  setTimeout(() => a.remove(), 150);
}


/* ---------- Steps — clickable ---------- */

// Called by onclick="sgSetStep('group-id', index)" on a step's button.
// Marks every step before `index` as "done" (filled, with a checkmark),
// the step at `index` as "current" (outlined), and leaves the rest
// untouched/upcoming. Also toggles the connecting lines between steps so
// the line only looks "done" (filled blue) up to the current step.
function sgSetStep(groupId, index) {
  const group = document.getElementById(groupId);
  const steps = group.querySelectorAll(".sl-step");
  const lines = group.querySelectorAll(".sl-step-line");
  steps.forEach((s, i) => {
    s.classList.remove("done", "current");
    if (i < index) s.classList.add("done");
    else if (i === index) s.classList.add("current");
    // Swap the dot's contents: a checkmark for completed steps, otherwise
    // just the step number (1-indexed, so step 0 shows "1").
    const dot = s.querySelector(".sl-step-dot");
    dot.innerHTML = i < index
      ? '<svg class="sl-icon" width="10.5" height="12" viewBox="0 0 448 512" fill="currentColor"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>'
      : String(i + 1);
  });
  lines.forEach((l, i) => l.classList.toggle("done", i < index));
}


/* ---------- Menu (sidebar nav demo) ---------- */

// Called by onclick="sgSelectMenuItem(this)" — highlights the clicked
// nav item and un-highlights every other item in the same .sl-menu.
function sgSelectMenuItem(el) {
  const menu = el.closest(".sl-menu");
  menu.querySelectorAll(".sl-menu-item").forEach((i) => i.classList.remove("on"));
  el.classList.add("on");
}


/* ---------- Input — clearable / password reveal ---------- */

// Called by the × button inside a clearable input. Empties the input,
// refocuses it, and hides the × button itself (it's shown again by the
// input's own oninput handler the next time something is typed).
function sgClearInput(btn) {
  const input = btn.closest(".sl-input-wrap").querySelector("input");
  input.value = "";
  input.focus();
  btn.style.display = "none";
}

// Called by the eye icon on a password field. Flips the input between
// type="password" (dots) and type="text" (plain), and swaps the emoji
// to show which state you'll get if you click again.
function sgTogglePassword(btn) {
  const input = btn.closest(".sl-input-wrap").querySelector("input");
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "👁" : "🙈";
}


/* ---------- File upload ----------
   Heads up: this component is PROPOSED, not real yet — there's no Upload
   component in the actual app today (see the "Proposed" badge next to it
   in index.html). It's built here to match the existing design tokens so
   it can be reviewed before anyone builds the real thing. */

// Turns a raw byte count into a human-readable size like "2.4 MB" or "480 KB".
function sgFormatFileSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

// Builds one row (icon + filename + size + remove button) per file and
// appends it to the #upload-list container. Called after a file picker
// selection or a drag-and-drop drop.
function sgRenderUploadFiles(files) {
  const list = document.getElementById("upload-list");
  if (!list) return;
  Array.from(files).forEach((f) => {
    const item = document.createElement("div");
    item.className = "sg-upload-item";
    const icon = document.createElement("span");
    icon.innerHTML = '<svg class="sl-icon" width="10.5" height="14" viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM120 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z"/></svg>';
    const name = document.createElement("span");
    name.className = "sg-upload-name";
    name.textContent = f.name;
    const size = document.createElement("span");
    size.className = "sg-upload-size";
    size.textContent = sgFormatFileSize(f.size);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "sg-upload-remove";
    remove.innerHTML = '<svg class="sl-icon" width="8.25" height="11" viewBox="0 0 384 512" fill="currentColor"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>';
    remove.onclick = () => item.remove();
    item.append(icon, name, size, remove);
    list.appendChild(item);
  });
}

// Called by the hidden file-picker <input>'s onchange. Renders the newly
// picked files, then resets the input so picking the exact same file
// again later will still fire onchange (browsers otherwise treat it as
// "no change" the second time).
function sgHandleUpload(input) {
  sgRenderUploadFiles(input.files);
  input.value = "";
}

// Called by the dropzone's ondrop. Prevents the browser's default
// behavior (which would be to navigate away and open the dropped file),
// removes the drag-hover styling, and renders whatever files were dropped.
function sgHandleDrop(e, zone) {
  e.preventDefault();
  zone.classList.remove("drag");
  if (e.dataTransfer && e.dataTransfer.files) sgRenderUploadFiles(e.dataTransfer.files);
}


/* ---------- Toast ---------- */

// Incrementing counter so every toast gets a unique element id.
let sgToastId = 0;

// Called by onclick="sgPushToast('success', 'Some message')" (or
// 'error' in place of 'success'). Creates a toast element, appends it to
// the fixed-position stack at the bottom of index.html, and schedules it
// to fade out and remove itself after 3 seconds.
function sgPushToast(type, msg) {
  const stack = document.querySelector(".sl-toast-stack");
  const id = "toast-" + ++sgToastId;
  const el = document.createElement("div");
  el.className = "sl-toast " + type;
  el.id = id;
  const icon = type === "success"
    ? '<svg class="sl-icon" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/></svg>'
    : '<svg class="sl-icon" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
  el.innerHTML = icon + "<span>" + msg + "</span>";
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .2s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 3000);
}


/* ---------- Startup ----------
   Everything above just defines functions — nothing runs until this
   line, which applies the saved (or default) theme the moment the page
   loads, before the visitor sees anything. */
sgInitTheme();
