import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanySettings } from '../types';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  isNumeric?: boolean;
}

export function validateAndTriggerPrint(options?: any) {
  try {
    window.print();
  } catch (err) {
    console.error('Print trigger error:', err);
  }
}

export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  fileName: string,
  sheetTitle: string = 'Export',
  companySettings?: CompanySettings,
  subtitle?: string,
  options?: any
) {
  try {
    // Format data rows according to column keys
    const rows = data.map((item) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        row[col.header] = item[col.key] !== undefined ? item[col.key] : '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths if provided
    worksheet['!cols'] = columns.map((col) => ({
      wch: col.width || Math.max(col.header.length + 4, 12),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle.slice(0, 31));

    const safeName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, safeName);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
  }
}

export function exportToPdf(
  data: any[],
  columns: ExportColumn[],
  fileName: string,
  title: string,
  companySettings?: CompanySettings,
  orientation: any = 'p',
  subtitle?: string,
  extra?: any
) {
  try {
    const doc = new jsPDF({
      orientation: orientation === 'l' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = companySettings?.companyName || 'KISHAN BOTANIX LTD.';
    const companyAddress = companySettings?.address || 'Certified Potato Seed Storage & Cold Storage Management';

    // Header Branding
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(companyName.toUpperCase(), 14, 15);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(companyAddress, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(title, 14, 27);

    if (subtitle) {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, 14, 32);
    }

    const tableHeaders = columns.map((c) => c.header);
    const tableData = data.map((item) =>
      columns.map((c) => (item[c.key] !== undefined ? String(item[c.key]) : ''))
    );

    autoTable(doc, {
      startY: subtitle ? 36 : 31,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    doc.save(safeName);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
  }
}
