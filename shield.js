/* =====================================================================
   Shield Engineering — style guide interactivity
   =====================================================================

   WHAT THIS FILE IS
   Plain JavaScript — no framework, no build step, no npm packages. Every
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
   These functions are plain-JS helpers: copy one with its markup, or
   replace it with your own state handling.

   ENGINEER MODE
   The Engineer Mode switch at the top of the sidebar reveals a code
   panel under every section. The panels are built here (see "Engineer
   Mode" near the bottom) from the SG_SNIPPETS object in snippets.js,
   which is loaded before this file.

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
function sgApplyTheme(mode, remember = true) {
  document.documentElement.dataset.theme = mode;
  // Remember the choice so a page reload keeps the same theme (not when the
  // theme merely followed the OS setting: that is not a choice). Wrapped in
  // try/catch because some browsers block localStorage (private/incognito
  // windows, strict privacy settings) — if that happens we just don't
  // persist the choice, instead of crashing the page.
  if (remember) { try { localStorage.setItem(SG_THEME_KEY, mode); } catch {} }
  // Move the "is-on" highlight to whichever Light/Dark button matches.
  document.querySelectorAll("[data-theme-seg] button").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.mode === mode);
  });
  // The live responsive demo is an <iframe> with its own <html>, so it
  // has to be told about the change (see "Responsive demo" below).
  document.querySelectorAll("iframe[data-sg-frame]").forEach(sgFrameTheme);
}

// Runs once when the page first loads. A saved choice wins; otherwise the
// page follows the operating system's light/dark setting
// (prefers-color-scheme), and keeps following it until a choice is made.
// Called once at the very bottom of this file.
function sgInitTheme() {
  let saved = null;
  try { saved = localStorage.getItem(SG_THEME_KEY); } catch {}
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const fromSystem = () => (system.matches ? "dark" : "light");
  if (saved === "dark" || saved === "light") { sgApplyTheme(saved); return; }
  sgApplyTheme(fromSystem(), false);
  system.addEventListener("change", () => {
    let still = null;
    try { still = localStorage.getItem(SG_THEME_KEY); } catch {}
    if (!still) sgApplyTheme(fromSystem(), false);
  });
}

// Called by the Light/Dark buttons: onclick="sgSetTheme('light')" / 'dark'.
function sgSetTheme(mode) { sgApplyTheme(mode); }


/* ---------- Segmented control (generic "pick one of these buttons") ---------- */

// Used by the standalone Segmented demo (List/Grid). Finds the group of
// buttons this element belongs to (its closest .shield-segmented ancestor), clears
// "is-on" from all of them, then adds "is-on" to just the one that was clicked.
function sgSegPick(el) {
  el.closest(".shield-segmented").querySelectorAll("button").forEach((b) => b.classList.remove("is-on"));
  el.classList.add("is-on");
}


/* ---------- Checkbox ---------- */

// The checkmark SVG, kept as a string so it can be injected into a
// checkbox the first time it's checked (see sgToggleCheckbox below).
const SG_CHECK_SVG = '<svg width="2.19" height="2.5" viewBox="0 0 448 512" fill="#fff"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>';

// Called by onclick="sgToggleCheckbox(this)" on a .shield-checkbox span.
// Toggles the "is-on" (checked) class, and lazily adds the checkmark SVG
// the first time it's needed (components.css hides/shows it with
// `.shield-checkbox svg { display: none }` / `.shield-checkbox.is-on svg { display: block }`).
function sgToggleCheckbox(el) {
  if (el.classList.contains("disabled")) return;
  const on = el.classList.toggle("is-on");
  if (el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", on); // keep screen readers in sync
  if (on && !el.querySelector("svg")) el.innerHTML = SG_CHECK_SVG;
}


/* ---------- Radio (pick exactly one option within a named group) ---------- */

// Each radio dot carries a data-group="..." attribute. Clicking one clears
// "is-on" from every other radio sharing that same group name, then turns
// this one on — that's what makes radios mutually exclusive.
function sgSelectRadio(el) {
  const group = el.dataset.group;
  document.querySelectorAll('.shield-radio[data-group="' + group + '"]').forEach((r) => {
    r.classList.remove("is-on");
    if (r.hasAttribute("aria-checked")) { r.setAttribute("aria-checked", "false"); r.tabIndex = -1; }
  });
  el.classList.add("is-on");
  if (el.hasAttribute("aria-checked")) { el.setAttribute("aria-checked", "true"); el.tabIndex = 0; } // only the chosen radio is a Tab stop; arrow keys move between them
}


/* ---------- Switch (on/off toggle) ---------- */

// Called by onclick="sgToggleSwitch(this)" on a .shield-switch-track button.
// Flips the "is-on" class (which components.css uses to slide the thumb and
// change the track color) and keeps the aria-checked attribute in sync
// for screen readers.
function sgToggleSwitch(el) {
  if (el.disabled) return;
  el.classList.toggle("is-on");
  el.setAttribute("aria-checked", el.classList.contains("is-on"));
}


/* ---------- Select — single + multiple, filter-as-you-type ----------
   This is a hand-rolled combobox, not a native <select>. Each one is a
   small widget made of:
     .shield-select            the outer wrapper, identified by a unique id
       .shield-select-box       the visible box (holds the text input, and
                             — for multi-select — the chips)
       .shield-select-panel      the dropdown list of options, shown/hidden
                             via the .open class on .shield-select
   The functions below are all called with that wrapper's id (a string),
   which is how one shared set of functions can drive every Select on
   the page without getting them mixed up with each other. */

// The one place the open/closed state is written. Besides the .open class
// the CSS draws from, it keeps the combobox's aria-expanded in step and,
// on close, drops the keyboard highlight and aria-activedescendant so a
// screen reader is not left pointing at a hidden option.
function sgSelectSetOpen(root, open) {
  root.classList.toggle("open", open);
  const search = root.querySelector(".shield-select-search");
  if (search) search.setAttribute("aria-expanded", open);
  if (!open) {
    root.querySelectorAll(".shield-select-option.active").forEach((o) => o.classList.remove("active"));
    if (search) search.removeAttribute("aria-activedescendant");
  }
}

// Closes every open select dropdown except the one passed in as `except`
// (pass nothing to close all of them). Used so opening one select closes
// any other one that happened to be open.
function sgCloseAllSelects(except) {
  document.querySelectorAll(".shield-select.open").forEach((s) => {
    if (s !== except) sgSelectSetOpen(s, false);
  });
}

// Called when a select's search input is focused or clicked
// (onfocus=/onclick="sgSelectOpen('some-id')"). Opens its dropdown panel.
function sgSelectOpen(id) {
  const root = document.getElementById(id);
  const wasOpen = root.classList.contains("open");
  sgCloseAllSelects(root);
  if (!wasOpen) sgSelectSetOpen(root, true);
}

// Called on every keystroke in a select's search input
// (oninput="sgSelectFilter('some-id', this)"). Hides any option whose
// label doesn't contain what's been typed so far, and shows the
// "No matches" message if everything got filtered out.
function sgSelectFilter(id, input) {
  const root = document.getElementById(id);
  sgSelectSetOpen(root, true);
  sgCloseAllSelects(root);
  const q = input.value.trim().toLowerCase();
  let anyVisible = false;
  root.querySelectorAll(".shield-select-option").forEach((opt) => {
    const match = opt.dataset.label.toLowerCase().includes(q);
    opt.style.display = match ? "" : "none";
    if (match) anyVisible = true;
  });
  const empty = root.querySelector(".shield-select-empty");
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
    const box = root.querySelector(".shield-select-box");
    if (box.querySelector('[data-chip="' + value + '"]')) return; // already added
    const chip = document.createElement("span");
    chip.className = "shield-select-tag";
    chip.dataset.chip = value;
    // The label goes in as text (never innerHTML: in a product it comes from
    // data). The × button inside the chip calls sgSelectRemoveChip when clicked.
    chip.append(document.createTextNode(label + " "));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "shield-select-tag-remove";
    remove.setAttribute("aria-label", "Remove " + label);
    remove.innerHTML = '<svg class="shield-icon" width="6.75" height="9" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>';
    remove.onclick = () => sgSelectRemoveChip(id, value);
    chip.appendChild(remove);
    box.insertBefore(chip, box.querySelector(".shield-select-search"));
    const opt = root.querySelector('.shield-select-option[data-value="' + value + '"]');
    opt.classList.add("selected");
    opt.setAttribute("aria-selected", "true");
    const search = root.querySelector(".shield-select-search");
    search.value = "";
    search.focus();
  } else {
    root.querySelectorAll(".shield-select-option").forEach((o) => {
      const on = o.dataset.value === value;
      o.classList.toggle("selected", on);
      o.setAttribute("aria-selected", on);
    });
    const search = root.querySelector(".shield-select-search");
    search.value = label;
    search.dataset.picked = label; // remembers the chosen label (see focusout handler below)
    sgSelectSetOpen(root, false);
  }
}

// Called by a chip's × button (onclick="sgSelectRemoveChip('some-id', value)").
// Removes that one chip and un-marks the matching option in the panel.
function sgSelectRemoveChip(id, value) {
  const root = document.getElementById(id);
  root.querySelector('.shield-select-tag[data-chip="' + value + '"]')?.remove();
  const opt = root.querySelector('.shield-select-option[data-value="' + value + '"]');
  if (opt) { opt.classList.remove("selected"); opt.setAttribute("aria-selected", "false"); }
}

// Clears every chip/selection in a multi-select. (Not currently wired to
// a button in index.html, but kept here because the real component
// supports a clear-all action and this is its JS equivalent.)
function sgSelectClear(e, id) {
  e.stopPropagation();
  const root = document.getElementById(id);
  root.querySelectorAll(".shield-select-tag").forEach((t) => t.remove());
  root.querySelectorAll(".shield-select-option.selected").forEach((o) => { o.classList.remove("selected"); o.setAttribute("aria-selected", "false"); });
  const search = root.querySelector(".shield-select-search");
  search.value = "";
  search.dataset.picked = "";
}

// Page-wide listener: if you click anywhere that ISN'T inside a .shield-select,
// close whichever one is open. This is what makes "click outside to close"
// work without wiring a click handler onto every other element on the page.
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".shield-select")) sgCloseAllSelects();
});

// Page-wide listener: when a single-select's search input loses focus
// (tabbing away, clicking elsewhere) and nothing was actually picked,
// clear out whatever partial text was typed so the box doesn't show a
// half-typed search as if it were a real value. The 150ms delay gives a
// mousedown on an option time to fire sgSelectPick() first — otherwise
// the "clear it" logic here would run before the pick logic and wipe out
// a selection the instant it was made.
document.addEventListener("focusout", (e) => {
  const root = e.target.closest(".shield-select:not(.multiple)");
  if (root && !root.classList.contains("multiple")) {
    setTimeout(() => {
      const search = root.querySelector(".shield-select-search");
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
  group.querySelectorAll(".shield-tab").forEach((t) => {
    const on = t.dataset.tab === tabId;
    t.classList.toggle("is-on", on);
    if (t.getAttribute("role") === "tab") { t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; } // roving tabindex: only the active tab is a Tab stop
  });
  document.querySelectorAll('[data-tabpanel-group="' + groupId + '"]').forEach((p) => {
    p.hidden = p.dataset.tabpanel !== tabId; // the hidden attribute also removes the panel from the accessibility tree
  });
}


/* ---------- Dropdown (a button that reveals a small menu) ---------- */

// Called by onclick="sgDropdownToggle(this)" on the trigger button.
// Closes any other open dropdown, then opens this one (or closes it, if
// it was already open — a second click toggles it shut). Pass focusFirst
// to put keyboard focus on the first menu item (the APG menu-button
// pattern does this when the menu is opened from the keyboard).
function sgDropdownToggle(el, focusFirst) {
  const root = el.closest(".shield-dropdown");
  const wasOpen = root.classList.contains("open");
  sgDropdownCloseAll();
  if (!wasOpen) {
    root.classList.add("open");
    el.setAttribute("aria-expanded", "true");
    if (focusFirst) { const first = root.querySelector('[role="menuitem"]'); if (first) first.focus(); }
  }
}
function sgDropdownCloseAll() {
  document.querySelectorAll(".shield-dropdown.open").forEach((d) => {
    d.classList.remove("open");
    const t = d.querySelector("[aria-expanded]");
    if (t) t.setAttribute("aria-expanded", "false");
  });
}

// Keyboard for the menu button and its menu (WAI-ARIA APG "Menu button"
// and "Menu"): Down/Enter/Space on the trigger open and focus the first
// item (Up opens and focuses the last); inside the menu Up/Down move with
// wrap, Home/End jump, Tab closes, and a letter jumps to the next item
// starting with it. Escape is handled with the other overlays below.
document.addEventListener("keydown", (e) => {
  const trigger = e.target.closest && e.target.closest('.shield-dropdown > [aria-haspopup="menu"]');
  if (trigger && (e.key === "ArrowDown" || e.key === "ArrowUp" || ((e.key === "Enter" || e.key === " ") && trigger.getAttribute("aria-expanded") !== "true"))) {
    e.preventDefault();
    const root = trigger.closest(".shield-dropdown");
    if (!root.classList.contains("open")) sgDropdownToggle(trigger, false);
    const items = Array.from(root.querySelectorAll('[role="menuitem"]'));
    if (items.length) items[e.key === "ArrowUp" ? items.length - 1 : 0].focus();
    return;
  }
  const item = e.target.closest && e.target.closest('.shield-dropdown.open [role="menuitem"]');
  if (!item) return;
  const items = Array.from(item.closest(".shield-dropdown").querySelectorAll('[role="menuitem"]'));
  const i = items.indexOf(item);
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
  else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
  else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
  else if (e.key === "Tab") { sgDropdownCloseAll(); }
  else if (e.key.length === 1 && /\S/.test(e.key)) {
    const k = e.key.toLowerCase();
    const next = items.slice(i + 1).concat(items.slice(0, i + 1)).find((it) => it.textContent.trim().toLowerCase().startsWith(k));
    if (next) next.focus();
  }
});

// Page-wide listener: click anywhere outside a .shield-dropdown and close
// whichever one is open. Same "click outside" pattern as the Select above.
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".shield-dropdown")) sgDropdownCloseAll();
});
// Choosing an item closes the menu and returns focus to the button.
document.addEventListener("click", (e) => {
  const item = e.target.closest && e.target.closest('.shield-dropdown.open [role="menuitem"]');
  if (!item) return;
  const trigger = item.closest(".shield-dropdown").querySelector("[aria-expanded]");
  sgDropdownCloseAll();
  if (trigger) trigger.focus();
});


/* ---------- Modal ---------- */

// Called by onclick="sgOpenModal('modal-id')" — adds the .open class,
// which is what components.css uses to actually show the backdrop+dialog
// (see .shield-modal-backdrop.open in components.css). It also moves
// keyboard focus into the dialog (sgOverlayOpen, below).
function sgOpenModal(id) { sgOverlayOpen(document.getElementById(id), ".shield-modal"); }

// Called by the × button, Cancel button, etc. — hides the modal again and
// puts focus back on the button that opened it.
function sgCloseModal(id) { sgOverlayClose(document.getElementById(id)); }

// Page-wide listener: Escape closes whichever modal or drawer is on top,
// and Tab stays inside it (a "focus trap") so keyboard users can't tab
// off into the page behind. See sgOverlayOpen below for the focus part.
document.addEventListener("keydown", (e) => {
  const open = document.querySelectorAll(".shield-modal-backdrop.open, .shield-drawer-backdrop.open");
  if (!open.length) return;
  const top = open[open.length - 1];
  if (e.key === "Escape") {
    // Anything floating inside the dialog (a popover, a dropdown menu, an open
    // select) closes first; the dialog itself closes on the next Escape.
    if (document.querySelector(".shield-popover.open, .shield-dropdown.open, .shield-select.open")) return;
    sgOverlayClose(top);
    return;
  }
  if (e.key === "Tab") {
    const items = sgFocusable(top);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !top.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
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
  const tag = btn.closest(".shield-tag");
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
// on an .shield-alert banner.
function sgDismissAlert(el) {
  const a = el.closest(".shield-alert");
  a.style.transition = "opacity .15s";
  a.style.opacity = "0";
  setTimeout(() => a.remove(), 150);
}


/* ---------- Steps — clickable ---------- */

/* ---------- Steps that remember progress ----------
   Each step keeps its own state, separate from which step you are
   looking at. The group carries data-steps and data-current (the index
   being viewed). Each .shield-step carries data-state: "todo" (not
   started), "partial" (started, not finished) or "done". sgStepsRender()
   turns those into the classes the CSS draws. Going back to an earlier
   step therefore never changes a later step's state. */
const SG_CHECK_ICON = '<svg class="shield-icon" width="10.5" height="12" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>';

function sgStepsRender(group) {
  const current = parseInt(group.dataset.current, 10);
  const steps = group.querySelectorAll(".shield-step");
  const lines = group.querySelectorAll(".shield-step-line");
  steps.forEach((s, i) => {
    const state = s.dataset.state || "todo";
    s.classList.toggle("done", state === "done");
    s.classList.toggle("partial", state === "partial");
    s.classList.toggle("current", i === current);
    s.querySelector(".shield-step-dot").innerHTML = state === "done" ? SG_CHECK_ICON : String(i + 1);
    const sub = s.querySelector(".shield-step-sub");
    if (sub) sub.textContent = state === "done" ? "Done" : state === "partial" ? "In progress" : "";
    const btn = s.querySelector(".shield-step-button");
    if (i === current) btn.setAttribute("aria-current", "step"); else btn.removeAttribute("aria-current");
  });
  // A connector turns blue once the step before it is done.
  lines.forEach((l, i) => l.classList.toggle("done", steps[i].classList.contains("done")));
}

// Called by a step's button: look at that step. Nothing about any
// step's state changes.
function sgStepGo(groupId, index) {
  const group = document.getElementById(groupId);
  group.dataset.current = index;
  sgStepsRender(group);
}

// Demo buttons: set the state of the step being viewed ("todo",
// "partial" or "done"), as if the person had cleared it, started filling
// it in, or finished it.
function sgStepSet(groupId, state) {
  const group = document.getElementById(groupId);
  group.querySelectorAll(".shield-step")[parseInt(group.dataset.current, 10)].dataset.state = state;
  sgStepsRender(group);
}


/* ---------- Menu (sidebar nav demo) ---------- */

// Called by onclick="sgSelectMenuItem(this)" — highlights the clicked
// nav item and un-highlights every other item in the same .shield-menu.
function sgSelectMenuItem(el) {
  const menu = el.closest(".shield-menu");
  menu.querySelectorAll(".shield-menu-item").forEach((i) => i.classList.remove("is-on"));
  el.classList.add("is-on");
}


/* ---------- Input — clearable / password reveal ---------- */

// Called by the × button inside a clearable input. Empties the input,
// refocuses it, and hides the × button itself (it's shown again by the
// input's own oninput handler the next time something is typed).
function sgClearInput(btn) {
  const input = btn.closest(".shield-input-wrap").querySelector("input");
  input.value = "";
  input.focus();
  btn.style.display = "none";
}

// The two Font Awesome glyphs the password toggle swaps between (Eye and
// Eye slash, from the Icons section), kept here so the toggle never falls
// back to an emoji that would break the one-icon-set rule.
const SG_EYE_SVG = '<svg class="shield-icon" width="15.75" height="14" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>';
const SG_EYE_SLASH_SVG = '<svg class="shield-icon" width="17.5" height="14" viewBox="0 0 640 512" fill="currentColor" aria-hidden="true"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/></svg>';

// Called by the eye button on a password field. Flips the input between
// type="password" (dots) and type="text" (plain), swaps the icon, and
// updates aria-pressed and the label so a screen reader hears the state.
function sgTogglePassword(btn) {
  const input = btn.closest(".shield-input-wrap").querySelector("input");
  const showing = input.type === "password";
  input.type = showing ? "text" : "password";
  btn.innerHTML = showing ? SG_EYE_SLASH_SVG : SG_EYE_SVG;
  btn.setAttribute("aria-pressed", showing);
  btn.setAttribute("aria-label", showing ? "Hide password" : "Show password");
}


/* ---------- File upload ----------
   The shield-upload-* styles live in components.css. */

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
    item.className = "shield-upload-item";
    const icon = document.createElement("span");
    icon.innerHTML = '<svg class="shield-icon" width="10.5" height="14" viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM120 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z"/></svg>';
    const name = document.createElement("span");
    name.className = "shield-upload-name";
    name.textContent = f.name;
    const size = document.createElement("span");
    size.className = "shield-upload-size";
    size.textContent = sgFormatFileSize(f.size);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove " + f.name);
    remove.className = "shield-upload-remove";
    remove.innerHTML = '<svg class="shield-icon" width="8.25" height="11" viewBox="0 0 384 512" fill="currentColor"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>';
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
// to fade out and remove itself after 3 seconds. The message goes in with
// textContent, never innerHTML: in a product the text may come from data,
// and this is the helper engineers copy.
function sgPushToast(type, msg) {
  const stack = document.querySelector(".shield-toast-stack");
  const id = "toast-" + ++sgToastId;
  const el = document.createElement("div");
  el.className = "shield-toast " + type;
  el.id = id;
  // The stack itself is role="status" aria-live="polite" (index.html), so
  // adding a toast to it is announced without stealing focus.
  const icon = type === "success"
    ? '<svg class="shield-icon" width="14" height="14" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/></svg>'
    : '<svg class="shield-icon" width="14" height="14" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c9.4-9.4 24.6-9.4 33.9 0l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
  el.innerHTML = icon;
  const text = document.createElement("span");
  text.textContent = msg;
  el.appendChild(text);
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .2s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 3000);
}


/* =====================================================================
   v0.8 additions (the v0.9 ARIA and version helpers are at the end)
   ===================================================================== */


/* ---------- Overlays: focus handling shared by Modal and Drawer ----------
   A dialog that opens must (1) take keyboard focus, (2) keep Tab inside
   itself, and (3) give focus back to whatever opened it when it closes.
   Those are the three jobs of the helpers below; the Tab and Escape key
   handling is in the page-wide keydown listener in the Modal section. */

// Every element inside `root` that a keyboard user can land on.
function sgFocusable(root) {
  const sel = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(sel)).filter((el) => el.offsetParent !== null);
}

// Opens a modal/drawer backdrop: remembers the button that was focused,
// shows the overlay, and moves focus onto the dialog itself (which gets
// tabindex="-1" so it can hold focus without becoming a Tab stop).
function sgOverlayOpen(overlay, panelSelector) {
  overlay._returnFocus = document.activeElement;
  overlay.classList.add("open");
  const panel = overlay.querySelector(panelSelector);
  if (panel) { panel.setAttribute("tabindex", "-1"); panel.focus(); }
}

// Closes it and returns focus to the remembered button.
function sgOverlayClose(overlay) {
  overlay.classList.remove("open");
  const back = overlay._returnFocus;
  overlay._returnFocus = null;
  if (back && back.focus) back.focus();
}


/* ---------- Drawer ---------- */

// Called by onclick="sgOpenDrawer('drawer-id')". Same idea as sgOpenModal.
function sgOpenDrawer(id) { sgOverlayOpen(document.getElementById(id), ".shield-drawer"); }

// Called by the × and Close buttons.
function sgCloseDrawer(id) { sgOverlayClose(document.getElementById(id)); }

// Clicking the dim area outside the drawer closes it (same rule as the modal).
function sgDrawerBackdropClick(e, id) {
  if (e.target === e.currentTarget) sgCloseDrawer(id);
}


/* ---------- Tooltip ----------
   Showing and hiding is pure CSS (:hover and :focus-within). The only
   JavaScript is the Escape key: a tooltip has to be dismissible without
   moving the pointer (WCAG 1.4.13). Escape adds .is-dismissed to any
   tooltip that is currently showing; it clears again when the pointer
   leaves or focus moves away, so the next hover works normally. */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".shield-tooltip, .shield-info-tip").forEach((t) => {
    if (t.matches(":hover, :focus-within")) t.classList.add("is-dismissed");
  });
});
["mouseout", "focusout"].forEach((type) => {
  document.addEventListener(type, (e) => {
    const t = e.target.closest && e.target.closest(".shield-tooltip, .shield-info-tip");
    if (t && !t.contains(e.relatedTarget)) t.classList.remove("is-dismissed");
  });
});


/* ---------- Popover ----------
   Click the trigger to open, click it again, click outside, or press
   Escape to close. Escape also puts focus back on the trigger. The
   trigger carries aria-expanded so screen readers hear the state. */

// Called by onclick="sgPopoverToggle(this)" on the trigger button.
function sgPopoverToggle(btn) {
  const root = btn.closest(".shield-popover");
  const wasOpen = root.classList.contains("open");
  sgPopoverCloseAll();
  if (!wasOpen) { root.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
}

// Called by a button inside the panel (e.g. "Got it") to close it and return focus.
function sgPopoverClose(el) {
  const root = el.closest(".shield-popover");
  const trigger = root.querySelector("[aria-expanded]");
  sgPopoverCloseAll();
  if (trigger) trigger.focus();
}

function sgPopoverCloseAll() {
  document.querySelectorAll(".shield-popover.open").forEach((p) => {
    p.classList.remove("open");
    const t = p.querySelector("[aria-expanded]");
    if (t) t.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".shield-popover")) sgPopoverCloseAll();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = document.querySelector(".shield-popover.open");
  if (!open) return;
  const trigger = open.querySelector("[aria-expanded]");
  sgPopoverCloseAll();
  if (trigger) trigger.focus();
});


/* ---------- Keyboard + label behavior for checkboxes and radios ----------
   The checkbox and radio are <span>s (see the Checkbox section), so the
   browser gives them no keyboard behavior for free. Three listeners add
   it for every one on the page that carries role="checkbox" / role=
   "radio" and tabindex:
     - Space toggles a checkbox or picks a radio.
     - Arrow keys move between the radios of one group (and pick them),
       the way native radio buttons work.
     - Clicking the label text (anywhere in .shield-check-row) acts like
       clicking the control. */
document.addEventListener("keydown", (e) => {
  const el = e.target;
  if (!(el instanceof Element)) return;
  if (e.key === " " && el.matches('.shield-checkbox[role="checkbox"], .shield-radio[role="radio"]')) {
    e.preventDefault();
    el.click();
    return;
  }
  if (el.matches('.shield-radio[role="radio"]') && ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) {
    e.preventDefault();
    const group = Array.from(document.querySelectorAll('.shield-radio[data-group="' + el.dataset.group + '"]'));
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = group[(group.indexOf(el) + step + group.length) % group.length];
    next.focus();
    next.click();
  }
});
document.addEventListener("click", (e) => {
  const row = e.target.closest(".shield-check-row");
  if (!row || row.classList.contains("disabled")) return;
  const control = row.querySelector(".shield-checkbox, .shield-radio");
  if (control && !control.contains(e.target)) control.click(); // control.click() bubbles back here, but then e.target is inside the control, so it stops
});


/* ---------- Keyboard support for Select, Tabs and Dropdown ----------
   Added in v0.8. Each is one delegated listener, so it works for every
   instance on the page without any extra attributes.
     Select:   Arrow Up/Down move a highlight through the visible options,
               Enter picks the highlighted one, Escape closes the list.
     Tabs:     Arrow Left/Right (and Home/End) move to and open the
               neighboring tab, the way a native tab list behaves.
     Dropdown: Escape closes it and returns focus to its button. */
document.addEventListener("keydown", (e) => {
  const search = e.target.closest && e.target.closest(".shield-select-search");
  if (search) {
    const root = search.closest(".shield-select");
    const visible = () => Array.from(root.querySelectorAll(".shield-select-option")).filter((o) => o.style.display !== "none");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!root.classList.contains("open")) sgSelectOpen(root.id);
      const opts = visible();
      if (!opts.length) return;
      const cur = opts.findIndex((o) => o.classList.contains("active"));
      opts.forEach((o) => o.classList.remove("active"));
      const next = e.key === "ArrowDown" ? (cur + 1) % opts.length : (cur - 1 + opts.length) % opts.length;
      opts[next].classList.add("active");
      opts[next].scrollIntoView({ block: "nearest" });
      // Tell the screen reader which option the highlight is on. Every option
      // needs an id for this; sgInitSelects gives one to any option without.
      if (opts[next].id) search.setAttribute("aria-activedescendant", opts[next].id);
    } else if (e.key === "Enter") {
      const active = root.querySelector(".shield-select-option.active");
      if (active && root.classList.contains("open")) { e.preventDefault(); sgSelectPick(root.id, active.dataset.value, active.dataset.label); active.classList.remove("active"); }
    } else if (e.key === "Escape") {
      sgSelectSetOpen(root, false);
    }
    return;
  }
  const tab = e.target.closest && e.target.closest('.shield-tab[role="tab"]');
  if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const tabs = Array.from(tab.parentNode.querySelectorAll('.shield-tab[role="tab"]'));
    const i = tabs.indexOf(tab);
    const next = e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
    return;
  }
  if (e.key === "Escape") {
    const open = document.querySelector(".shield-dropdown.open");
    if (open) {
      const t = open.querySelector("[aria-expanded]");
      sgDropdownCloseAll();
      if (t) t.focus();
    }
  }
});


/* ---------- Pagination ----------
   Markup is a <nav class="shield-pagination"> with data-total-pages,
   data-total and data-per-page. sgPaginationRender draws the buttons for
   a page: always the first and last page, the current page and one on
   each side, with an ellipsis for any gap. */

function sgPaginationRender(nav, page) {
  if (!nav) return;
  const pages = parseInt(nav.dataset.totalPages, 10);
  const per = parseInt(nav.dataset.perPage, 10);
  const total = parseInt(nav.dataset.total, 10);
  page = Math.min(Math.max(1, page), pages);
  nav.dataset.page = page;
  const show = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) show.push(i);
  let html = '<button type="button" class="shield-page" data-go="' + (page - 1) + '" aria-label="Previous page" onclick="sgPaginationGo(this)"' + (page === 1 ? " disabled" : "") + '>‹</button>';
  show.forEach((n, i) => {
    if (i > 0 && n - show[i - 1] > 1) html += '<span class="shield-page-ellipsis" aria-hidden="true">…</span>';
    html += '<button type="button" class="shield-page' + (n === page ? " is-on" : "") + '" data-go="' + n + '" aria-label="Page ' + n + '"' + (n === page ? ' aria-current="page"' : "") + ' onclick="sgPaginationGo(this)">' + n + "</button>";
  });
  html += '<button type="button" class="shield-page" data-go="' + (page + 1) + '" aria-label="Next page" onclick="sgPaginationGo(this)"' + (page === pages ? " disabled" : "") + '>›</button>';
  html += '<span class="shield-page-summary" aria-live="polite">' + ((page - 1) * per + 1) + "–" + Math.min(page * per, total) + " of " + total + "</span>";
  nav.innerHTML = html;
}

// Called by every page button. Redraws, then puts focus back on the
// button the user just used (the redraw replaced it), or on the current
// page if that button is now disabled.
function sgPaginationGo(btn) {
  const nav = btn.closest(".shield-pagination");
  const go = parseInt(btn.dataset.go, 10);
  sgPaginationRender(nav, go);
  const again = nav.querySelector('[data-go="' + go + '"]:not(:disabled)') || nav.querySelector(".shield-page.is-on");
  if (again) again.focus();
}


/* ---------- Table patterns: sort, select, bulk bar ----------
   The demo table carries data-bulk="id of its bulk bar" and, for the
   screen-reader announcement, data-live="id of a .shield-sr-only
   status element". Cells can carry data-value when the sort value is not
   the visible text (e.g. a number shown as "$1,200"). */

// Called by the .shield-sort button inside a <th>. Sorts the table body
// by that column (ascending first, then toggling) and updates aria-sort.
function sgTableSort(btn) {
  const th = btn.closest("th");
  const table = th.closest("table");
  const col = Array.from(th.parentNode.children).indexOf(th);
  const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
  table.querySelectorAll("th[aria-sort]").forEach((h) => h.setAttribute("aria-sort", "none"));
  th.setAttribute("aria-sort", dir);
  const value = (tr) => {
    const td = tr.children[col];
    const v = td.dataset.value !== undefined ? td.dataset.value : td.textContent.trim();
    return isNaN(parseFloat(v)) || !/^[-\d.]/.test(v) ? v.toLowerCase() : parseFloat(v);
  };
  const body = table.tBodies[0];
  const rows = Array.from(body.rows).sort((a, b) => {
    const x = value(a), y = value(b);
    const r = x < y ? -1 : x > y ? 1 : 0;
    return dir === "ascending" ? r : -r;
  });
  rows.forEach((r) => body.appendChild(r));
  const live = document.getElementById(table.dataset.live);
  if (live) live.textContent = "Sorted by " + btn.textContent.trim() + ", " + dir;
}

// A row checkbox was clicked: flip it, mark the row, refresh the header
// checkbox and the bulk bar.
function sgTableToggleRow(box) {
  sgToggleCheckbox(box);
  box.closest("tr").classList.toggle("is-selected", box.classList.contains("is-on"));
  sgTableRefresh(box.closest("table"));
}

// The header checkbox was clicked: select or clear every row.
function sgTableToggleAll(box) {
  const table = box.closest("table");
  const on = box.getAttribute("aria-checked") !== "true";
  table.querySelectorAll("tbody .shield-checkbox").forEach((b) => {
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-checked", on);
    b.innerHTML = on ? SG_CHECK_SVG : "";
    b.closest("tr").classList.toggle("is-selected", on);
  });
  sgTableRefresh(table);
}

// Recounts the selected rows, sets the header checkbox to checked / empty
// / mixed, and shows or hides the bulk bar with the count.
function sgTableRefresh(table) {
  const boxes = Array.from(table.querySelectorAll("tbody .shield-checkbox"));
  const n = boxes.filter((b) => b.classList.contains("is-on")).length;
  const head = table.querySelector("thead .shield-checkbox");
  if (head) {
    const all = n === boxes.length, none = n === 0;
    head.classList.toggle("is-on", !none);
    head.setAttribute("aria-checked", all ? "true" : none ? "false" : "mixed");
    head.innerHTML = all ? SG_CHECK_SVG : none ? "" : '<span style="display:block;width:8px;height:2px;background:#fff;border-radius:1px"></span>'; // dash = some, not all
  }
  const bar = document.getElementById(table.dataset.bulk);
  if (bar) {
    bar.hidden = n === 0;
    const count = bar.querySelector(".shield-bulk-count");
    if (count) count.textContent = n + " selected";
  }
}

// Clears the selection (the bulk bar's "Clear" button).
function sgTableClear(tableId) {
  const table = document.getElementById(tableId);
  table.querySelectorAll("tbody .shield-checkbox").forEach((b) => {
    b.classList.remove("is-on");
    b.setAttribute("aria-checked", "false");
    b.innerHTML = "";
    b.closest("tr").classList.remove("is-selected");
  });
  sgTableRefresh(table);
}


/* ---------- App shell: the nav drawer on narrow screens ---------- */

// Called by the menu button (and the dim area behind the open nav).
function sgShellToggle(el) {
  const shell = el.closest(".shield-shell");
  const open = shell.classList.toggle("nav-open");
  const btn = shell.querySelector(".shield-shell-toggle");
  if (btn) btn.setAttribute("aria-expanded", open);
}

// The guide's own sidebar does the same thing below 900px (see the
// .side rules in index.html). Called by the menu button in its top bar
// and by every sidebar link, so picking a section closes the menu.
function sgGuideNav(open) {
  document.body.classList.toggle("nav-open", open);
  const btn = document.querySelector(".m-top button");
  if (btn) btn.setAttribute("aria-expanded", open);
}


/* ---------- Responsive demo ----------
   A real iframe, so the page inside it measures its OWN width and the
   real @media rules from components.css run: that is why it is an
   iframe and not a resized box. The buttons set its width; the theme is
   sent to it with postMessage because it is a separate document. */

// Called by the Phone / Tablet / Desktop buttons (data-frame = iframe id, data-width).
function sgFrameSize(btn) {
  sgSegPick(btn);
  const frame = document.getElementById(btn.dataset.frame);
  frame.style.width = btn.dataset.width;
  const label = document.getElementById(btn.dataset.frame + "-label");
  if (label) label.textContent = btn.dataset.label;
}

// Sends the current theme to a demo iframe (also on its load event).
function sgFrameTheme(frame) {
  try { frame.contentWindow.postMessage({ type: "sg-theme", mode: document.documentElement.dataset.theme }, "*"); } catch {}
}


/* ---------- Motion "Try it" examples ---------- */

// Called by the Replay button in a Motion table row. Restarts every
// .sg-anim element in that row's .sg-try cell: clearing the animation and
// forcing a reflow makes the browser play the CSS animation again.
function sgReplayMotion(btn) {
  btn.closest(".sg-try").querySelectorAll(".sg-anim").forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
}

/* ---------- Engineer Mode ----------
   One switch (top of the sidebar) that reveals a code panel at the end of
   every section listed in SG_SNIPPETS (snippets.js). The panels are always
   in the page; CSS in index.html shows them only while <html
   data-engineer="on">. The choice is remembered in localStorage. */

const SG_ENGINEER_KEY = "sg-engineer-mode";

// Turns Engineer Mode on or off: flips the attribute CSS keys off, syncs
// the switch's own look and aria-checked, and remembers the choice (in a
// try/catch, same as the theme, in case localStorage is blocked).
function sgApplyEngineer(on) {
  document.documentElement.dataset.engineer = on ? "on" : "off";
  const sw = document.getElementById("engineer-switch");
  if (sw) { sw.classList.toggle("is-on", on); sw.setAttribute("aria-checked", on); }
  try { localStorage.setItem(SG_ENGINEER_KEY, on ? "on" : "off"); } catch {}
}

// Called by the switch: onclick="sgToggleEngineer()".
function sgToggleEngineer() { sgApplyEngineer(document.documentElement.dataset.engineer !== "on"); }

// Builds one code panel per SG_SNIPPETS entry whose section exists on the
// page and appends it to that section. Text goes in with textContent (not
// innerHTML), so the markup in a snippet is shown, not run.
function sgBuildCodeBlocks() {
  if (typeof SG_SNIPPETS === "undefined") return;
  Object.keys(SG_SNIPPETS).forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const snip = SG_SNIPPETS[id];
    const name = (section.querySelector("h2") || {}).firstChild ? section.querySelector("h2").firstChild.textContent.trim() : id;
    const panel = document.createElement("div");
    panel.className = "sg-code";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Code for " + name);

    const bar = document.createElement("div");
    bar.className = "sg-code-bar";
    const tabs = document.createElement("div");
    tabs.className = "shield-segmented";
    const panes = [["html", "HTML / CSS"], ["tokens", "Tokens"]];
    panes.forEach(([key, label], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.dataset.pane = key;
      if (i === 0) b.classList.add("is-on");
      b.setAttribute("onclick", "sgCodeTab(this)");
      tabs.appendChild(b);
    });
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "shield-button shield-button-default small sg-copy";
    copy.textContent = "Copy";
    copy.setAttribute("onclick", "sgCopyCode(this)");
    const status = document.createElement("span");
    status.className = "shield-sr-only";
    status.setAttribute("role", "status");
    bar.append(tabs, copy, status);
    panel.appendChild(bar);

    const mkPre = (key, text, hidden) => {
      const pre = document.createElement("pre");
      pre.className = "sg-pane";
      pre.dataset.pane = key;
      pre.tabIndex = 0;
      if (hidden) pre.hidden = true;
      const code = document.createElement("code");
      code.textContent = text;
      pre.appendChild(code);
      return pre;
    };
    panel.appendChild(mkPre("html", snip.html, false));
    panel.appendChild(mkPre("tokens", snip.tokens && snip.tokens.length ? snip.tokens.join("\n") : "/* No tokens: this section does not read any variables directly. */", true));
    section.appendChild(panel);
  });
}

// Called by the HTML / Tokens buttons: shows that pane, hides the others.
function sgCodeTab(btn) {
  sgSegPick(btn);
  const panel = btn.closest(".sg-code");
  panel.querySelectorAll(".sg-pane").forEach((p) => { p.hidden = p.dataset.pane !== btn.dataset.pane; });
}

// Called by the Copy button: copies the visible pane. navigator.clipboard
// only works on secure pages (https or localhost), so a hidden textarea +
// execCommand is the fallback for file:// and plain http.
function sgCopyCode(btn) {
  const panel = btn.closest(".sg-code");
  const text = panel.querySelector(".sg-pane:not([hidden])").textContent;
  const done = () => {
    btn.textContent = "Copied";
    panel.querySelector('[role="status"]').textContent = "Copied to clipboard";
    setTimeout(() => { btn.textContent = "Copy"; }, 1500);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => sgCopyFallback(text, done));
  } else {
    sgCopyFallback(text, done);
  }
}

function sgCopyFallback(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try { if (document.execCommand("copy")) done(); } catch {}
  ta.remove();
}

// Runs once at startup: build the panels, then apply the saved choice.
function sgInitEngineer() {
  sgBuildCodeBlocks();
  let on = false;
  try { on = localStorage.getItem(SG_ENGINEER_KEY) === "on"; } catch {}
  sgApplyEngineer(on);
}


/* ---------- Accessible names and ARIA wiring (v0.9) ----------
   Two safety nets that run once at load. The demo markup already carries
   the right attributes; these exist so a control that was copied without
   them still has a name and a role, and so the pattern is enforced in one
   place rather than remembered in forty.

   sgInitNames: a <label> element only names NATIVE form controls, so a
   <span role="checkbox"> inside <label class="shield-check-row"> has no
   accessible name on its own (WCAG 4.1.2 Name, Role, Value). For every
   checkbox / radio / switch in a .shield-check-row that has neither
   aria-label nor aria-labelledby, this gives the row's label text an id
   and points the control at it; a .shield-radio-desc line becomes its
   aria-describedby.

   sgInitSelects: the hand-rolled Select is a combobox (WAI-ARIA APG
   "Combobox with list autocomplete"). The search input gets
   role="combobox", aria-expanded, aria-controls and aria-autocomplete=
   "list"; the panel gets role="listbox" and an id; each option gets
   role="option", aria-selected and an id (so aria-activedescendant can
   point at it); group labels become role="presentation". */
let sgNameId = 0;
function sgInitNames() {
  document.querySelectorAll(".shield-check-row").forEach((row) => {
    const control = row.querySelector('[role="checkbox"], [role="radio"], [role="switch"]');
    if (!control || control.hasAttribute("aria-label") || control.hasAttribute("aria-labelledby")) return;
    // The label text is either a .shield-radio-text block (title + description) or the row's bare text nodes.
    const text = row.querySelector(".shield-radio-text");
    let labelEl;
    if (text) {
      labelEl = text.firstChild && text.firstChild.nodeType === Node.TEXT_NODE ? sgWrapText(text.firstChild) : text;
      const desc = text.querySelector(".shield-radio-desc");
      if (desc) { if (!desc.id) desc.id = "sg-desc-" + ++sgNameId; control.setAttribute("aria-describedby", desc.id); }
    } else {
      const node = Array.from(row.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (!node) return;
      labelEl = sgWrapText(node);
    }
    if (!labelEl.id) labelEl.id = "sg-name-" + ++sgNameId;
    control.setAttribute("aria-labelledby", labelEl.id);
  });
}
// Wraps a bare text node in a <span> so it can carry an id.
function sgWrapText(node) {
  const span = document.createElement("span");
  node.parentNode.insertBefore(span, node);
  span.appendChild(node);
  return span;
}
function sgInitSelects() {
  document.querySelectorAll(".shield-select").forEach((root) => {
    const search = root.querySelector(".shield-select-search");
    const panel = root.querySelector(".shield-select-panel");
    if (!search || !panel) return;
    if (!panel.id) panel.id = (root.id || "sg-select-" + ++sgNameId) + "-list";
    panel.setAttribute("role", "listbox");
    if (root.classList.contains("multiple")) panel.setAttribute("aria-multiselectable", "true");
    search.setAttribute("role", "combobox");
    search.setAttribute("aria-controls", panel.id);
    search.setAttribute("aria-autocomplete", "list");
    search.setAttribute("aria-expanded", root.classList.contains("open"));
    root.querySelectorAll(".shield-select-option").forEach((o, i) => {
      if (!o.id) o.id = panel.id + "-" + (o.dataset.value || i);
      o.setAttribute("role", "option");
      o.setAttribute("aria-selected", o.classList.contains("selected"));
    });
    root.querySelectorAll(".shield-select-group-label").forEach((g) => g.setAttribute("role", "presentation"));
    root.querySelectorAll(".shield-select-empty").forEach((g) => g.setAttribute("role", "presentation"));
  });
}


/* ---------- Version ----------
   The guide's version is written once here and stamped into every
   [data-sg-version] element (sidebar, cover badge, footer), so a release
   is one edit. Bump it by the rules in the "How this guide changes"
   section of index.html: patch for copy and fixes, minor for a new
   component, token or section, major for a renamed or removed token or
   class. Keep CHANGELOG.md in step. */
const SG_VERSION = "0.9.0";
function sgStampVersion() {
  document.querySelectorAll("[data-sg-version]").forEach((el) => { el.textContent = "v" + SG_VERSION; });
}


/* ---------- Startup ----------
   Everything above just defines functions — nothing runs until the lines
   below: apply the saved theme the moment the page loads, build the
   Engineer Mode code panels, draw the pagination demo, wire the ARIA
   safety nets, stamp the version, and make every sidebar link close the
   mobile menu. */
sgInitTheme();
sgInitEngineer();
sgInitNames();
sgInitSelects();
sgStampVersion();
document.querySelectorAll("[data-steps]").forEach(sgStepsRender);
sgPaginationRender(document.getElementById("pager-demo"), 1);
document.querySelectorAll(".side-nav a").forEach((a) => a.addEventListener("click", () => sgGuideNav(false)));
