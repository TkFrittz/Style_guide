/* Shield Legal — shared interactivity for the style guide and dashboard example.
   Vanilla JS, no dependencies. Each helper mirrors the real interaction Ant Design's own component defines. */

function sgToggleClass(el, cls){ el.classList.toggle(cls); }

/* Checkbox */
function sgToggleCheckbox(el){
  if (el.classList.contains('disabled')) return;
  const on = el.classList.toggle('on');
  if (!el.querySelector('svg')) {
    el.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4 4 8-8"/></svg>';
  }
}

/* Radio — exactly one "on" within the same data-group */
function sgSelectRadio(el){
  const group = el.dataset.group;
  document.querySelectorAll('.radio[data-group="' + group + '"]').forEach(r => r.classList.remove('on'));
  el.classList.add('on');
}

/* Switch */
function sgToggleSwitch(el){
  if (el.classList.contains('disabled')) return;
  el.classList.toggle('on');
}

/* Select — one open panel at a time */
function sgToggleSelect(id){
  const box = document.getElementById(id);
  const wasOpen = box.classList.contains('open');
  document.querySelectorAll('.selectbox.open').forEach(b => b.classList.remove('open'));
  if (!wasOpen) box.classList.add('open');
}
function sgPickOption(id, value, label){
  const box = document.getElementById(id);
  box.querySelectorAll('.sel-opt').forEach(o => o.classList.toggle('active', o.dataset.value === value));
  box.querySelector('.sel-face .label').textContent = label;
  box.classList.remove('open');
}
document.addEventListener('click', function(e){
  if (!e.target.closest('.selectbox')) {
    document.querySelectorAll('.selectbox.open').forEach(b => b.classList.remove('open'));
  }
});

/* Tabs — swap the `on` tab and show the matching panel within one tab group */
function sgShowTab(groupId, tabId, panelId){
  const group = document.getElementById(groupId);
  group.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tabId));
  const panels = document.querySelectorAll('[data-tabpanel-group="' + groupId + '"]');
  panels.forEach(p => p.style.display = (p.dataset.tabpanel === panelId) ? '' : 'none');
}

/* Modal */
function sgOpenModal(id){ document.getElementById(id).classList.add('open'); }
function sgCloseModal(id){ document.getElementById(id).classList.remove('open'); }
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') document.querySelectorAll('.ovl.open').forEach(o => o.classList.remove('open'));
});

/* Pagination */
function sgSetPage(navId, page, max){
  const nav = document.getElementById(navId);
  nav.querySelectorAll('.pg-item[data-page]').forEach(el => el.classList.toggle('active', Number(el.dataset.page) === page));
  const prev = nav.querySelector('[data-prev]'), next = nav.querySelector('[data-next]');
  if (prev) prev.classList.toggle('muted', page <= 1);
  if (next) next.classList.toggle('muted', page >= max);
  nav.dataset.current = page;
  const onChange = nav.dataset.onchange;
  if (onChange && window[onChange]) window[onChange](page);
}
function sgPagePrev(navId){
  const nav = document.getElementById(navId);
  const cur = Number(nav.dataset.current || 1);
  const max = Number(nav.dataset.max || 1);
  if (cur > 1) sgSetPage(navId, cur - 1, max);
}
function sgPageNext(navId){
  const nav = document.getElementById(navId);
  const cur = Number(nav.dataset.current || 1);
  const max = Number(nav.dataset.max || 1);
  if (cur < max) sgSetPage(navId, cur + 1, max);
}

/* Menu — single selection within one menu */
function sgSelectMenuItem(el){
  const menu = el.closest('.menu');
  menu.querySelectorAll('.m-item').forEach(i => i.classList.remove('on'));
  el.classList.add('on');
  const onSelect = menu.dataset.onselect;
  if (onSelect && window[onSelect]) window[onSelect](el.dataset.view);
}

/* Tag — removable */
function sgRemoveTag(btn){
  const tag = btn.closest('.tag');
  tag.style.transition = 'opacity .12s';
  tag.style.opacity = '0';
  setTimeout(() => tag.remove(), 120);
}

/* Alert — dismissible */
function sgDismissAlert(el){
  const a = el.closest('.alert');
  a.style.transition = 'opacity .15s';
  a.style.opacity = '0';
  setTimeout(() => a.remove(), 150);
}
