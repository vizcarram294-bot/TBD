/**
 * Utilidades de exportación a Excel y PDF
 * Exporta a XLSX con celdas correctamente formateadas usando librería XLSX
 */

import * as XLSX from 'xlsx';

// ============ EXCEL EXPORT (XLSX CON LIBRERÍA XLSX) ============
export function exportToExcel(rows, title, columns = null) {
  if (!rows || !rows.length) {
    alert('No hay datos para exportar');
    return;
  }

  const cols = columns || Object.keys(rows[0]);
  
  // Crear datos con encabezados y filas
  const data = [];
  data.push(cols);
  
  // Agregar todas las filas con datos formateados
  rows.forEach(row => {
    data.push(cols.map(col => formatCellValue(row[col])));
  });

  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Aplicar estilos a encabezados
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill: { fgColor: { rgb: '4472C4' }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Aplicar estilo a datos
  const dataStyle = {
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: {
      left: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right: { style: 'thin', color: { rgb: 'CCCCCC' } },
      top: { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }
    }
  };

  // Aplicar estilos a cada celda
  for (let C = 0; C < cols.length; C++) {
    // Encabezado
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[headerCell]) ws[headerCell] = {};
    ws[headerCell].s = headerStyle;

    // Datos
    for (let R = 1; R < data.length; R++) {
      const dataCell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[dataCell]) ws[dataCell] = {};
      ws[dataCell].s = dataStyle;
    }
  }

  // Establecer ancho de columnas
  ws['!cols'] = cols.map(() => ({ wch: 25 }));

  // Establecer altura de encabezado
  ws['!rows'] = [{ hpx: 25 }];

  // Crear workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

  // Descargar archivo
  XLSX.writeFile(wb, `${title}.xlsx`);
  
  alert(`✓ Archivo "${title}.xlsx" descargado exitosamente`);
}

// ============ PDF EXPORT ============
export function exportToPDF(rows, title, columns = null) {
  if (!rows || !rows.length) {
    alert('No hay datos para exportar');
    return;
  }

  const cols = columns || Object.keys(rows[0]);

  // Crear contenedor con estilos profesionales
  const container = document.createElement('div');
  container.style.cssText = `
    font-family: 'Arial', sans-serif;
    font-size: 11px;
    background: white;
    padding: 20px;
    max-width: 210mm;
  `;

  // Título
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #333;
    border-bottom: 3px solid #2c3e50;
    padding-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  `;
  container.appendChild(titleEl);

  // Meta información
  const meta = document.createElement('p');
  meta.textContent = `Exportado: ${new Date().toLocaleString('es-BO')} | Total de registros: ${rows.length}`;
  meta.style.cssText = `
    font-size: 10px;
    color: #999;
    margin: 0 0 15px 0;
  `;
  container.appendChild(meta);

  // Tabla
  const table = document.createElement('table');
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  `;

  // Encabezados
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.cssText = `
    background-color: #2c3e50;
    color: white;
  `;
  
  cols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    th.style.cssText = `
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #bdc3c7;
      font-size: 10px;
    `;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Datos
  const tbody = document.createElement('tbody');
  rows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    const bgColor = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
    tr.style.cssText = `
      background-color: ${bgColor};
      border-bottom: 1px solid #bdc3c7;
    `;
    
    cols.forEach(col => {
      const td = document.createElement('td');
      td.textContent = formatCellValue(row[col]);
      td.style.cssText = `
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        font-size: 9px;
        word-wrap: break-word;
      `;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // Pie de página
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 30px;
    padding-top: 15px;
    border-top: 2px solid #bdc3c7;
    font-size: 8px;
    color: #999;
    text-align: right;
  `;
  footer.innerHTML = `
    <p style="margin: 0;">ConstruSys - Sistema de Gestión de Construcción</p>
    <p style="margin: 0;">Este documento fue generado automáticamente</p>
  `;
  container.appendChild(footer);

  // Abrir en nueva ventana e imprimir
  printToPDF(container);
}

function printToPDF(element) {
  const printWindow = window.open('', '', 'width=900,height=700');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Exportar PDF</title>
      <style>
        * { margin: 0; padding: 0; }
        body { 
          font-family: 'Arial', sans-serif;
          padding: 20px;
          background: #f5f5f5;
        }
        .content {
          background: white;
          padding: 20px;
          page-break-after: always;
        }
        h2 { 
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        p { font-size: 10px; color: #999; margin: 0 0 15px 0; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
        }
        th { 
          background-color: #2c3e50;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #bdc3c7;
          font-size: 10px;
        }
        td { 
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          font-size: 9px;
          word-wrap: break-word;
        }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:nth-child(odd) { background-color: #ffffff; }
        .meta { font-size: 10px; color: #999; margin: 0 0 15px 0; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #bdc3c7;
          font-size: 8px;
          color: #999;
          text-align: right;
        }
        @media print {
          body { background: white; padding: 0; }
          .content { page-break-after: always; }
          table { font-size: 9px; }
          th { font-size: 9px; }
        }
      </style>
    </head>
    <body>
      <div class="content">
        ${element.innerHTML}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  // Esperar a que cargue y luego imprimir
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

// ============ HELPER FUNCTIONS ============
function formatCellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  
  const str = String(value).trim();
  
  // Detectar fechas YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  
  // Detectar fechas con hora YYYY-MM-DD HH:MM
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(str)) {
    return str.replace('T', ' ').substring(0, 19);
  }
  
  // Detectar fechas ISO con T
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-');
    const time = timePart.substring(0, 5);
    return `${d}/${m}/${y} ${time}`;
  }
  
  // Limitar texto largo pero no truncar aquí, Excel lo maneja
  return str;
}

// ============ COPY TO CLIPBOARD ============
export function copyToClipboard(rows, columns = null) {
  if (!rows || !rows.length) {
    alert('No hay datos para copiar');
    return;
  }
  
  const cols = columns || Object.keys(rows[0]);
  const lines = [
    cols.join('\t'),
    ...rows.map(row => cols.map(c => formatCellValue(row[c])).join('\t'))
  ];
  
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert('Datos copiados al portapapeles ✓');
  }).catch(err => {
    console.error('Error al copiar:', err);
    alert('Error al copiar al portapapeles');
  });
}
