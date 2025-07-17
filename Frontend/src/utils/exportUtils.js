import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generic CSV export
export function exportToCSV(headers, rows, filename = 'table.csv') {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// Generic PDF export using function-call form for autoTable
export function exportToPDF(headers, rows, filename = 'table.pdf', title = 'Table Export') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [54, 162, 235] }
  });

  doc.save(filename);
} 