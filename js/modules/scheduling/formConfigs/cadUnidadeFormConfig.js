/**
 * cadUnidadeFormConfig.js
 * Configuração dos campos do formulário de cadastro de unidade
 */

export const CADUNIDADE_FORM_CONFIG = {
  title: 'Unidade',
  subtitle: 'Preencha os dados da nova unidade',
  fields: [
    {
      name: 'nome_unidade',
      label: 'Nome da Unidade',
      type: 'text',
      placeholder: 'Ex: Matriz 1, Filial A',
      icon: 'HOSPITAL',
      required: true
    },
    {
      name: 'endereco',
      label: 'Endereço',
      type: 'text',
      placeholder: 'Rua, número, cidade, estado',
      icon: 'HOME',
      required: true,
      fullWidth: true
    },
    {
      name: 'telefone',
      label: 'Telefone',
      type: 'tel',
      placeholder: '(11) 99999-9999',
      icon: 'PHONE',
      required: false
    }
  ]
};
