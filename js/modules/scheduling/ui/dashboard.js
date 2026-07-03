import { APP_CONFIG } from '../../../core/constants.js';
import { Formatters } from '../../../utils/formatters.js';
import { DateHelper } from '../../../utils/dateHelper.js';
import { ICONS, renderIcon } from '../../../core/fontAwesomeIcons.js';

export const DashboardUI = {
  render(state) {
    const renderCalendar = () => {
      const year = state.calendarYear;
      const month = state.calendarMonth;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      let html = '<div class="card" style="padding:20px;display:flex;flex-direction:column;gap:12px">';
      
      html += '<div style="display:flex;justify-content:center;align-items:center;gap:10px">';
      html += `<button id="prevMonth" class="icon-btn">${renderIcon('BACK', 'solid')}</button>`;
      html += `<h3 style="margin:0;width:150px;text-align:center;font-size:var(--text-md)">${APP_CONFIG.MONTHS[month]} ${year}</h3>`;
      html += `<button id="nextMonth" class="icon-btn">${renderIcon('FORWARD', 'solid')}</button>`;
      html += '</div>';
      
      html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">';

      APP_CONFIG.WEEKDAYS.forEach(day => {
        html += `<div style="text-align:center;padding:10px;font-weight:bold;font-size:var(--text-xs);color:var(--muted);border-bottom:1px solid var(--line)">${day}</div>`;
      });

      for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div style="padding:10px;background:var(--surface-alt);border:1px solid var(--line)"></div>';
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStrISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateStrBR = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

        const hasAppointment = state.appointments.some(a => a.data_agendamento === dateStrBR || a.data_agendamento === dateStrISO);
        const isBlocked = state.blocked.some(b => {
          const bStart = DateHelper.convertToISO(b.data_inicio);
          const bEnd = DateHelper.convertToISO(b.data_fim);
          return dateStrISO >= bStart && dateStrISO <= bEnd;
        });

        let bgColor = 'var(--surface-alt)';
        let borderColor = 'var(--line)';
        let textColor = 'var(--text)';
        let opacityStyle = '';

        if (isBlocked) {
          bgColor = '#fee2e2';
          borderColor = '#fca5a5';
          textColor = '#b91c1c';
          opacityStyle = '';
        } else if (hasAppointment) {
          bgColor = '#dcfce7';
          borderColor = '#86efac';
          textColor = '#15803d';
        }

        html += `<div data-calendar-day="${dateStrBR}" data-calendar-iso="${dateStrISO}" style="padding:10px;background:${bgColor};border:1px solid ${borderColor};text-align:center;border-radius:4px;font-weight:var(--font-medium);color:${textColor};${opacityStyle}font-size:var(--text-sm);cursor:pointer;transition:all 0.2s">${day}</div>`;
      }

      html += '</div>';
      
      html += '<div style="display:flex;gap:12px;font-size:var(--text-xs);padding-top:12px;border-top:1px solid var(--line)">';
      html += `<div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:#dcfce7;border:1px solid #86efac;border-radius:3px"></div><span>${renderIcon('APPOINTMENTS', 'solid')} Agendamento</span></div>`;
      html += `<div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:#fee2e2;border:1px solid #fca5a5;border-radius:3px"></div><span>${renderIcon('BLOCKED_DATES', 'solid')} Bloqueado</span></div>`;
      html += '</div></div>';
      
      return html;
    };

    return `<style>
      @media (max-width: 640px) {
        .dashboard-card-title {
          font-size:var(--text-xs) !important;
        }
        .dashboard-container-3col,
        .dashboard-container-2col {
          grid-template-columns: 1fr !important;
        }
      }
      
      .dashboard-container-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .dashboard-container-2col {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
    </style>
    
          
      <div class="dashboard-stats" style="display:grid;gap:16px;margin-bottom:24px">
        <div class="card" data-card-type="total" style="padding:20px;text-align:center"><div style="color:var(--muted);font-size:var(--text-base);margin-bottom:8px">${renderIcon('CHART', 'regular')} TOTAL</div><div style="font-size:var(--text-4xl);font-weight:var(--font-bold);color:#22c55e" data-value>0</div></div>
        <div class="card" data-card-type="realizados" style="padding:20px;text-align:center"><div style="color:var(--muted);font-size:var(--text-base);margin-bottom:8px">${renderIcon('SUCCESS', 'regular')} REALIZADOS</div><div style="font-size:var(--text-4xl);font-weight:var(--font-bold);color:#22c55e" data-value>0</div></div>
        <div class="card" data-card-type="cancelados" style="padding:20px;text-align:center"><div style="color:var(--muted);font-size:var(--text-base);margin-bottom:8px"><span>${renderIcon('CANCEL', 'solid')}</span><span class="dashboard-card-title" style="font-size:var(--text-xs);margin-left:6px">CANCELADOS</span></div><div style="font-size:var(--text-4xl);font-weight:var(--font-bold);color:#ef4444" data-value>0</div></div>
        <div class="card" data-card-type="reagendados" style="padding:20px;text-align:center"><div style="color:var(--muted);font-size:var(--text-base);margin-bottom:8px"><span>${renderIcon('CALENDAR', 'solid')}</span><span class="dashboard-card-title" style="font-size:var(--text-xs);margin-left:6px">REAGENDADOS</span></div><div style="font-size:var(--text-4xl);font-weight:var(--font-bold);color:#eab308" data-value>0</div></div>
      </div>
      
      <!-- ✅ CONTAINER 1: Status, Reagendamento (2 colunas desktop / 1 coluna mobile) -->
      <div class="dashboard-container-2col">
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('CHART', 'solid')} Status Agendamento</h3><canvas id="chartStatusPie" style="max-height:300px"></canvas></div>
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('REFRESH', 'solid')} Reagendamento</h3><canvas id="chartRescheduleDonut" style="max-height:300px"></canvas></div>
      </div>
      
      <!-- ✅ CONTAINER 2: Top 10 Médicos, Procedimentos e Hospitais (3 colunas desktop / 1 coluna mobile) -->
      <div class="dashboard-container-3col">
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('DOCTOR', 'solid')} Top 10 Médicos Solicitantes</h3><canvas id="chartTopDoctors" style="max-height:300px"></canvas></div>
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('CHART', 'solid')} Top 10 Procedimentos</h3><canvas id="chartTopProcedures" style="max-height:300px"></canvas></div>
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('HOSPITAL', 'solid')} Top 10 Hospitais Solicitantes</h3><canvas id="chartTopHospitals" style="max-height:300px"></canvas></div>
      </div>
      
      <!-- ✅ CONTAINER 3: Exames por Mês e Ano (2 colunas desktop / 1 coluna mobile) -->
      <div class="dashboard-container-2col">
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('CHART', 'solid')} Exames por Mês</h3><canvas id="chartExamsPerMonth" style="max-height:300px"></canvas></div>
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('ANALYTICS', 'solid')} Exames por Ano</h3><canvas id="chartExamsPerYear" style="max-height:300px"></canvas></div>
      </div>

      <!-- ✅ CONTAINER 4: Motivo Cancelamento + Distribuição por Horário juntos -->
      <div class="dashboard-container-2col">
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('MESSAGE', 'solid')} Motivo Cancelamento</h3><canvas id="chartCancellationReasons" style="max-height:350px"></canvas></div>
        <div class="card" style="padding:20px"><h3 style="margin:0 0 16px 0">${renderIcon('CHART', 'solid')} Distribuição por Horário</h3><canvas id="chartExamsByHour" style="max-height:350px"></canvas></div>
      </div>
      
      ${state.user?.role !== 'hospital' ? renderCalendar() : ''}`;
  },

  bind(state, callbacks) {
    console.log('📅 DashboardUI.bind() chamado');

    if (state.user?.role === 'hospital') return; // ✅ Fase 12.6: sem calendário p/ hospital

    document.getElementById('prevMonth').onclick = (e) => {
      e.preventDefault();
      state.calendarMonth--;
      if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
      }
      callbacks.onCalendarChange();
    };

    document.getElementById('nextMonth').onclick = (e) => {
      e.preventDefault();
      state.calendarMonth++;
      if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
      }
      callbacks.onCalendarChange();
    };

    // ✅ CORRIGIDO: Clicar no dia do calendário
    document.querySelectorAll('[data-calendar-day]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        
        const dateStr = el.dataset.calendarDay; // DD/MM/YYYY
        
        // Filtrar agendamentos daquele dia
        const appointments = state.appointments.filter(a => a.data_agendamento === dateStr);
        
        console.log(`📅 Clicou no dia ${dateStr} - ${appointments.length} agendamentos`);
        
        // Chamar callback com data + agendamentos filtrados
        if (callbacks && callbacks.onDayClick) {
          callbacks.onDayClick({
            data: dateStr,
            appointments: appointments
          });
        }
      };
      
      el.style.cursor = 'pointer';
      
      // Hover effect
      el.onmouseover = () => {
        el.style.transform = 'scale(1.05)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      };
      el.onmouseout = () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = 'none';
      };
    });
  }
};
