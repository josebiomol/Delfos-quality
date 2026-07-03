/**
 * AppointmentService - Serviço para operações de agendamentos
 * Versão 3: Com debug logs completos
 */

import { toast } from '../../../layout/toast.js';

export const AppointmentService = {
  async saveAppointment(data, state) {
    console.log('%c💾 AppointmentService.saveAppointment()', 'color: green; font-weight: bold;', data);

    if (!state.user || !state.user.user_id) {
      toast.show('❌ Usuário não identificado', 'error');
      console.error('❌ state.user:', state.user);
      return;
    }

    if (!state.user.org_id) {
      toast.show('❌ Organização não identificada', 'error');
      console.error('❌ state.user.org_id:', state.user.org_id);
      return;
    }

    const unidadeId = data.unidade_id || state.unit?.unidade_id;

    if (!unidadeId) {
      toast.show('❌ Unidade não selecionada', 'error');
      console.error('❌ unidade_id:', unidadeId, '| state.unit:', state.unit);
      return;
    }

    try {
      const payload = {
        ...data,
        user_id: state.user.user_id,
        org_id: state.user.org_id,
        unidade_id: unidadeId
      };

      console.log('%c📤 Enviando para API:', 'color: blue;', payload);
      console.log('🔍 window.api existe?', typeof window.api);

      // ✅ USAR api GLOBAL DE MAIN.JS
      if (!window.api) {
        console.error('❌ ERRO: window.api não existe!');
        toast.show('❌ ERRO: API não carregada', 'error');
        return;
      }

      console.log('%c⏳ Aguardando resposta da API...', 'color: purple;');
      const response = await window.api('saveAppointment', payload);

      console.log('%c📨 RESPOSTA DA API:', 'color: orange; font-weight: bold;', response);

      if (response && response.success) {
        toast.show('✅ Agendamento salvo com sucesso!', 'success');
        console.log('%c✅ Agendamento salvo:', 'color: green; font-weight: bold;', response.agendamento_id);
        return response;
      } else if (response && response.error) {
        console.error('%c❌ Erro na API:', 'color: red;', response.error);
        toast.show(`❌ Erro: ${response.error}`, 'error');
        return null;
      } else {
        console.error('%c❌ Resposta inesperada:', 'color: red;', response);
        toast.show('❌ Resposta inesperada da API', 'error');
        return null;
      }
    } catch (err) {
      console.error('%c❌ EXCEPTION:', 'color: red; font-weight: bold;', err);
      toast.show(`❌ Erro ao salvar agendamento: ${err.message}`, 'error');
      return null;
    }
  },

  async updateAppointment(agendamentoId, data, state) {
    console.log('%c✏️ AppointmentService.updateAppointment()', 'color: orange; font-weight: bold;', agendamentoId, data);

    if (!state.user || !state.user.user_id) {
      toast.show('❌ Usuário não identificado', 'error');
      return;
    }

    if (!state.user.org_id) {
      toast.show('❌ Organização não identificada', 'error');
      return;
    }

    try {
      const payload = {
        ...data,
        agendamento_id: agendamentoId,
        user_id: state.user.user_id,
        org_id: state.user.org_id,
        unidade_id: data.unidade_id || state.unit?.unidade_id
      };

      console.log('%c📤 Enviando para API:', 'color: blue;', payload);

      const response = await window.api('updateAppointment', payload);

      console.log('%c📨 RESPOSTA DA API:', 'color: orange; font-weight: bold;', response);

      if (response && response.success) {
        toast.show('✅ Agendamento atualizado com sucesso!', 'success');
        console.log('%c✅ Agendamento atualizado:', 'color: green; font-weight: bold;');
        return response;
      } else {
        toast.show(`❌ Erro: ${response?.error || 'Desconhecido'}`, 'error');
        console.error('❌ Erro ao atualizar:', response?.error);
        return null;
      }
    } catch (err) {
      console.error('%c❌ EXCEPTION:', 'color: red; font-weight: bold;', err);
      toast.show(`❌ Erro ao atualizar agendamento: ${err.message}`, 'error');
      return null;
    }
  },

  async deleteAppointment(agendamentoId, state) {
    console.log('%c🗑️ AppointmentService.deleteAppointment()', 'color: red; font-weight: bold;', agendamentoId);

    if (!state.user || !state.user.user_id) {
      toast.show('❌ Usuário não identificado', 'error');
      return;
    }

    if (!state.user.org_id) {
      toast.show('❌ Organização não identificada', 'error');
      return;
    }

    try {
      const payload = {
        agendamento_id: agendamentoId,
        user_id: state.user.user_id,
        org_id: state.user.org_id,
        unidade_id: state.unit?.unidade_id
      };

      console.log('%c📤 Enviando para API:', 'color: blue;', payload);

      const response = await window.api('deleteAppointment', payload);

      console.log('%c📨 RESPOSTA DA API:', 'color: orange; font-weight: bold;', response);

      if (response && response.success) {
        toast.show('✅ Agendamento deletado com sucesso!', 'success');
        console.log('%c✅ Agendamento deletado:', 'color: green; font-weight: bold;');
        return response;
      } else {
        toast.show(`❌ Erro: ${response?.error || 'Desconhecido'}`, 'error');
        console.error('❌ Erro ao deletar:', response?.error);
        return null;
      }
    } catch (err) {
      console.error('%c❌ EXCEPTION:', 'color: red; font-weight: bold;', err);
      toast.show(`❌ Erro ao deletar agendamento: ${err.message}`, 'error');
      return null;
    }
  }
};
