/**
 * BlockedDateService - Serviço para operações de datas bloqueadas
 * Versão 2: Usa api global de main.js
 */

import { toast } from '../../../layout/toast.js';

export const BlockedDateService = {
  async saveBlockedDate(data, state) {
    console.log('%c💾 BlockedDateService.saveBlockedDate()', 'color: green; font-weight: bold;', data);

    if (!state.user || !state.user.user_id) {
      toast.show('❌ Usuário não identificado', 'error');
      return;
    }

    if (!state.user.org_id) {
      toast.show('❌ Organização não identificada', 'error');
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

      const response = await window.api('saveBlockedDate', payload);

      if (response.success) {
        toast.show('✅ Bloqueio salvo com sucesso!', 'success');
        console.log('%c✅ Bloqueio salvo:', 'color: green; font-weight: bold;', response.bloqueio_id);
        return response;
      } else {
        toast.show(`❌ Erro: ${response.error}`, 'error');
        console.error('❌ Erro ao salvar:', response.error);
        return null;
      }
    } catch (err) {
      toast.show(`❌ Erro ao salvar bloqueio: ${err.message}`, 'error');
      console.error('❌ Exception:', err);
      return null;
    }
  },

  async updateBlockedDate(bloqueioId, data, state) {
    console.log('%c✏️ BlockedDateService.updateBlockedDate()', 'color: orange; font-weight: bold;', bloqueioId, data);

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
        bloqueio_id: bloqueioId,
        user_id: state.user.user_id,
        org_id: state.user.org_id,
        unidade_id: data.unidade_id || state.unit?.unidade_id
      };

      console.log('%c📤 Enviando para API:', 'color: blue;', payload);

      const response = await window.api('updateBlockedDate', payload);

      if (response.success) {
        toast.show('✅ Bloqueio atualizado com sucesso!', 'success');
        console.log('%c✅ Bloqueio atualizado:', 'color: green; font-weight: bold;');
        return response;
      } else {
        toast.show(`❌ Erro: ${response.error}`, 'error');
        console.error('❌ Erro ao atualizar:', response.error);
        return null;
      }
    } catch (err) {
      toast.show(`❌ Erro ao atualizar bloqueio: ${err.message}`, 'error');
      console.error('❌ Exception:', err);
      return null;
    }
  },

  async deleteBlockedDate(bloqueioId, state) {
    console.log('%c🗑️ BlockedDateService.deleteBlockedDate()', 'color: red; font-weight: bold;', bloqueioId);

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
        bloqueio_id: bloqueioId,
        user_id: state.user.user_id,
        org_id: state.user.org_id,
        unidade_id: state.unit?.unidade_id
      };

      console.log('%c📤 Enviando para API:', 'color: blue;', payload);

      const response = await window.api('deleteBlockedDate', payload);

      if (response.success) {
        toast.show('✅ Bloqueio deletado com sucesso!', 'success');
        console.log('%c✅ Bloqueio deletado:', 'color: green; font-weight: bold;');
        return response;
      } else {
        toast.show(`❌ Erro: ${response.error}`, 'error');
        console.error('❌ Erro ao deletar:', response.error);
        return null;
      }
    } catch (err) {
      toast.show(`❌ Erro ao deletar bloqueio: ${err.message}`, 'error');
      console.error('❌ Exception:', err);
      return null;
    }
  }
};
