// utils/formatters.js
/**
 * Limpia cadenas ISO de fechas removiendo timestamps redundantes (T00:00:00.000Z)
 * @param {string} fechaISO 
 * @returns {string} Fecha limpia en formato YYYY-MM-DD
 */
export const formatearFechaPura = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha';
    return fechaISO.split('T')[0];
};