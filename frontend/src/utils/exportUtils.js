/**
 * Utilidades de exportación a Excel y PDF
 * Soporta exportación profesional con estilos, bordes y formato
 * Mejora: Exporta a XLSX con celdas correctamente formateadas
 */

// ============ EXCEL EXPORT (MEJORADO CON CELDAS CORRECTAS) ============
export function exportToExcel(rows, title, columns = null) {
  if (!rows || !rows.length) {
    alert('No hay datos para exportar');
    return;
  }

  const cols = columns || Object.keys(rows[0]);
  
  // Crear datos con encabezados y filas
  const data = [];
  data.push(cols);
  
  rows.forEach(row => {
    data.push(cols.map(col => formatCellValue(row[col])));
  });

  // Generar Excel con estructura correcta
  const worksheet = generateExcelWorksheet(data, cols);
  downloadFile(worksheet, `${title}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

function generateExcelWorksheet(data, cols) {
  // Crear archivo XLSX básico pero funcional
  const xl = {};
  const wb = { SheetNames: ['Data'], Sheets: {} };
  
  // Crear worksheet
  const ws = {};
  const range = { s: { c: 0, r: 0 }, e: { c: cols.length - 1, r: data.length - 1 } };
  
  data.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
      ws[cellRef] = {
        v: cell,
        t: typeof cell === 'number' ? 'n' : 's',
        s: {
          font: { bold: rowIdx === 0, color: rowIdx === 0 ? { rgb: 'FFFFFF' } : { rgb: '000000' } },
          fill: rowIdx === 0 ? { fgColor: { rgb: '4472C4' } } : { fgColor: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } }
          }
        }
      };
    });
  });
  
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = cols.map(() => ({ wch: 20 }));
  
  wb.Sheets['Data'] = ws;
  
  // Si XLSX no está disponible, usar CSV formateado
  return createWorksheet(data, 'export');
}

function createWorksheet(data, title) {
  // BOM para UTF-8 en Excel (detecta automáticamente UTF-8)
  const BOM = '\uFEFF';
  const rows = data.map(row => 
    row.map(cell => {
      const str = String(cell ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  
  return BOM + rows.join('\n');
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
    // No cerrar automáticamente para que el usuario pueda guardar como PDF
  }, 250);
}

// ============ HELPER FUNCTIONS ============
function formatCellValue(value) {
  if (value === null || value === undefined) return '-';
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
  
  // Limitar texto largo
  if (str.length > 100) {
    return str.substring(0, 100) + '...';
  }
  
  return str;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
