/**
 * ChartsService - Renderizador de gráficos para Agenda de Congelação
 * Usa ChartDataService para processar dados
 * Responsável APENAS por renderizar
 */

import { ChartDataService } from './chartDataService.js';

// ============ PLUGIN: valores sempre visíveis no gráfico ============
// Antes só aparecia no tooltip (precisava clicar/tocar). Esse plugin desenha
// o valor direto em cada fatia/barra, sem depender de lib externa.
const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const { ctx, config } = chart;
    const chartType = config.type;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (dataset.type === 'line' && dataset.label === 'Tendência') return; // não duplica label na linha
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;

      meta.data.forEach((element, index) => {
        const rawValue = dataset.data[index];
        if (rawValue === null || rawValue === undefined) return;

        ctx.save();
        ctx.font = '700 11px sans-serif';

        if (chartType === 'doughnut' || chartType === 'pie') {
          if (!rawValue) { ctx.restore(); return; } // não polui fatia de valor 0
          const pos = element.tooltipPosition();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rawValue, pos.x, pos.y);
        } else if (chartType === 'bar') {
          const isHorizontal = chart.options.indexAxis === 'y';
          ctx.fillStyle = ChartsService.getThemeColor('--text');
          if (isHorizontal) {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(rawValue, element.x + 6, element.y);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(rawValue, element.x, element.y - 4);
          }
        }
        ctx.restore();
      });
    });
  }
};

export class ChartsService {
  static charts = {};
  static _pluginRegistered = false;

  /**
   * Le a cor atual do tema (resolve var(--text)/var(--muted) pro valor
   * real, ja que <canvas> nao entende var() sozinho). Chamado sempre que
   * um grafico e (re)criado, entao reflete o tema no momento do render.
   */
  static getThemeColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#9ca3af';
  }

  static init(state) {
    console.log('%c📊 CHARTSSERVICE INIT', 'color: red; font-weight: bold; font-size: 16px;');
    
    if (!window.Chart) {
      console.error('❌ Chart.js não está carregado');
      return;
    }

    // Registrar o plugin de rótulos 1 única vez (evita warning de plugin duplicado)
    if (!this._pluginRegistered) {
      Chart.register(valueLabelsPlugin);
      this._pluginRegistered = true;
    }

    // Chamar updateCards PRIMEIRO (atualiza os 4 cards com contadores)
    console.log('%c🎯 ATUALIZANDO CARDS...', 'color: blue; font-weight: bold;');
    this.updateCards(state);

    // Depois renderizar todos os 7 gráficos
    console.log('%c🎯 RENDERIZANDO GRÁFICOS...', 'color: blue; font-weight: bold;');
    this.renderStatusPie(state);
    this.renderRescheduleDonut(state);
    this.renderCancellationReasons(state);
    this.renderTopDoctors(state);
    this.renderTopProcedures(state);
    this.renderTopHospitals(state);
    this.renderExamsPerMonth(state);
    this.renderExamsPerYear(state);
    this.renderExamsByHour(state);
    
    console.log('%c✅ TODOS OS GRÁFICOS CARREGADOS!', 'color: green; font-weight: bold; font-size: 14px;');
  }

  /**
   * UPDATE CARDS - Atualiza os 4 cards superiores com contadores
   */
  static updateCards(state) {
    console.log('%c📊 updateCards() CHAMADO', 'color: green; font-weight: bold; font-size: 14px;');
    
    // Calcular valores
    const total = ChartDataService.countTotal(state.appointments);
    const realizados = ChartDataService.countRealizados(state.appointments);
    const cancelados = ChartDataService.countCancelados(state.appointments);
    const reagendados = ChartDataService.countReagendados(state.appointments);

    console.log('%c📌 VALORES:', 'color: blue; font-weight: bold;');
    console.log(`   TOTAL: ${total} | REALIZADOS: ${realizados} | CANCELADOS: ${cancelados} | REAGENDADOS: ${reagendados}`);

    // Procurar e atualizar TOTAL
    const cardTotal = document.querySelector('[data-card-type="total"]');
    if (cardTotal) {
      const valueEl = cardTotal.querySelector('[data-value]');
      if (valueEl) valueEl.textContent = total;
    }

    // Procurar e atualizar REALIZADOS
    const cardRealizados = document.querySelector('[data-card-type="realizados"]');
    if (cardRealizados) {
      const valueEl = cardRealizados.querySelector('[data-value]');
      if (valueEl) valueEl.textContent = realizados;
    }

    // Procurar e atualizar CANCELADOS
    const cardCancelados = document.querySelector('[data-card-type="cancelados"]');
    if (cardCancelados) {
      const valueEl = cardCancelados.querySelector('[data-value]');
      if (valueEl) valueEl.textContent = cancelados;
    }

    // Procurar e atualizar REAGENDADOS
    const cardReagendados = document.querySelector('[data-card-type="reagendados"]');
    if (cardReagendados) {
      const valueEl = cardReagendados.querySelector('[data-value]');
      if (valueEl) valueEl.textContent = reagendados;
    }

    console.log('%c✅ CARDS ATUALIZADOS!', 'color: green; font-weight: bold;');
  }

  /**
   * 1. GRÁFICO DE ROSCA - Status do Agendamento
   */
  static renderStatusPie(state) {
    const ctx = document.getElementById('chartStatusPie');
    if (!ctx) {
      console.warn('⚠️ canvas#chartStatusPie não encontrado');
      return;
    }

    const statusData = ChartDataService.prepareStatusData(
      state.appointments || [],
      state.lookups?.status || []
    );

    const { labels, values } = ChartDataService.toArrays(statusData);

    // Cor real de cada status (a mesma cadastrada em Configurações > Status,
    // usada também no filtro da tela de agendamentos) — não uma paleta genérica.
    const statusColorMap = {};
    (state.lookups?.status || []).forEach(s => {
      statusColorMap[s.nome_status] = s.cor;
    });
    const colors = labels.map(l => statusColorMap[l] || '#9ca3af');

    // Destruir gráfico anterior se existir
    if (this.charts.statusPie) this.charts.statusPie.destroy();

    this.charts.statusPie = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: this.getThemeColor('--text'), font: { size: 12 } }
          }
        }
      }
    });
  }

  /**
   * 2. GRÁFICO DE ROSCA - Reagendamento (Sim/Não)
   */
  static renderRescheduleDonut(state) {
    const ctx = document.getElementById('chartRescheduleDonut');
    if (!ctx) {
      console.warn('⚠️ canvas#chartRescheduleDonut não encontrado');
      return;
    }

    const rescheduleData = ChartDataService.prepareRescheduleData(
      state.appointments || []
    );

    const { labels, values } = ChartDataService.toArrays(rescheduleData);

    const rescheduleColorMap = { 'Sim': '#4ADE80', 'Não': '#F87171' };
    const colors = labels.map(l => rescheduleColorMap[l] || '#9ca3af');

    if (this.charts.rescheduleDonut) this.charts.rescheduleDonut.destroy();

    this.charts.rescheduleDonut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: this.getThemeColor('--text'), font: { size: 12 } }
          }
        }
      }
    });
  }

  /**
   * 3. GRÁFICO DE COLUNA HORIZONTAL - Motivo do Cancelamento
   */
  static renderCancellationReasons(state) {
    const ctx = document.getElementById('chartCancellationReasons');
    if (!ctx) {
      console.warn('⚠️ canvas#chartCancellationReasons não encontrado');
      return;
    }

    const reasonData = ChartDataService.prepareCancellationReasonsData(
      state.appointments || [],
      state.lookups?.motivosCancelamento || []  // ✅ CORRIGIDO: motivosCancelamento (não motivos)
    );

    const { labels, values } = ChartDataService.toArrays(reasonData);
    const colors = ['#93C5FD', '#60A5FA']; // azul bebê, tom suave

    if (this.charts.cancellationReasons) this.charts.cancellationReasons.destroy();

    this.charts.cancellationReasons = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cancelamentos',
          data: values,
          backgroundColor: colors[0],
          borderColor: colors[1],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { right: 24 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          y: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 4. GRÁFICO DE COLUNA HORIZONTAL - TOP 10 Médicos
   */
  static renderTopDoctors(state) {
    const ctx = document.getElementById('chartTopDoctors');
    if (!ctx) {
      console.warn('⚠️ canvas#chartTopDoctors não encontrado');
      return;
    }

    const doctorsData = ChartDataService.prepareTopDoctorsData(
      state.appointments || [],
      state.lookups?.medicos || [],
      10
    );

    const { labels, values } = ChartDataService.toArrays(doctorsData);
    const colors = ['#93C5FD', '#60A5FA']; // azul bebê, tom suave

    if (this.charts.topDoctors) this.charts.topDoctors.destroy();

    this.charts.topDoctors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Agendamentos',
          data: values,
          backgroundColor: colors[0],
          borderColor: colors[1],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { right: 24 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          y: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 4.1. GRÁFICO DE COLUNA HORIZONTAL - TOP 10 Procedimentos (Fase 10)
   */
  static renderTopProcedures(state) {
    const ctx = document.getElementById('chartTopProcedures');
    if (!ctx) {
      console.warn('⚠️ canvas#chartTopProcedures não encontrado');
      return;
    }

    const proceduresData = ChartDataService.prepareTopProceduresData(
      state.appointments || [],
      state.lookups?.procedimentos || [],
      10
    );

    const { labels, values } = ChartDataService.toArrays(proceduresData);
    const colors = ['#c4b5fd', '#8b5cf6']; // roxo suave

    if (this.charts.topProcedures) this.charts.topProcedures.destroy();

    this.charts.topProcedures = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Agendamentos',
          data: values,
          backgroundColor: colors[0],
          borderColor: colors[1],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { right: 24 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          y: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 5. GRÁFICO DE COLUNA HORIZONTAL - TOP 10 Hospitais
   */
  static renderTopHospitals(state) {
    const ctx = document.getElementById('chartTopHospitals');
    if (!ctx) {
      console.warn('⚠️ canvas#chartTopHospitals não encontrado');
      return;
    }

    const hospitalsData = ChartDataService.prepareTopHospitalsData(
      state.appointments || [],
      state.lookups?.hospitais || [],
      10
    );

    const { labels, values } = ChartDataService.toArrays(hospitalsData);
    const colors = ['#93C5FD', '#60A5FA']; // azul bebê, tom suave

    if (this.charts.topHospitals) this.charts.topHospitals.destroy();

    this.charts.topHospitals = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Agendamentos',
          data: values,
          backgroundColor: colors[0],
          borderColor: colors[1],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { right: 24 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          y: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 6. GRÁFICO DE COLUNA VERTICAL - Exames por Mês
   */
  static renderExamsByHour(state) {
    const ctx = document.getElementById('chartExamsByHour');
    if (!ctx) {
      console.warn('⚠️ canvas#chartExamsByHour não encontrado');
      return;
    }

    const hourCounts = ChartDataService.prepareByHourData(state.appointments || []);
    const labels = hourCounts.map((_, h) => `${String(h).padStart(2, '0')}h`);

    if (this.charts.examsByHour) this.charts.examsByHour.destroy();

    this.charts.examsByHour = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Agendamentos',
            data: hourCounts,
            backgroundColor: '#67e8f9',
            borderColor: '#06b6d4',
            borderWidth: 1,
            order: 2
          },
          {
            type: 'line',
            label: 'Tendência',
            data: hourCounts,
            borderColor: '#22c55e',
            backgroundColor: 'transparent',
            borderWidth: 1,
            tension: 0.4,
            pointRadius: 0,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { top: 24 }
        },
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              color: this.getThemeColor('--muted'),
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...hourCounts) * 1.15,
            ticks: { color: this.getThemeColor('--muted'), stepSize: 1 },
            grid: { display: false }
          }
        }
      }
    });
  }
  static renderExamsPerMonth(state) {
    const ctx = document.getElementById('chartExamsPerMonth');
    if (!ctx) {
      console.warn('⚠️ canvas#chartExamsPerMonth não encontrado');
      return;
    }

    const monthData = ChartDataService.prepareExamsPerMonthData(
      state.appointments || []
    );

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const colors = ['#93C5FD', '#60A5FA']; // azul bebê, tom suave

    if (this.charts.examsPerMonth) this.charts.examsPerMonth.destroy();

    this.charts.examsPerMonth = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'Exames',
          data: monthData,
          backgroundColor: colors[0],
          borderColor: colors[0],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { top: 20 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 7. GRÁFICO DE COLUNA VERTICAL - Exames por Ano
   */
  static renderExamsPerYear(state) {
    const ctx = document.getElementById('chartExamsPerYear');
    if (!ctx) {
      console.warn('⚠️ canvas#chartExamsPerYear não encontrado');
      return;
    }

    const yearData = ChartDataService.prepareExamsPerYearData(
      state.appointments || []
    );

    const { labels, values } = ChartDataService.toArrays(yearData);
    const colors = ['#93C5FD', '#60A5FA']; // azul bebê, tom suave

    if (this.charts.examsPerYear) this.charts.examsPerYear.destroy();

    this.charts.examsPerYear = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(String),
        datasets: [{
          label: 'Exames',
          data: values,
          backgroundColor: colors[1],
          borderColor: colors[1],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { top: 20 }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          },
          x: {
            ticks: { color: this.getThemeColor('--muted') },
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Destruir todos os gráficos (ao sair da página)
   */
  static destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}
