import { api } from './apiService.js';

export class DataService {
  static state = {
    user: null,
    unit: null,
    units: [],
    lookups: {},
    appointments: [],
    blocked: [],
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear()
  };

  static async loadAll() {
    try {
      const data = await api('loadData', {
        org_id: this.state.user.org_id,
        unidade_id: this.state.unit.unidade_id,
        hospital_id: this.state.user.role === 'hospital' ? (this.state.user.hospital_id || '') : ''
      });
      
      this.state.appointments = data.agendamentos || [];
      this.state.blocked = data.bloqueios || [];
      this.state.lookups = {
        hospitais: data.hospitais || [],
        medicos: data.medicos || [],
        convenios: data.convenios || [],
        procedimentos: data.procedimentos || [],
        status: data.status || [],
        motivosCancelamento: data.motivosCancelamento || [], // ✅ CORRIGIDO: motivosCancelamento (não motivos)
        usuarios: data.usuarios || [],
        grupos: data.grupos || [],
        setores: data.setores || [],
        unidades: data.unidades || []
      };

      console.log('✅ Lookups carregados:', this.state.lookups);
      return this.state;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      throw error;
    }
  }

  static getState() {
    return this.state;
  }

  static setState(updates) {
    this.state = { ...this.state, ...updates };
    return this.state;
  }

  static getAppointments() {
    return this.state.appointments;
  }

  static getBlocked() {
    return this.state.blocked;
  }

  static getAppointmentById(id) {
    return this.state.appointments.find(a => a.agendamento_id === id);
  }
}
