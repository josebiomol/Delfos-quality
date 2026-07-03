export const DateHelper = {
  convertToISO(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  },

  convertToBR(dateISO) {
    if (!dateISO) return '';
    if (dateISO.includes('-')) {
      const parts = dateISO.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateISO;
  }
};
