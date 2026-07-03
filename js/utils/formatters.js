export const Formatters = {
  formatTime(h) {
    if (!h) return '--:--';
    
    // Se for número entre 0 e 1 (fração de dia no Sheets)
    if (typeof h === 'number' && h >= 0 && h < 1) {
      const totalSeconds = h * 86400;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
    }
    
    // Se for string com formato HH:MM
    const timeStr = String(h).trim();
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const h_val = String(parts[0] || '0').padStart(2, '0');
      const m_val = String(parts[1] || '0').padStart(2, '0');
      return h_val + ':' + m_val;
    }
    
    return timeStr.substring(0, 5);
  },

  statusClass(statusId) {
    if (statusId === 'ST004') return 'b-red';
    if (statusId === 'ST005' || statusId === 'ST006') return 'b-yellow';
    if (statusId === 'ST002' || statusId === 'ST003') return 'b-green';
    return 'b-blue';
  },

  getName(arr, id, keyField, valField) {
    if (!arr) return id || '-';
    const item = arr.find(x => x[keyField] === id);
    return item ? item[valField] : (id || '-');
  }
};
