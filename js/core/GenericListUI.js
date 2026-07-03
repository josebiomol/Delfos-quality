/**
 * GenericListUI - Renderiza listas/tabelas genéricas reutilizáveis
 * Arquivo: js/core/GenericListUI.js
 * Uso: appointments.js, blocked.js, inventory, etc
 */

export class GenericListUI {
  constructor(config = {}) {
    this.config = {
      title: 'Lista',
      subtitle: '',
      columns: [],
      items: [],
      actions: [],
      searchable: false,
      sortable: true,
      paginated: false,
      itemsPerPage: 10,
      ...config
    };
    
    this.currentPage = 1;
    this.filteredItems = [...this.config.items];
  }

  /**
   * Renderizar a lista completa
   */
  render() {
    const { title, subtitle, columns = [], items = [], actions = [] } = this.config;
    
    // Atualizar filteredItems
    this.filteredItems = [...items];

    let html = `
      <div class="top">
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-sub">${subtitle}</p>` : ''}
      </div>

      ${this.config.searchable ? this.renderSearchBar() : ''}

      <div style="margin-top:24px;overflow-x:auto">
        <table style="
          width:100%;
          border-collapse:collapse;
          background:#0f1419;
          border:1px solid #1e2632;
          border-radius:8px;
          overflow:hidden;
          font-size:var(--text-sm);
        ">
          <thead>
            <tr style="background:#0a0d12;border-bottom:2px solid #1e2632">
              ${columns.map((col, idx) => this.renderColumnHeader(col, idx)).join('')}
              ${actions.length > 0 ? `
                <th style="
                  padding:14px;
                  text-align:center;
                  font-size:var(--text-xs);
                  font-weight:var(--font-semibold);
                  color:var(--muted);
                  text-transform:uppercase;
                  letter-spacing:0.5px;
                  width:80px;
                ">
                  Ações
                </th>
              ` : ''}
            </tr>
          </thead>
          <tbody>
            ${this.getPagedItems().map((item, idx) => this.renderRow(item, idx, columns, actions)).join('')}
          </tbody>
        </table>
        
        ${this.filteredItems.length === 0 ? `
          <div style="
            text-align:center;
            padding:40px 20px;
            color:#6b7280;
            background:#0f1419;
            border:1px solid #1e2632;
            border-top:none;
            border-radius:0 0 8px 8px;
          ">
            <p style="font-size:var(--text-base);margin:0">Nenhum registro encontrado</p>
          </div>
        ` : ''}
      </div>

      ${this.config.paginated && this.getPageCount() > 1 ? this.renderPagination() : ''}
    `;

    return html;
  }

  /**
   * Renderizar header da coluna
   */
  renderColumnHeader(col, idx) {
    return `
      <th style="
        padding:14px;
        text-align:${col.align || 'left'};
        font-size:var(--text-xs);
        font-weight:var(--font-semibold);
        color:var(--muted);
        text-transform:uppercase;
        letter-spacing:0.5px;
        cursor:${this.config.sortable ? 'pointer' : 'default'};
        user-select:none;
        transition:all 0.3s ease;
      " 
      ${this.config.sortable ? `data-sort-col="${col.key}"` : ''}>
        <div style="display:flex;align-items:center;gap:6px;justify-content:${col.align === 'center' ? 'center' : 'flex-start'}">
          ${col.label}
          ${this.config.sortable ? '<span data-sort-icon style="font-size:var(--text-xs);opacity:0.5;">⇅</span>' : ''}
        </div>
      </th>
    `;
  }

  /**
   * Renderizar linha da tabela
   */
  renderRow(item, idx, columns, actions) {
    const itemId = item.id || item.agendamento_id || item.bloqueio_id || idx;
    
    return `
      <tr style="
        border-bottom:1px solid #1e2632;
        transition:all 0.3s ease;
        background:rgba(255,255,255,0);
      " 
      class="list-row" 
      data-item-id="${itemId}"
      onmouseover="this.style.background='rgba(255,255,255,0.05)'"
      onmouseout="this.style.background='rgba(255,255,255,0)'">
        ${columns.map(col => this.renderCell(item, col)).join('')}
        ${actions.length > 0 ? `
          <td style="
            padding:14px;
            text-align:center;
            display:flex;
            gap:8px;
            justify-content:center;
            flex-wrap:wrap;
          ">
            ${actions.map(action => this.renderActionButton(action, itemId)).join('')}
          </td>
        ` : ''}
      </tr>
    `;
  }

  /**
   * Renderizar célula
   */
  renderCell(item, col) {
    let value = item[col.key];
    
    if (value === null || value === undefined || value === '') {
      value = '—';
    } else {
      value = this.formatValue(value, col.type);
    }

    // Colunas ocultas em mobile
    const mobileHidden = col.hideOnMobile ? 'display:none' : '';
    
    return `
      <td style="
        padding:14px;
        font-size:var(--text-sm);
        color:var(--text);
        text-align:${col.align || 'left'};
        ${mobileHidden};
        max-width:${col.maxWidth || '200px'};
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      " 
      title="${item[col.key] || ''}"
      data-col="${col.key}">
        ${value}
      </td>
    `;
  }

  /**
   * Renderizar botão de ação
   */
  renderActionButton(action, itemId) {
    const buttonColor = action.color || '#f59e0b';
    const buttonBgHover = action.bgHover || 'rgba(245, 158, 11, 0.2)';
    
    return `
      <button 
        class="list-action-btn" 
        data-action="${action.name}" 
        data-id="${itemId}"
        title="${action.label}"
        style="
          background:none;
          border:1px solid ${buttonColor};
          cursor:pointer;
          color:${buttonColor};
          font-size:var(--text-base);
          padding:6px 10px;
          border-radius:4px;
          transition:all 0.3s ease;
          display:flex;
          align-items:center;
          gap:4px;
          white-space:nowrap;
        "
        onmouseover="this.style.background='${buttonBgHover}';this.style.transform='scale(1.1)'"
        onmouseout="this.style.background='none';this.style.transform='scale(1)'"
      >
        ${action.icon || ''}
        <span style="font-size:var(--text-xs)">${action.label}</span>
      </button>
    `;
  }

  /**
   * Formatar valor conforme tipo
   */
  formatValue(value, type) {
    if (!value) return '—';
    
    switch (type) {
      case 'date':
        try {
          const date = new Date(value);
          return date.toLocaleDateString('pt-BR');
        } catch {
          return value;
        }
      
      case 'datetime':
        try {
          const date = new Date(value);
          return date.toLocaleString('pt-BR');
        } catch {
          return value;
        }
      
      case 'time':
        return String(value).substring(0, 5);
      
      case 'boolean':
        return value === 'SIM' || value === true || value === 1 ? '✓ Sim' : '✗ Não';
      
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      
      case 'percent':
        return `${Number(value).toFixed(2)}%`;
      
      case 'status':
        return `<span style="
          display:inline-block;
          padding:4px 8px;
          border-radius:4px;
          background:${this.getStatusColor(value)};
          color:#fff;
          font-size:var(--text-xs);
          font-weight:var(--font-semibold);
        ">${value}</span>`;
      
      default:
        return String(value);
    }
  }

  /**
   * Obter cor do status
   */
  getStatusColor(status) {
    const colors = {
      'agendado': '#3b82f6',
      'confirmado': '#10b981',
      'cancelado': '#ef4444',
      'reagendado': '#f59e0b',
      'realizado': '#8b5cf6',
      'ausente': '#6b7280',
      'SIM': '#10b981',
      'NAO': '#ef4444'
    };
    
    return colors[String(status).toLowerCase()] || '#6b7280';
  }

  /**
   * Renderizar barra de busca
   */
  renderSearchBar() {
    return `
      <div style="margin-top:20px;margin-bottom:20px">
        <input 
          type="text" 
          id="search-input" 
          placeholder="🔍 Buscar..."
          style="
            width:100%;
            padding:10px 14px;
            border:1px solid #1e2632;
            border-radius:6px;
            background:#0a0d12;
            color:var(--text);
            font-size:var(--text-sm);
          "
        />
      </div>
    `;
  }

  /**
   * Renderizar paginação
   */
  renderPagination() {
    const pageCount = this.getPageCount();
    const pages = [];
    
    for (let i = 1; i <= pageCount; i++) {
      pages.push(i);
    }

    return `
      <div style="
        display:flex;
        justify-content:center;
        gap:8px;
        margin-top:20px;
        padding:20px;
      ">
        ${pages.map(page => `
          <button 
            class="pagination-btn" 
            data-page="${page}"
            style="
              padding:8px 12px;
              border:1px solid #1e2632;
              border-radius:4px;
              background:${page === this.currentPage ? '#3b82f6' : '#0a0d12'};
              color:${page === this.currentPage ? '#fff' : 'var(--muted)'};
              cursor:pointer;
              font-size:var(--text-xs);
              transition:all 0.3s ease;
            "
            onmouseover="this.style.background='#1e2632'"
            onmouseout="this.style.background='${page === this.currentPage ? '#3b82f6' : '#0a0d12'}'"
          >
            ${page}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Obter itens da página atual
   */
  getPagedItems() {
    if (!this.config.paginated) {
      return this.filteredItems;
    }

    const start = (this.currentPage - 1) * this.config.itemsPerPage;
    const end = start + this.config.itemsPerPage;
    
    return this.filteredItems.slice(start, end);
  }

  /**
   * Obter quantidade de páginas
   */
  getPageCount() {
    if (!this.config.paginated) return 1;
    
    return Math.ceil(this.filteredItems.length / this.config.itemsPerPage);
  }

  /**
   * Vincular eventos
   */
  bind(callbacks = {}) {
    // Ações dos botões
    document.querySelectorAll('.list-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        
        if (callbacks[action]) {
          callbacks[action](id);
        }
      });
    });

    // Paginação
    if (this.config.paginated) {
      document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentPage = parseInt(btn.dataset.page);
          if (callbacks.onPageChange) {
            callbacks.onPageChange(this.currentPage);
          }
        });
      });
    }

    // Busca
    if (this.config.searchable) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          this.filteredItems = this.config.items.filter(item => {
            return this.config.columns.some(col => {
              const value = String(item[col.key] || '').toLowerCase();
              return value.includes(query);
            });
          });
          this.currentPage = 1;
          if (callbacks.onSearch) {
            callbacks.onSearch(query, this.filteredItems);
          }
        });
      }
    }

    // Ordenação
    if (this.config.sortable) {
      document.querySelectorAll('[data-sort-col]').forEach(header => {
        header.addEventListener('click', () => {
          const colKey = header.dataset.sortCol;
          const col = this.config.columns.find(c => c.key === colKey);
          
          if (col) {
            const isAsc = col.sortAsc !== false;
            col.sortAsc = !isAsc;
            
            this.filteredItems.sort((a, b) => {
              const aVal = a[colKey];
              const bVal = b[colKey];
              
              if (col.sortAsc) {
                return aVal > bVal ? 1 : -1;
              } else {
                return aVal < bVal ? 1 : -1;
              }
            });
            
            if (callbacks.onSort) {
              callbacks.onSort(colKey, col.sortAsc);
            }
          }
        });
      });
    }
  }

  /**
   * Atualizar dados
   */
  update(newItems = []) {
    this.config.items = newItems;
    this.filteredItems = [...newItems];
    this.currentPage = 1;
  }

  /**
   * Adicionar item
   */
  addItem(item) {
    this.config.items.push(item);
    this.filteredItems.push(item);
  }

  /**
   * Remover item
   */
  removeItem(itemId) {
    const idx = this.config.items.findIndex(i => 
      i.id === itemId || 
      i.agendamento_id === itemId || 
      i.bloqueio_id === itemId
    );
    
    if (idx !== -1) {
      this.config.items.splice(idx, 1);
      this.filteredItems = this.filteredItems.filter((_, i) => i !== idx);
    }
  }

  /**
   * Obter item por ID
   */
  getItem(itemId) {
    return this.config.items.find(i => 
      i.id === itemId || 
      i.agendamento_id === itemId || 
      i.bloqueio_id === itemId
    );
  }
}
