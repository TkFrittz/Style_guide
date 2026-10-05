/* =====================================================================
   Shield Engineering — copy-paste snippets for Engineer Mode
   =====================================================================

   WHAT THIS FILE IS
   One entry per section of the guide, keyed by that section's id in
   index.html. When Engineer Mode is switched on (the toggle at the top of
   the sidebar), sgBuildCodeBlocks() in shield.js reads this object and
   adds a code panel to the end of each section with up to two tabs:

       html    the markup to paste, using the real shield- classes
       tokens  the tokens.css variables the component reads from

   HOW TO EDIT
   `node tools/check.mjs` checks every shield- class and every token named
   here against components.css and tokens.css, so a typo fails the check
   (and the GitHub Action that runs it). Where a snippet needs an icon it says
   "<!-- icon -->" instead of repeating a long SVG path: copy a real one
   from the Icons section. Handlers like onclick="sgToggleSwitch(this)"
   are plain-JS helpers defined in shield.js. Copy the function along with
   the markup, or replace it with your own state handling.
   ===================================================================== */

const SG_ICON_NOTE = "<!-- icon: copy an <svg class=\"shield-icon\"> from the Icons section -->";

const SG_SNIPPETS = {

  /* ------------------------------ Foundations ------------------------------ */

  color: {
    html: `/* Colors are CSS variables. They change with the theme on their own. */
.card   { background: var(--bg-container); border: 1px solid var(--border-secondary); }
.page   { background: var(--bg-layout); color: var(--text); }
.muted  { color: var(--text-tertiary); }
.link   { color: var(--brand-blue-dark); }          /* actions, links, focus rings */
.logo   { color: var(--brand-blue); }               /* logos and big graphics only */
.ok     { color: var(--success); background: var(--success-bg); border: 1px solid var(--success-border); }`,
    tokens: ["--blue-1 … --blue-10", "--brand-blue", "--brand-blue-dark", "--bg-container", "--bg-layout", "--bg-elevated", "--bg-spotlight", "--sider-bg", "--text", "--text-secondary", "--text-tertiary", "--text-quaternary", "--border", "--border-secondary", "--fill", "--fill-secondary", "--success", "--success-bg", "--success-border", "--warning", "--warning-bg", "--warning-border", "--error", "--error-bg", "--error-border", "--info", "--info-bg", "--info-border"],
  },

  typography: {
    html: `<h1 class="shield-title h1">Page title</h1>      <!-- h1 … h5 -->
<p class="shield-text">Default body copy</p>
<p class="shield-text secondary">Secondary: captions, helper text</p>
<p class="shield-text tertiary">Tertiary: placeholders, timestamps</p>
<b class="shield-text strong">Strong</b>
<span class="shield-text success">Success</span>   <!-- also warning, danger -->
<code class="shield-text code">order.status</code>`,
    tokens: ["--font-heading", "--font-body", "--font-mono", "--font-size-body", "--font-size-control", "--font-size-small", "--font-size-caption", "--weight-small"],
  },

  spacing: {
    html: `.stack > * + * { margin-top: var(--space-4); }   /* 16px between siblings */
.panel   { padding: var(--space-6); border-radius: var(--radius-lg); }
.chip    { padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); }
.switch  { border-radius: var(--radius-full); }`,
    tokens: ["--space-1 … --space-8", "--radius-xs", "--radius-sm", "--radius-md", "--radius-lg", "--radius-full"],
  },

  shadow: {
    html: `.resting  { box-shadow: var(--shadow-sm); }   /* cards, stat tiles */
.floating { box-shadow: var(--shadow-md); }   /* modals, dropdowns, popovers */`,
    tokens: ["--shadow-sm", "--shadow-md"],
  },

  motion: {
    html: `/* Pick the duration by what is changing. Never type seconds. */

/* Small change in place: hover, focus, checked, chevron turn */
.my-control {
  transition: background-color var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}

/* Row hover tint: feels immediate */
.my-row { transition: background-color var(--duration-instant) var(--ease-standard); }

/* Fades up into view: modal, toast (fadeUp is defined in tokens.css) */
.my-dialog { animation: fadeUp var(--duration-base) var(--ease-standard) both; }

/* Slides or scales in: popover, drawer (fast start, soft landing) */
.my-panel  { animation: fadeUp var(--duration-base) var(--ease) both; }

/* Animate color, opacity, shadow and transform only. Not width, height,
   margin, top or left: neighbors jump. */

/* tokens.css already shortens every animation for people who ask their
   OS for reduced motion. Do not undo it. */`,
    tokens: ["--duration-instant", "--duration-fast", "--duration-base", "--duration-slow", "--duration-spin", "--duration-shimmer", "--ease-standard", "--ease"],
  },

  icons: {
    html: `<!-- Font Awesome Solid, inlined, filled with currentColor so it matches the text -->
<svg class="shield-icon" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
  <path d="…path data copied exactly from Font Awesome…"/>
</svg>
<!-- Size by width/height, keep the viewBox. Never redraw an icon. -->`,
    tokens: [],
  },

  logo: {
    html: `<img src="source_images/Shield_Engineering_Icon.png"
     alt="Shield Engineering" width="56" height="56">

.logo-lockup { display: flex; align-items: center; gap: var(--space-3); }
.logo-lockup span { font-family: var(--font-heading); font-weight: 700; color: var(--text); }`,
    tokens: ["--font-heading", "--brand-blue"],
  },

  layout: {
    html: `<!-- 24-unit grid. Set widths per breakpoint with --col-xs/sm/md/lg/xl. -->
<div class="shield-row">
  <div class="shield-col" style="--col-xs:100%; --col-md:50%"> … </div>
  <div class="shield-col" style="--col-xs:100%; --col-md:50%"> … </div>
</div>

<div class="shield-space" style="gap:8px"> <button …>One</button> <button …>Two</button> </div>
<div class="shield-space vertical" style="gap:8px"> … </div>
<hr class="shield-divider">
<div class="shield-divider-labeled"><span></span><span class="shield-text secondary">or</span><span></span></div>`,
    tokens: ["--col-xs … --col-xl (set per element)", "--space-2", "--space-4", "--border-secondary"],
  },

  responsive: {
    html: `<div class="shield-shell">
  <aside class="shield-shell-side"> <!-- navigation (a .shield-menu) --> </aside>
  <div class="shield-shell-scrim" onclick="sgShellToggle(this)"></div>
  <div class="shield-shell-main">
    <header class="shield-shell-top">
      <button class="shield-button shield-button-default shield-shell-toggle"
              aria-label="Open navigation" aria-expanded="false" onclick="sgShellToggle(this)">Menu</button>
      <h1 class="shield-title h4">Page title</h1>
    </header>
    <main class="shield-shell-content"> … </main>
  </div>
</div>

<!-- Wide tables: wrap in .shield-table-scroll. KPI tiles: .shield-stats tiles are content-sized and wrap on their own. -->`,
    tokens: ["--sider-bg", "--border-secondary", "--scrim", "--z-drawer", "--duration-base", "--ease"],
  },

  /* ------------------------------ General ------------------------------ */

  button: {
    html: `<button class="shield-button shield-button-primary">Save</button>
<button class="shield-button shield-button-default">Cancel</button>
<button class="shield-button shield-button-dashed">Add</button>
<button class="shield-button shield-button-text">Dismiss</button>
<button class="shield-button shield-button-link">Learn more</button>
<button class="shield-button shield-button-danger">Delete</button>
<button class="shield-button shield-button-default shield-button-danger">Delete (quiet)</button>

<button class="shield-button shield-button-primary small">Small</button>   <!-- 24px -->
<button class="shield-button shield-button-primary large">Large</button>   <!-- 40px -->
<button class="shield-button shield-button-primary block">Full width</button>
<button class="shield-button shield-button-primary" disabled>Disabled</button>

<!-- Icon-only buttons need a label for screen readers -->
<button class="shield-button shield-button-default" aria-label="Edit order"><!-- icon --></button>`,
    tokens: ["--brand-fill", "--blue-9", "--error-fill", "--error-fill-hover", "--error", "--error-border", "--border", "--text", "--bg-container", "--font-size-control", "--duration-fast"],
  },

  /* ------------------------------ Data entry ------------------------------ */

  input: {
    html: `<span class="shield-input-wrap">
  <input class="shield-input" placeholder="Type here">
</span>

<!-- With an icon inside -->
<span class="shield-input-wrap">
  <span class="shield-input-icon prefix"><!-- icon --></span>
  <input class="shield-input has-prefix" placeholder="Search partner groups…">
</span>

<!-- Error: add .error and .has-suffix to the input and the red icon as a second cue, and ALWAYS
     the message in text under the field, pointed to by aria-describedby (WCAG 3.3.1). Say what to enter. -->
<span class="shield-input-wrap">
  <input class="shield-input error has-suffix" value="invalid@" aria-invalid="true" aria-describedby="email-err">
  <span class="shield-input-error-icon" aria-hidden="true"><svg class="shield-icon"><!-- close-circle icon --></svg></span>
</span>
<div class="shield-field-hint bad" id="email-err"><span class="shield-sr-only">Error: </span>Enter an email address in the form name@firm.com.</div>

<!-- Password: the eye is a real <button> (name, focus ring, keyboard for free); sgTogglePassword swaps the icon and aria-pressed -->
<span class="shield-input-wrap">
  <input class="shield-input has-suffix" type="password" id="pw">
  <button type="button" class="shield-input-icon suffix clearable" aria-label="Show password" aria-pressed="false" aria-controls="pw" onclick="sgTogglePassword(this)"><!-- icon: Eye --></button>
</span>

<textarea class="shield-textarea" placeholder="Notes…"></textarea>
<span class="shield-input-wrap" style="width:120px"><input class="shield-input" type="number" min="0" step="1"></span>`,
    tokens: ["--bg-container", "--border", "--blue-5", "--brand-blue", "--brand-tint", "--error-solid", "--error-tint", "--radius-md", "--font-size-control"],
  },

  select: {
    html: `<!-- A combobox (WAI-ARIA APG pattern): the input carries role, aria-expanded and aria-controls,
     the panel is the listbox, each option has role="option", aria-selected and an id.
     shield.js keeps aria-expanded, aria-selected and aria-activedescendant in step as you type. -->
<div class="shield-select" id="sel-1">
  <div class="shield-select-box">
    <input class="shield-select-search" role="combobox" aria-expanded="false" aria-controls="sel-1-list" aria-autocomplete="list"
           placeholder="Select a catalog…" autocomplete="off"
           oninput="sgSelectFilter('sel-1', this)" onfocus="sgSelectOpen('sel-1')" onclick="sgSelectOpen('sel-1')">
    <span class="shield-select-arrow"><!-- icon --></span>
  </div>
  <div class="shield-select-panel" id="sel-1-list" role="listbox">
    <div class="shield-select-group-label" role="presentation">Business contacts</div>
    <div class="shield-select-option" id="sel-1-list-mt" role="option" aria-selected="false" data-value="mt" data-label="Mass Tort Intake"
         onmousedown="event.preventDefault();sgSelectPick('sel-1','mt','Mass Tort Intake')">Mass Tort Intake</div>
    <div class="shield-select-empty" role="presentation" style="display:none">No matches</div>
  </div>
</div>
<!-- Multiple: add class "multiple" to .shield-select (the listbox gets aria-multiselectable) and use .shield-select-tag chips. -->`,
    tokens: ["--bg-elevated", "--border-secondary", "--shadow-md", "--radius-lg", "--selected-bg", "--brand-blue-dark", "--brand-tint", "--z-dropdown"],
  },

  checkbox: {
    html: `<!-- A <label> only names NATIVE inputs, so the span control needs aria-labelledby pointing at its text
     (WCAG 4.1.2). sgInitNames in shield.js adds it for any row that forgot, but write it in. -->
<label class="shield-check-row">
  <span class="shield-checkbox" role="checkbox" tabindex="0" aria-checked="false" aria-labelledby="lbl-copy" onclick="sgToggleCheckbox(this)"></span>
  <span id="lbl-copy">Send me a copy</span>
</label>

<label class="shield-check-row">
  <span class="shield-radio is-on" role="radio" tabindex="0" aria-checked="true" aria-labelledby="lbl-standard" data-group="ship" onclick="sgSelectRadio(this)"></span>
  <span id="lbl-standard">Standard shipping</span>
</label>

<button type="button" class="shield-switch-track is-on" role="switch" aria-checked="true"
        aria-label="Email notifications" onclick="sgToggleSwitch(this)"><span class="shield-switch-thumb"></span></button>

<div class="shield-segmented" role="group" aria-label="View">
  <button type="button" class="is-on" aria-pressed="true" onclick="sgSegPick(this)">List</button>
  <button type="button" aria-pressed="false" onclick="sgSegPick(this)">Grid</button>
</div>`,
    tokens: ["--brand-fill", "--border", "--bg-container", "--fill-tertiary", "--text-quaternary", "--radius-full"],
  },

  radio: {
    html: `<div class="shield-radio-group" role="radiogroup" aria-label="Delivery method">
  <label class="shield-check-row has-desc">
    <span class="shield-radio is-on" role="radio" tabindex="0" aria-checked="true" aria-labelledby="lbl-std" aria-describedby="desc-std" data-group="delivery" onclick="sgSelectRadio(this)"></span>
    <span class="shield-radio-text"><span id="lbl-std">Standard</span><span class="shield-radio-desc" id="desc-std">Delivered within 5 business days.</span></span>
  </label>
  <label class="shield-check-row has-desc">
    <span class="shield-radio" role="radio" tabindex="-1" aria-checked="false" aria-labelledby="lbl-exp" aria-describedby="desc-exp" data-group="delivery" onclick="sgSelectRadio(this)"></span>
    <span class="shield-radio-text"><span id="lbl-exp">Expedited</span><span class="shield-radio-desc" id="desc-exp">Next business day.</span></span>
  </label>
</div>
<!-- Row layout: add class "horizontal" to .shield-radio-group. -->`,
    tokens: ["--brand-fill", "--border", "--text-tertiary", "--font-size-caption"],
  },

  datepicker: {
    html: `<!-- Native HTML date input (MDN: <input type="date">). Nothing to install.
     People see MM/DD/YYYY; your code reads the value as YYYY-MM-DD.
     min, max and required work as on any input. -->
<span class="shield-input-wrap" style="width:180px">
  <input class="shield-input" type="date" aria-label="Effective date"
         value="2026-10-05" min="2026-01-01" max="2030-12-31">
</span>

<!-- Range -->
<span class="shield-date-range">
  <input class="shield-input" type="date" aria-label="From">
  <span class="shield-text tertiary">to</span>
  <input class="shield-input" type="date" aria-label="To">
</span>`,
    tokens: ["--bg-container", "--border", "--radius-md"],
  },

  upload: {
    html: `<input type="file" id="upload-input" class="shield-upload-input" multiple onchange="sgHandleUpload(this)">
<label for="upload-input" class="shield-upload-dropzone"
       ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')"
       ondrop="sgHandleDrop(event,this)">
  <!-- icon -->
  <span class="shield-upload-title">Click or drag files to this area to upload</span>
  <span class="shield-upload-hint">Retainer agreements, PDFs, up to 25MB each.</span>
</label>
<div class="shield-upload-list" id="upload-list"></div>`,
    tokens: ["--border", "--brand-blue", "--selected-bg", "--bg-container", "--text-tertiary", "--error"],
  },

  forms: {
    html: `<!-- Required field: red asterisk in the label (visual only, aria-hidden), plus the
     HTML "required" attribute on the input so screen readers announce it as required.
     Error field: add aria-invalid="true" on the input and the .error class. -->
<form class="shield-form two">
  <div class="shield-field">
    <label class="shield-field-label" for="f-name"><span class="shield-field-required" aria-hidden="true">*</span>Partner group name</label>
    <span class="shield-input-wrap"><input class="shield-input" id="f-name" required aria-describedby="f-name-hint"></span>
    <div class="shield-field-hint" id="f-name-hint">Legal entity name. Roles are assigned per offer, not here.</div>
  </div>
  <div class="shield-field">
    <label class="shield-field-label" for="f-email">Primary contact email</label>
    <span class="shield-input-wrap">
      <input class="shield-input error has-suffix" id="f-email" type="email" aria-invalid="true" aria-describedby="f-email-hint">
      <span class="shield-input-error-icon" aria-hidden="true"><svg class="shield-icon"><!-- close-circle icon --></svg></span>
    </span>
    <div class="shield-field-hint bad" id="f-email-hint"><span class="shield-sr-only">Error: </span>Enter an email address in the form name@firm.com.</div>
  </div>
  <div class="shield-field span-all">
    <label class="shield-field-label" for="f-notes">Notes</label>
    <textarea class="shield-textarea" id="f-notes"></textarea>
  </div>
  <div class="shield-form-actions span-all">
    <button type="button" class="shield-button shield-button-default">Cancel</button>
    <button type="submit" class="shield-button shield-button-primary">Onboard partner group</button>
  </div>
</form>`,
    tokens: ["--font-size-small", "--font-size-caption", "--error", "--warning", "--text-tertiary", "--space-4", "--space-5"],
  },

  /* ------------------------------ Data display ------------------------------ */

  tag: {
    html: `<span class="shield-tag">Mass Tort <button aria-label="Remove Mass Tort" onclick="sgRemoveTag(this)">×</button></span>
<span class="shield-tag success">Active</span>      <!-- warning | error | processing | gold -->
<span class="shield-tag checkable checked" onclick="sgToggleCheckableTag(this)">Consumer Finance</span>

<span class="shield-pill success"><!-- icon -->Synced</span>   <!-- warning | neutral -->`,
    tokens: ["--success", "--success-bg", "--success-border", "--warning", "--error", "--info", "--gold", "--gold-bg", "--gold-border", "--radius-sm"],
  },

  avatar: {
    html: `<span class="shield-avatar" style="width:32px;height:32px;font-size:13px">JT</span>

<!-- Dot: needs attention (no number) -->
<span class="shield-badge-wrap"><span class="shield-avatar" style="width:32px;height:32px">JT</span><span class="shield-badge-dot"></span></span>

<!-- Count, inline after a label -->
<span class="shield-text">Notifications</span><span class="shield-badge-count">3</span>

<!-- Count on a corner (cap at 99+) -->
<span class="shield-badge-wrap"><button class="shield-button shield-button-default" aria-label="Inbox, 12 unread"><!-- icon --></button><span class="shield-badge-count corner" aria-hidden="true">12</span></span>

<!-- State in a list: the word carries the meaning, the dot reinforces it -->
<span class="shield-status success">Active</span>   <!-- warning | error | info -->`,
    tokens: ["--brand-fill", "--error", "--error-bg", "--fill-secondary", "--text-secondary"],
  },

  card: {
    html: `<div class="shield-card bordered-shadow">
  <div class="shield-card-head"><span>Consumer Finance</span></div>
  <div class="shield-card-body">Content</div>
</div>
<!-- Plain: omit "bordered-shadow".   Compact: add "small". -->`,
    tokens: ["--bg-container", "--border-secondary", "--shadow-sm", "--radius-lg"],
  },

  table: {
    html: `<div class="shield-table-scroll">
  <table class="shield-table">
    <thead><tr><th>Order</th><th>Partner group</th><th>Status</th></tr></thead>
    <tbody>
      <tr class="clickable"><td>ORD-501</td><td>Harlow &amp; Vance</td><td><span class="shield-tag success">Active</span></td></tr>
    </tbody>
  </table>
</div>

<!-- Numbers and money: .num on the header and the cells (right-aligned, tabular figures) -->
<th class="num">Value</th>  …  <td class="num" data-value="48200">$48,200</td>

<!-- Sortable header -->
<th aria-sort="none"><button class="shield-sort" onclick="sgTableSort(this)">Order</button></th>
<!-- Selectable row: first cell holds a checkbox; the <tr> gets .is-selected -->
<td class="shield-table-select"><span class="shield-checkbox" role="checkbox" tabindex="0" aria-checked="false" aria-label="Select ORD-501" onclick="sgTableToggleRow(this)"></span></td>
<!-- Bulk bar above the table -->
<div class="shield-bulk-bar" hidden><span class="shield-bulk-count" aria-live="polite">2 selected</span> <button class="shield-button shield-button-default small">Export</button></div>`,
    tokens: ["--border-secondary", "--fill-quaternary", "--fill-secondary", "--text-tertiary", "--font-size-small", "--duration-instant"],
  },

  descriptions: {
    html: `<!-- A real definition list: the label/value pairing is in the markup. -->
<dl class="shield-description">
  <div class="shield-description-row">
    <dt class="shield-description-label">Order ID</dt>
    <dd class="shield-description-value">ORD-501</dd>
  </div>
  <div class="shield-description-row">
    <dt class="shield-description-label">Created</dt>
    <dd class="shield-description-value"><time datetime="2026-09-12">Sep 12, 2026</time></dd>
  </div>
</dl>`,
    tokens: ["--border-secondary", "--text-tertiary"],
  },

  timeline: {
    html: `<div class="shield-timeline">
  <div class="shield-timeline-item">
    <div class="shield-timeline-content"><b class="shield-text strong">Offer created</b> · <span class="shield-text tertiary">Sep 12, 2026, 9:04 AM</span></div>
  </div>
</div>`,
    tokens: ["--border-secondary", "--brand-blue-dark", "--text-tertiary"],
  },

  statistic: {
    html: `<div class="shield-stats">
  <div class="shield-stat highlighted">
    <div class="shield-stat-label">Active orders</div>
    <div class="shield-stat-value">128</div>
    <div class="shield-stat-sub">+12 this week</div>
  </div>
  <div class="shield-stat"><div class="shield-stat-label">Conversion rate</div><div class="shield-stat-value positive">34<small>%</small></div></div>
</div>`,
    tokens: ["--bg-container", "--border-secondary", "--shadow-sm", "--success", "--error"],
  },

  /* ------------------------------ Feedback ------------------------------ */

  alert: {
    html: `<div class="shield-alert error" role="alert">
  <span class="shield-alert-icon"><!-- icon --></span>
  <div class="shield-alert-body">
    <div class="shield-alert-title">Unable to save changes</div>
    <div class="shield-alert-description">Check the highlighted fields and try again.</div>
  </div>
  <button class="shield-alert-close" aria-label="Dismiss" onclick="sgDismissAlert(this)">×</button>
</div>
<!-- Moods: info | success | warning | error -->`,
    tokens: ["--info-bg", "--success-bg", "--warning-bg", "--error-bg", "--info-border", "--radius-md"],
  },

  modal: {
    html: `<button class="shield-button shield-button-default" onclick="sgOpenModal('my-modal')">Open modal</button>

<div class="shield-modal-backdrop" id="my-modal" onmousedown="sgModalBackdropClick(event,'my-modal')">
  <div class="shield-modal" role="dialog" aria-modal="true" aria-labelledby="my-modal-title">
    <div class="shield-modal-head">
      <h3 id="my-modal-title">Assign role contact</h3>
      <button class="shield-modal-close" aria-label="Close" onclick="sgCloseModal('my-modal')">×</button>
    </div>
    <div class="shield-modal-body">Pick who handles business and technical contact for this offer.</div>
    <div class="shield-modal-foot">
      <button class="shield-button shield-button-default" onclick="sgCloseModal('my-modal')">Cancel</button>
      <button class="shield-button shield-button-primary" onclick="sgCloseModal('my-modal')">Save</button>
    </div>
  </div>
</div>
<!-- Wider (720px): class="shield-modal wide" -->`,
    tokens: ["--bg-elevated", "--shadow-md", "--radius-lg", "--scrim", "--z-modal", "--duration-base"],
  },

  drawer: {
    html: `<button class="shield-button shield-button-default" onclick="sgOpenDrawer('my-drawer')">View details</button>

<div class="shield-drawer-backdrop" id="my-drawer" onmousedown="sgDrawerBackdropClick(event,'my-drawer')">
  <aside class="shield-drawer" role="dialog" aria-modal="true" aria-labelledby="my-drawer-title">
    <div class="shield-drawer-head">
      <h3 id="my-drawer-title">ORD-501</h3>
      <button class="shield-drawer-close" aria-label="Close" onclick="sgCloseDrawer('my-drawer')">×</button>
    </div>
    <div class="shield-drawer-body"> … </div>
    <div class="shield-drawer-foot">
      <button class="shield-button shield-button-default" onclick="sgCloseDrawer('my-drawer')">Close</button>
    </div>
  </aside>
</div>`,
    tokens: ["--bg-elevated", "--shadow-md", "--scrim", "--z-drawer", "--duration-base", "--ease"],
  },

  empty: {
    html: `<!-- Three kinds, different words: nothing yet / no matches / cannot show. Title, reason, one action. -->
<div class="shield-empty">
  <!-- icon -->
  <div class="shield-empty-title">No orders match these filters</div>
  <div class="shield-empty-description">Try a wider date range, or clear the filters to see all 118 orders.</div>
  <div class="shield-empty-action"><button class="shield-button shield-button-default small">Clear filters</button></div>
</div>`,
    tokens: ["--text", "--text-tertiary", "--font-heading", "--space-4"],
  },

  skeleton: {
    html: `<span class="shield-skeleton" style="width:60%;height:20px"></span>
<span class="shield-spinner"></span>
<span class="shield-spinner" style="width:32px;height:32px;border-width:3px"></span>
<!-- Inside a button the spinner takes the button's text color. -->`,
    tokens: ["--fill-secondary", "--duration-spin", "--duration-shimmer"],
  },

  toast: {
    html: `<!-- one stack per page, just before </body>; it is the live region, so each toast is announced -->
<div class="shield-toast-stack" role="status" aria-live="polite"></div>

<script>
  sgPushToast("success", "Order activated.");   // or "error"; disappears after 3 seconds
</script>`,
    tokens: ["--bg-elevated", "--shadow-md", "--success", "--error", "--z-toast"],
  },

  tooltip: {
    html: `<!-- Short, non-interactive hint on hover or keyboard focus -->
<span class="shield-tooltip">
  <button class="shield-button shield-button-default" aria-describedby="tip-save">Save</button>
  <span class="shield-tooltip-body" id="tip-save" role="tooltip">Saves as a draft. Nothing is sent to the partner group.</span>
</span>
<!-- Not focusable on its own? give the wrapper tabindex="0". Modifiers: "top", "end". -->

<!-- Info icon next to a page title (the page-header pattern) -->
<span class="shield-info-tip" tabindex="0" aria-label="More information" aria-describedby="tip-page">
  <!-- icon: Info circle -->
  <span class="shield-info-tip-body" id="tip-page" role="tooltip">All external partner groups must be pre-onboarded before they can be added to an offer.</span>
</span>`,
    tokens: ["--bg-spotlight", "--bg-container", "--shadow-md", "--radius-lg", "--z-tooltip", "--duration-fast"],
  },

  popover: {
    html: `<span class="shield-popover" id="pop-1">
  <button class="shield-button shield-button-default" aria-expanded="false" aria-controls="pop-1-panel"
          onclick="sgPopoverToggle(this)">Why is this locked?</button>
  <div class="shield-popover-panel" id="pop-1-panel" role="dialog" aria-label="Why is this locked?">
    <h4 class="shield-popover-title">Frozen after signature</h4>
    <div class="shield-popover-body">Signed offers cannot be edited. Create a change request to propose edits.</div>
    <div class="shield-popover-actions">
      <button class="shield-button shield-button-default small" onclick="sgPopoverClose(this)">Got it</button>
      <button class="shield-button shield-button-primary small">Create change request</button>
    </div>
  </div>
</span>
<!-- Modifiers on .shield-popover: "end" (right-align), "top" (open upward). -->`,
    tokens: ["--bg-elevated", "--border-secondary", "--shadow-md", "--radius-lg", "--z-dropdown", "--duration-base"],
  },

  /* ------------------------------ Navigation ------------------------------ */

  steps: {
    html: `<!-- Each step keeps its own state. Which step is being viewed is marked by .current only.
     done    = finished (checkmark)
     partial = started, not finished (half-filled dot). No counts: a step can hold any number of fields.
     (none)  = not started -->
<div class="shield-steps">
  <div class="shield-step done">
    <button type="button" class="shield-step-button clickable">
      <span class="shield-step-dot"><!-- check icon --></span>
      <span class="shield-step-text"><span class="shield-step-title">Documentation</span><span class="shield-step-sub">Done</span></span>
    </button>
  </div>
  <span class="shield-step-line done"></span>
  <div class="shield-step current">
    <button type="button" class="shield-step-button clickable" aria-current="step">
      <span class="shield-step-dot">2</span>
      <span class="shield-step-text"><span class="shield-step-title">Internal review</span></span>
    </button>
  </div>
  <span class="shield-step-line"></span>
  <div class="shield-step partial">
    <button type="button" class="shield-step-button clickable">
      <span class="shield-step-dot">3</span>
      <span class="shield-step-text"><span class="shield-step-title">Partner signature</span><span class="shield-step-sub">In progress</span></span>
    </button>
  </div>
</div>
<!-- Dots only: add class "compact" to .shield-steps -->`,
    tokens: ["--brand-fill", "--brand-blue-dark", "--brand-tint", "--brand-tint-strong", "--border", "--bg-container", "--text", "--text-tertiary"],
  },

  tabs: {
    html: `<!-- WAI-ARIA tabs: each tab controls its panel, each panel is labelled by its tab. Automatic activation. -->
<div class="shield-tabs-bar" id="tabs-1" role="tablist" aria-label="Offer sections">
  <button class="shield-tab is-on" role="tab" id="tab-a" aria-selected="true" aria-controls="panel-a" data-tab="a" onclick="sgShowTab('tabs-1','a')">Pipeline</button>
  <button class="shield-tab" role="tab" id="tab-b" aria-selected="false" aria-controls="panel-b" tabindex="-1" data-tab="b" onclick="sgShowTab('tabs-1','b')">Documents</button>
</div>
<div class="shield-tab-panel">
  <div role="tabpanel" id="panel-a" aria-labelledby="tab-a" tabindex="0" data-tabpanel-group="tabs-1" data-tabpanel="a">Offer stages and the current gate.</div>
  <div role="tabpanel" id="panel-b" aria-labelledby="tab-b" tabindex="0" data-tabpanel-group="tabs-1" data-tabpanel="b" hidden>Retainer agreements.</div>
</div>`,
    tokens: ["--brand-blue-dark", "--border-secondary"],
  },

  collapse: {
    html: `<details class="shield-collapse-item" open>
  <summary>What happens when a change request is approved?</summary>
  <div class="shield-collapse-body">The offer clones into a new priced version.</div>
</details>`,
    tokens: ["--border-secondary", "--text-tertiary"],
  },

  dropdown: {
    html: `<!-- WAI-ARIA menu button: the trigger says it opens a menu, the panel IS the menu.
     shield.js adds Down/Enter to open on the first item, Up/Down/Home/End inside, Escape to close. -->
<div class="shield-dropdown">
  <button class="shield-button shield-button-default" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-1" onclick="sgDropdownToggle(this)">Actions <!-- icon --></button>
  <div class="shield-dropdown-panel" id="menu-1" role="menu" aria-label="Offer actions">
    <button class="shield-dropdown-item" role="menuitem">Duplicate offer</button>
    <hr class="shield-divider" role="separator" style="margin:4px 0">
    <button class="shield-dropdown-item danger" role="menuitem">Cancel offer</button>
  </div>
</div>`,
    tokens: ["--bg-elevated", "--border-secondary", "--shadow-md", "--error", "--z-dropdown"],
  },

  menu: {
    html: `<nav class="shield-menu" aria-label="Main">
  <div class="shield-menu-group-label">Platform</div>
  <button class="shield-menu-item is-on" aria-current="page" onclick="sgSelectMenuItem(this)">
    <span class="shield-menu-item-main"><!-- icon -->Product Catalog</span>
    <span class="shield-badge-count">12</span>
  </button>
</nav>`,
    tokens: ["--sider-bg", "--selected-bg", "--brand-blue-dark", "--fill-secondary"],
  },

  breadcrumb: {
    html: `<nav class="shield-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="#">Partners</a></li>
    <li><a href="#">Harlow &amp; Vance</a></li>
    <li aria-current="page">Contacts</li>
  </ol>
</nav>`,
    tokens: ["--text-secondary", "--text-tertiary", "--brand-blue-dark"],
  },

  pagination: {
    html: `<nav class="shield-pagination" id="pager-1" aria-label="Pagination"
     data-total-pages="12" data-total="118" data-per-page="10"></nav>
<script>sgPaginationRender(document.getElementById("pager-1"), 1);</script>

<!-- sgPaginationRender draws markup like this (page 1 of 12 shown): -->
<nav class="shield-pagination" aria-label="Pagination">
  <button class="shield-page" data-go="0" aria-label="Previous page" disabled>‹</button>
  <button class="shield-page is-on" data-go="1" aria-label="Page 1" aria-current="page" onclick="sgPaginationGo(this)">1</button>
  <button class="shield-page" data-go="2" aria-label="Page 2" onclick="sgPaginationGo(this)">2</button>
  <span class="shield-page-ellipsis" aria-hidden="true">…</span>
  <button class="shield-page" data-go="12" aria-label="Page 12" onclick="sgPaginationGo(this)">12</button>
  <button class="shield-page" data-go="2" aria-label="Next page" onclick="sgPaginationGo(this)">›</button>
  <span class="shield-page-summary" aria-live="polite">1–10 of 118</span>
</nav>`,
    tokens: ["--brand-fill", "--fill-secondary", "--text-tertiary", "--text-quaternary", "--radius-md"],
  },

};
