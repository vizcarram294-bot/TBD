// utils/exportExcel.js
import * as XLSX from 'xlsx';

export const exportarExcelProfesional = (datosArray, nombreArchivo = 'Reporte') => {
    if (!datosArray || datosArray.length === 0) return;

    // Conversión estructural a hoja SheetJS
    const hojaTrabajo = XLSX.utils.json_to_sheet(datosArray);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Datos_Inventario');

    // Erradicación del formato primitivo calculando dinámicamente el ancho idóneo de celda
    const propiedadesColumnas = Object.keys(datosArray[0]).map(col => {
        const longitudMaxima = Math.max(
            col.toString().length,
            ...datosArray.map(fila => (fila[col] ? fila[col].toString().length : 0))
        );
        return { wch: longitudMaxima + 3 }; // Margen amortiguador de espaciado
    });
    
    hojaTrabajo['!cols'] = propiedadesColumnas;

    XLSX.writeFile(libroTrabajo, `${nombreArchivo}_ConstruSys.xlsx`);
};