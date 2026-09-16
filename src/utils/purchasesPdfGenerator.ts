import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyPurchase, Department } from '../types';

export interface PurchasesPDFOptions {
  monthFilter?: string; // 'all' or 'YYYY-MM'
  statusFilter?: string; // 'all', 'Entregue', 'Pendente / A caminho'
  technicianName?: string;
  purchases: MonthlyPurchase[];
  departments: Department[];
}

export function generatePurchasesReportPDF({
  monthFilter = 'all',
  statusFilter = 'all',
  technicianName = 'Responsável T.I.',
  purchases,
  departments,
}: PurchasesPDFOptions) {
  const doc = new jsPDF({
    orientation: 'landscape', // Landscape is ideal to accommodate url, supplier, values and dates clearly
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Filter purchases
  let filtered = [...purchases];

  if (monthFilter && monthFilter !== 'all') {
    filtered = filtered.filter(p => p.purchaseDate.startsWith(monthFilter));
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(p => p.status === statusFilter);
  }

  // Calculate totals
  const totalAmount = filtered.reduce((acc, p) => acc + (p.totalPrice || (p.quantity * p.unitPrice)), 0);
  const totalItemsCount = filtered.reduce((acc, p) => acc + p.quantity, 0);
  const deliveredCount = filtered.filter(p => p.status === 'Entregue').length;
  const pendingCount = filtered.filter(p => p.status !== 'Entregue' && p.status !== 'Cancelado').length;

  // Month label
  let monthLabel = 'Todas as Compras Registradas';
  if (monthFilter && monthFilter !== 'all') {
    const [year, month] = monthFilter.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    monthLabel = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  }

  // Header Background Bar
  doc.setFillColor(15, 15, 18);
  doc.rect(0, 0, 297, 24, 'F');

  // Red accent line
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 24, 297, 2, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ESTOQUE T.I. — RELATÓRIO MENSAL DE COMPRAS & AQUISIÇÕES', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`Período de Referência: ${monthLabel} | Emitido por: ${technicianName} em ${formattedDate} às ${formattedTime}`, 14, 18);

  // Status Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`REGISTROS: ${filtered.length}`, 255, 15);

  let currentY = 32;

  // Metrics Boxes (Summary row)
  const boxWidth = 63;
  const boxHeight = 16;
  const startX = 14;
  const gap = 6;

  // Box 1: Total Investido
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(startX, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL INVESTIDO (R$)', startX + 4, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38); // Red
  doc.text(totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), startX + 4, currentY + 12.5);

  // Box 2: Total Pedidos & Unidades
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(startX + (boxWidth + gap), currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DE PEDIDOS / PEÇAS', startX + (boxWidth + gap) + 4, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${filtered.length} pedidos (${totalItemsCount} itens)`, startX + (boxWidth + gap) + 4, currentY + 12.5);

  // Box 3: Entregues
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(startX + (boxWidth + gap) * 2, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CHEGOU / ENTREGUE', startX + (boxWidth + gap) * 2 + 4, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74); // Green
  doc.text(`${deliveredCount} compras`, startX + (boxWidth + gap) * 2 + 4, currentY + 12.5);

  // Box 4: A Caminho / Pendentes
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(startX + (boxWidth + gap) * 3, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('A CAMINHO / PENDENTES', startX + (boxWidth + gap) * 3 + 4, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(`${pendingCount} compras`, startX + (boxWidth + gap) * 3 + 4, currentY + 12.5);

  currentY += boxHeight + 6;

  // Table Data
  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const tableRows = filtered.map((p, idx) => {
    const urlDisplay = p.purchaseUrl 
      ? (p.purchaseUrl.length > 35 ? p.purchaseUrl.replace(/^https?:\/\//i, '').slice(0, 32) + '...' : p.purchaseUrl.replace(/^https?:\/\//i, ''))
      : 'Compra física / Direta';

    const arrivalDisplay = p.status === 'Entregue' 
      ? (p.arrivalDate ? formatDateBR(p.arrivalDate) : 'Entregue')
      : (p.status === 'Cancelado' ? 'Cancelado' : 'Aguardando entrega');

    return [
      String(idx + 1).padStart(2, '0'),
      p.itemName,
      p.storeOrVendor || 'Manual',
      urlDisplay,
      String(p.quantity),
      formatBRL(p.unitPrice),
      formatBRL(p.totalPrice || (p.quantity * p.unitPrice)),
      formatDateBR(p.purchaseDate),
      arrivalDisplay,
      p.status,
    ];
  });

  // If empty
  if (tableRows.length === 0) {
    tableRows.push([
      '—',
      'Nenhuma compra registrada para este filtro ou período.',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
    ]);
  }

  // Draw AutoTable
  autoTable(doc, {
    startY: currentY,
    head: [[
      '#',
      'Item / Descrição',
      'Onde Foi Comprado',
      'URL / Site da Compra',
      'Qtd',
      'Vl. Unitário',
      'Valor Final',
      'Data Compra',
      'Quando Chegou',
      'Status'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 20, 24],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    foot: filtered.length > 0 ? [[
      '',
      `TOTAL GERAL (${filtered.length} PEDIDOS)`,
      '',
      '',
      String(totalItemsCount),
      '',
      formatBRL(totalAmount),
      '',
      '',
      ''
    ]] : undefined,
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [31, 41, 55],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 36 },
      3: { cellWidth: 48, textColor: [37, 99, 235] }, // Blueish for URL
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] },
      7: { cellWidth: 22, halign: 'center' },
      8: { cellWidth: 24, halign: 'center' },
      9: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 9) {
          const val = data.cell.raw as string;
          if (val === 'Entregue') {
            data.cell.styles.textColor = [22, 163, 74];
          } else if (val === 'Cancelado') {
            data.cell.styles.textColor = [156, 163, 175];
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      }
    },
  });

  // Footer & Signatures
  // Get final Y from last table
  // @ts-expect-error jsPDF autotable internal state
  const finalY = doc.lastAutoTable?.finalY || currentY + 50;

  let signY = finalY + 12;
  if (signY > 175) {
    doc.addPage();
    signY = 30;
  }

  // Signature lines
  const sigWidth = 80;
  const leftX = 40;
  const rightX = 177;

  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.3);

  // Line 1
  doc.line(leftX, signY, leftX + sigWidth, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text(technicianName || 'Responsável T.I.', leftX + sigWidth / 2, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text('Emitente / Comprador T.I.', leftX + sigWidth / 2, signY + 7.5, { align: 'center' });

  // Line 2
  doc.line(rightX, signY, rightX + sigWidth, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text('Visto da Gerência / Diretoria', rightX + sigWidth / 2, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text('Aprovação Financeira / Conferência', rightX + sigWidth / 2, signY + 7.5, { align: 'center' });

  // Page Numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(`Sistema de Gestão de Estoque T.I. • Página ${i} de ${pageCount}`, 14, 204);
    doc.text(`Documento gerado em ${formattedDate} às ${formattedTime}`, 283, 204, { align: 'right' });
  }

  // Download PDF
  const safeMonth = (monthFilter || 'geral').replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `relatorio-compras-ti-${safeMonth}-${formattedDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
