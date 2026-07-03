/**
 * ChartDataService - Processador inteligente de dados para gráficos
 * Responsável APENAS por processar dados (sem renderizar)
 * 
 * Colunas esperadas:
 * - status_id (ST001, ST002, etc) → lookup em state.lookups.status
 * - reagendamento (SIM/NAO)
 * - motivo_cancelamento_id → lookup em state.lookups.motivos
 * - medico_id → lookup em state.lookups.medicos
 * - hospital_id → lookup em state.lookups.hospitais
 * - data_agendamento (DD/MM/YYYY ou YYYY-MM-DD)
 */

export class ChartDataService {
  /**
   * Helper - Normaliza string (remove acentos, lowercase, trim)
   */
  static normalize(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * 1. Status Agendamento
   * Agrupa por status_id e faz lookup do nome
   */
  static prepareStatusData(appointments, statusLookup = []) {
    console.log('%c🔍 STATUS', 'color: blue; font-weight: bold;');
    const data = {};

    appointments.forEach(a => {
      const statusId = a.status_id;
      if (!statusId) return;

      const statusObj = statusLookup.find(s => s.status_id === String(statusId));
      const statusName = statusObj?.nome_status || `Status ${statusId}`;

      data[statusName] = (data[statusName] || 0) + 1;
    });

    console.log('%c✅ STATUS - Resultado:', 'color: green; font-weight: bold;', data);
    return data;
  }

  /**
   * 2. Reagendamento - Sim/Não
   * Campo: "reagendamento" com valores "SIM" ou "NAO"
   */
  static prepareRescheduleData(appointments) {
    console.log('%c🔍 REAGENDAMENTO', 'color: blue; font-weight: bold;');
    
    let sim = 0;
    let nao = 0;

    appointments.forEach(a => {
      const valor = a.reagendamento || '';
      const normalized = this.normalize(valor);
      
      if (normalized === 'sim' || normalized === 's' || normalized === '1') {
        sim++;
      } else if (normalized === 'nao' || normalized === 'n' || normalized === '0' || normalized === '') {
        nao++;
      }
    });

    const result = {
      'Sim': sim,
      'Não': nao
    };
    console.log('%c✅ REAGENDAMENTO - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * 3. Motivo Cancelamento - Com lookup
   * Campo: "motivo_cancelamento_id" → lookup em "motivos"
   */
  static prepareCancellationReasonsData(appointments, reasonsLookup = []) {
    console.log('%c🔍 CANCELAMENTO', 'color: blue; font-weight: bold;');
    const data = {};

    appointments.forEach(a => {
      const reasonId = a.motivo_cancelamento_id;
      if (!reasonId) return;

      const reasonObj = reasonsLookup.find(r => r.motivo_id === String(reasonId));
      const reasonName = reasonObj?.motivo || `Motivo ${reasonId}`;

      data[reasonName] = (data[reasonName] || 0) + 1;
    });

    const result = Object.fromEntries(
      Object.entries(data).sort((a, b) => b[1] - a[1])
    );
    console.log('%c✅ CANCELAMENTO - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * 4. TOP 10 Médicos - Com lookup
   * Campo: "medico_id" → lookup em "medicos" (nome_medico)
   */
  static prepareTopDoctorsData(appointments, doctorsLookup = [], limit = 10) {
    console.log('%c🔍 MÉDICOS', 'color: blue; font-weight: bold;');
    const data = {};

    appointments.forEach(a => {
      const doctorId = a.medico_id;
      if (!doctorId) return;

      const doctorObj = doctorsLookup.find(d => d.medico_id === String(doctorId));
      const doctorName = doctorObj?.nome_medico || `Médico ${doctorId}`;

      data[doctorName] = (data[doctorName] || 0) + 1;
    });

    const result = Object.fromEntries(
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
    );
    console.log('%c✅ MÉDICOS - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * 4.1. TOP 10 Procedimentos - Com lookup
   * Campo: "procedimento_id" → lookup em "procedimentos" (nome_procedimento)
   */
  static prepareTopProceduresData(appointments, proceduresLookup = [], limit = 10) {
    console.log('%c🔍 PROCEDIMENTOS', 'color: blue; font-weight: bold;');
    const data = {};

    appointments.forEach(a => {
      const procId = a.procedimento_id;
      if (!procId) return;

      const procObj = proceduresLookup.find(p => p.procedimento_id === String(procId));
      const procName = procObj?.nome_procedimento || `Procedimento ${procId}`;

      data[procName] = (data[procName] || 0) + 1;
    });

    const result = Object.fromEntries(
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
    );
    console.log('%c✅ PROCEDIMENTOS - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * 5. TOP 10 Hospitais - Com lookup
   * Campo: "hospital_id" → lookup em "hospitais" (nome_hospital)
   */
  static prepareTopHospitalsData(appointments, hospitalsLookup = [], limit = 10) {
    console.log('%c🔍 HOSPITAIS', 'color: blue; font-weight: bold;');
    const data = {};

    appointments.forEach(a => {
      const hospitalId = a.hospital_id;
      if (!hospitalId) return;

      const hospitalObj = hospitalsLookup.find(h => h.hospital_id === String(hospitalId));
      const hospitalName = hospitalObj?.nome_hospital || `Hospital ${hospitalId}`;

      data[hospitalName] = (data[hospitalName] || 0) + 1;
    });

    const result = Object.fromEntries(
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
    );
    console.log('%c✅ HOSPITAIS - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * 6.1. Distribuição por Horário (Fase 11)
   * Campo: "horario" (HH:MM) → agrupa por hora cheia
   */
  static prepareByHourData(appointments) {
    const hourCounts = new Array(24).fill(0);
    appointments.forEach(a => {
      if (!a.horario) return;
      const hour = parseInt(String(a.horario).split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) hourCounts[hour]++;
    });
    return hourCounts;
  }

  /**
   * 6. Exames por Mês
   * Campo: "data_agendamento" (DD/MM/YYYY ou YYYY-MM-DD)
   */
  static prepareExamsPerMonthData(appointments) {
    console.log('%c🔍 EXAMES/MÊS', 'color: blue; font-weight: bold;');
    const monthCounts = new Array(12).fill(0);

    appointments.forEach(a => {
      if (a.data_agendamento) {
        const date = this.parseDate(a.data_agendamento);
        if (date) {
          monthCounts[date.getMonth()]++;
        }
      }
    });

    console.log('%c✅ EXAMES/MÊS - Resultado:', 'color: green; font-weight: bold;', monthCounts);
    return monthCounts;
  }

  /**
   * 7. Exames por Ano
   * Campo: "data_agendamento" (DD/MM/YYYY ou YYYY-MM-DD)
   */
  static prepareExamsPerYearData(appointments) {
    console.log('%c🔍 EXAMES/ANO', 'color: blue; font-weight: bold;');
    const yearCounts = {};

    appointments.forEach(a => {
      if (a.data_agendamento) {
        const date = this.parseDate(a.data_agendamento);
        if (date) {
          const year = date.getFullYear();
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      }
    });

    const result = Object.fromEntries(
      Object.entries(yearCounts).sort((a, b) => a[0] - b[0])
    );
    console.log('%c✅ EXAMES/ANO - Resultado:', 'color: green; font-weight: bold;', result);
    return result;
  }

  /**
   * Parse date - Suporta DD/MM/YYYY e YYYY-MM-DD
   */
  static parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('-')) return new Date(dateStr);
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  }

  /**
   * Converter objeto em arrays [labels, values]
   */
  static toArrays(data) {
    return {
      labels: Object.keys(data),
      values: Object.values(data)
    };
  }

  /**
   * HELPERS PARA CARDS - Contar cada status
   * ST001 = Confirmado
   * ST002 = Realizado
   * ST003 = Reagendado
   * ST004 = Cancelado
   * ST005 = Pendente
   */
  static countTotal(appointments) {
    return appointments?.length || 0;
  }

  static countRealizados(appointments) {
    return appointments?.filter(a => a.status_id === 'ST002')?.length || 0;
  }

  static countCancelados(appointments) {
    return appointments?.filter(a => a.status_id === 'ST004')?.length || 0;
  }

  static countReagendados(appointments) {
    return appointments?.filter(a => a.status_id === 'ST003')?.length || 0;
  }

  /**
   * Paleta de cores por tipo de gráfico
   */
  static getColorPalette(type = 'status') {
    const palettes = {
      status: ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#f59e0b'],
      reschedule: ['#22c55e', '#6b7280'],
      cancellation: ['#ef4444', '#dc2626', '#991b1b'],
      doctors: ['#3b82f6', '#1e40af', '#1e3a8a'],
      hospitals: ['#f59e0b', '#d97706', '#b45309'],
      exams: ['#22c55e', '#8b5cf6']
    };
    return palettes[type] || palettes.status;
  }
}
