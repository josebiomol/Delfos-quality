/**
 * searchableSelect.js - Fase 8 (base)
 * Transforma um <select> nativo em dropdown com busca/filtro em tempo real,
 * sem quebrar compatibilidade: mantém o <select> original oculto no DOM,
 * sincronizando .value e disparando 'change' — qualquer código que já lê
 * o valor do select (GenericFormBuilder, validações, etc.) continua funcionando.
 *
 * Uso:
 *   import { createSearchableDropdown } from '.../core/searchableSelect.js';
 *   createSearchableDropdown(document.querySelector('select[name="medico_id"]'));
 */
export function createSearchableDropdown(selectEl, opts = {}) {
  if (!selectEl || selectEl.dataset.searchableApplied === '1') return;
  selectEl.dataset.searchableApplied = '1';

  const placeholder = opts.placeholder || 'Buscar...';
  const options = Array.from(selectEl.options).filter(o => o.value !== '');

  const wrapper = document.createElement('div');
  wrapper.className = 'searchable-select-wrapper';
  wrapper.style.cssText = 'position:relative;';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input searchable-select-input';
  input.placeholder = placeholder;
  input.autocomplete = 'off';

  const selectedOption = selectEl.options[selectEl.selectedIndex];
  if (selectedOption && selectedOption.value) input.value = selectedOption.text;

  const menu = document.createElement('div');
  menu.className = 'searchable-select-menu';
  menu.style.cssText = `
    position:absolute; top:100%; left:0; right:0;
    background:var(--surface-alt); border:1px solid var(--line);
    border-top:none; border-radius:0 0 6px 6px;
    max-height:240px; overflow-y:auto; display:none; z-index:1000;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  `;

  function renderMenu(filter = '') {
    const f = filter.trim().toLowerCase();
    const filtered = f ? options.filter(o => o.text.toLowerCase().includes(f)) : options;
    menu.innerHTML = filtered.length
      ? filtered.map(o => `
          <div class="ss-item" data-value="${o.value}" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--line);color:var(--text);">
            ${o.text}
          </div>`).join('')
      : `<div style="padding:10px 12px;color:var(--muted);">Nenhum resultado</div>`;

    menu.querySelectorAll('.ss-item').forEach(item => {
      item.addEventListener('mouseover', () => item.style.background = 'var(--panel)');
      item.addEventListener('mouseout', () => item.style.background = 'transparent');
    });
  }

  input.addEventListener('focus', () => {
    renderMenu('');
    menu.style.display = 'block';
  });

  input.addEventListener('input', () => {
    renderMenu(input.value);
    menu.style.display = 'block';
    if (input.value === '') {
      selectEl.value = '';
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { menu.style.display = 'none'; }, 150);
  });

  // mousedown (não click) pra disparar antes do blur do input
  menu.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const item = e.target.closest('.ss-item');
    if (!item) return;
    selectEl.value = item.dataset.value;
    input.value = item.textContent.trim();
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    menu.style.display = 'none';
  });

  selectEl.style.display = 'none';
  selectEl.parentNode.insertBefore(wrapper, selectEl);
  wrapper.appendChild(input);
  wrapper.appendChild(menu);
  wrapper.appendChild(selectEl);

  return {
    refresh() {
      const opt = selectEl.options[selectEl.selectedIndex];
      input.value = opt && opt.value ? opt.text : '';
    }
  };
}

/**
 * createSearchableMultiselect - Fase 8.3
 * Mesma ideia, mas para <select multiple>: dropdown com input de busca +
 * checkboxes. Mantém o <select multiple> original oculto e sincronizado
 * (selected/change), então qualquer código que já lê selectedOptions continua
 * funcionando sem alteração.
 */
export function createSearchableMultiselect(selectEl, opts = {}) {
  if (!selectEl || selectEl.dataset.searchableApplied === '1') return;
  selectEl.dataset.searchableApplied = '1';

  const placeholder = opts.placeholder || 'Buscar...';
  const options = Array.from(selectEl.options);

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'input searchable-multiselect-btn';
  btn.style.cssText = 'width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;cursor:pointer;background:var(--surface-alt);';

  const updateBtnLabel = () => {
    const count = Array.from(selectEl.selectedOptions).length;
    btn.innerHTML = `<span>${count > 0 ? count + ' selecionado(s)' : placeholder}</span><span style="font-size:var(--text-xs)">▼</span>`;
  };
  updateBtnLabel();

  const menu = document.createElement('div');
  menu.style.cssText = `
    position:absolute; top:100%; left:0; right:0;
    background:var(--surface-alt); border:1px solid var(--line);
    border-radius:6px; margin-top:4px;
    max-height:280px; overflow-y:auto; display:none; z-index:1000;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'input';
  searchInput.placeholder = 'Filtrar...';
  searchInput.style.cssText = 'margin:8px;width:calc(100% - 16px);';

  const list = document.createElement('div');

  function renderList(filter = '') {
    const f = filter.trim().toLowerCase();
    const filtered = options.filter(o => o.text.toLowerCase().includes(f));
    list.innerHTML = filtered.length
      ? filtered.map(o => `
          <label style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--line);">
            <input type="checkbox" class="sm-checkbox" value="${o.value}" ${o.selected ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;" />
            <span style="color:var(--text);font-size:var(--text-sm);">${o.text}</span>
          </label>`).join('')
      : `<div style="padding:10px 12px;color:var(--muted);">Nenhum resultado</div>`;
  }
  renderList();

  list.addEventListener('change', (e) => {
    const cb = e.target.closest('.sm-checkbox');
    if (!cb) return;
    const opt = options.find(o => o.value === cb.value);
    if (opt) opt.selected = cb.checked;
    updateBtnLabel();
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  });

  searchInput.addEventListener('input', () => renderList(searchInput.value));

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display === 'block';
    document.querySelectorAll('.searchable-multiselect-menu-open').forEach(m => m.style.display = 'none');
    menu.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) menu.style.display = 'none';
  });

  menu.classList.add('searchable-multiselect-menu-open');
  menu.appendChild(searchInput);
  menu.appendChild(list);

  selectEl.style.display = 'none';
  selectEl.parentNode.insertBefore(wrapper, selectEl);
  wrapper.appendChild(btn);
  wrapper.appendChild(menu);
  wrapper.appendChild(selectEl);

  return {
    refresh() {
      options.forEach(o => o.selected = selectEl.options[options.indexOf(o)]?.selected);
      updateBtnLabel();
      renderList(searchInput.value);
    }
  };
}
