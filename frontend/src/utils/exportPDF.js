// utils/exportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatearFechaPura } from './formatters';

export const exportarInventarioA_PDF = (datosInventario) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Configuración estética del membrete del reporte
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.text("CONSTRUSYS - CONTROL DE INVENTARIO CORPORATIVO", 14, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha de Descarga: ${formatearFechaPura(new Date().toISOString())}`, 14, 26);

    const cabeceras = [["Código", "Material / Elemento", "Categoría", "Stock Físico", "Costo Ref."]];
    
    const filas = datosInventario.map(item => [
        item.codigo_material,
        item.nombre_material,
        item.nombre_categoria || 'General',
        item.stock_actual,
        `${item.costo_unitario || 0} Bs.`
    ]);

    // Renderizado en formato de grilla alineada profesional (No amontonado)
    doc.autoTable({
        startY: 32,
        head: cabeceras,
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [26, 54, 93], fontSize: 9, halign: 'left' },
        styles: { fontSize: 8.5, cellPadding: 3.5 },
        alternatingRowStyles: { fillColor: [247, 250, 252] }
    });

    doc.save(`Inventario_ConstruSys_${formatearFechaPura(new Date().toISOString())}.pdf`);
};