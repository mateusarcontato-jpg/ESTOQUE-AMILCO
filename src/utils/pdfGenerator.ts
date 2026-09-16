import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, PrinterItem, WithdrawalRecord, Department, Requester } from '../types';

export interface PDFReportOptions {
  reportType: 'complete' | 'withdrawals' | 'stock' | 'printers';
  departmentFilter?: string; // department id or 'all'
  periodFilter?: 'all' | 'today' | '7days' | '30days' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  technicianName?: string;
}

export function generateStockReportPDF({
  reportType,
  departmentFilter = 'all',
  periodFilter = 'all',
  startDate,
  endDate,
  technicianName = 'Responsável T.I.',
  products,
  printers,
  withdrawals,
  departments,
  requesters = [],
}: PDFReportOptions & {
  products: Product[];
  printers: PrinterItem[];
  withdrawals: WithdrawalRecord[];
  departments: Department[];
  requesters?: Requester[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
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

  // Filter withdrawals by period
  let filteredWithdrawals = [...withdrawals];
  if (periodFilter === 'today') {
    const todayStr = now.toISOString().slice(0, 10);
    filteredWithdrawals = filteredWithdrawals.filter(w => w.date.startsWith(todayStr));
  } else if (periodFilter === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredWithdrawals = filteredWithdrawals.filter(w => new Date(w.date) >= sevenDaysAgo);
  } else if (periodFilter === '30days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredWithdrawals = filteredWithdrawals.filter(w => new Date(w.date) >= thirtyDaysAgo);
  } else if (periodFilter === 'custom') {
    if (startDate) {
      filteredWithdrawals = filteredWithdrawals.filter(w => w.date.slice(0, 10) >= startDate);
    }
    if (endDate) {
      filteredWithdrawals = filteredWithdrawals.filter(w => w.date.slice(0, 10) <= endDate);
    }
  }

  // Filter by department if specified
  const selectedDep = departmentFilter !== 'all' ? departments.find(d => d.id === departmentFilter) : null;
  const depNameLabel = selectedDep ? selectedDep.name : 'Todas as Lojas / Unidades';

  if (selectedDep) {
    filteredWithdrawals = filteredWithdrawals.filter(w => w.destinationDepartmentId === selectedDep.id);
  }

  // Filter products by department if specified
  let filteredProducts = [...products];
  if (selectedDep) {
    filteredProducts = filteredProducts.filter(p => p.locationDepartmentId === selectedDep.id);
  }

  // Filter printers by department if specified
  let filteredPrinters = [...printers];
  if (selectedDep) {
    filteredPrinters = filteredPrinters.filter(p => p.departmentId === selectedDep.id);
  }

  // 1. Header Banner
  // Dark Red brand bar
  doc.setFillColor(153, 27, 27); // Deep red #991B1B
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ESTOQUE T.I. - RELATÓRIO OPERACIONAL', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CONTROLE DE PRODUTOS, RETIRADAS, SOLICITANTES E IMPRESSORAS', 14, 17);

  doc.setFontSize(8);
  doc.text(`Emissão: ${formattedDate} às ${formattedTime}`, 145, 11);
  doc.text(`Técnico: ${technicianName}`, 145, 17);

  // Subtitle / Filters Info Bar
  doc.setFillColor(243, 244, 246); // Neutral gray
  doc.rect(14, 28, 182, 10, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(14, 28, 182, 10, 'D');

  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  
  const reportTypeLabels = {
    complete: 'Geral Completo (Estoque, Impressoras e Retiradas)',
    withdrawals: 'Histórico Detalhado de Retiradas & Solicitantes',
    stock: 'Posição Atual do Estoque & Reposição',
    printers: 'Inventário de Impressoras (Cores & Modelos)',
  };

  let periodLabel = 'Histórico Completo';
  if (periodFilter === 'today') periodLabel = 'Hoje';
  else if (periodFilter === '7days') periodLabel = 'Últimos 7 dias';
  else if (periodFilter === '30days') periodLabel = 'Últimos 30 dias';
  else if (periodFilter === 'custom') {
    const sFmt = startDate ? startDate.split('-').reverse().join('/') : '';
    const eFmt = endDate ? endDate.split('-').reverse().join('/') : '';
    periodLabel = sFmt && eFmt ? `${sFmt} a ${eFmt}` : sFmt ? `A partir de ${sFmt}` : `Até ${eFmt}`;
  }

  doc.text(`Escopo: ${reportTypeLabels[reportType]}`, 18, 33.5);
  doc.text(`Unidade: ${depNameLabel}  |  Período: ${periodLabel}`, 18, 37);

  let currentY = 44;

  // 2. Executive KPI Summary Cards
  if (reportType === 'complete' || reportType === 'stock') {
    const totalProductsCount = filteredProducts.length;
    const totalUnitsCount = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = filteredProducts.filter(p => p.quantity <= p.minQuantity).length;
    const totalWithdrawalsCount = filteredWithdrawals.length;
    const totalWithdrawalUnits = filteredWithdrawals.reduce((sum, w) => sum + w.quantity, 0);

    // Box 1: Total Itens
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, currentY, 42, 15, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('PRODUTOS CADASTRADOS', 17, currentY + 5);
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(`${totalProductsCount} itens (${totalUnitsCount} un)`, 17, currentY + 11.5);

    // Box 2: Retiradas
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(60, currentY, 42, 15, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('TOTAL DE RETIRADAS', 63, currentY + 5);
    doc.setFontSize(11);
    doc.setTextColor(153, 27, 27);
    doc.text(`${totalWithdrawalsCount} saídas (${totalWithdrawalUnits} un)`, 63, currentY + 11.5);

    // Box 3: Impressoras
    const totalPrintersAvail = filteredPrinters.reduce((sum, pr) => sum + pr.quantityAvailable, 0);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(106, currentY, 42, 15, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('IMPRESSORAS DISPONÍVEIS', 109, currentY + 5);
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(`${totalPrintersAvail} unidades`, 109, currentY + 11.5);

    // Box 4: Alerta Reposição
    doc.setFillColor(lowStockCount > 0 ? 254 : 249, lowStockCount > 0 ? 242 : 250, lowStockCount > 0 ? 242 : 251);
    doc.roundedRect(152, currentY, 44, 15, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(lowStockCount > 0 ? 185 : 107, lowStockCount > 0 ? 28 : 114, lowStockCount > 0 ? 28 : 128);
    doc.text('ALERTA REPOSIÇÃO', 155, currentY + 5);
    doc.setFontSize(11);
    doc.setTextColor(lowStockCount > 0 ? 185 : 17, lowStockCount > 0 ? 28 : 24, lowStockCount > 0 ? 28 : 39);
    doc.text(lowStockCount > 0 ? `${lowStockCount} itens críticos!` : 'Estoque regular', 155, currentY + 11.5);

    currentY += 21;
  }

  // 3. TABLE: Retiradas e Solicitantes (If 'complete' or 'withdrawals')
  if (reportType === 'complete' || reportType === 'withdrawals') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    doc.text('1. Registro de Retiradas, Solicitantes e Destinos', 14, currentY);
    currentY += 3;

    const withdrawalRows = filteredWithdrawals.map(w => {
      const dateObj = new Date(w.date);
      const dateFormatted = `${dateObj.toLocaleDateString('pt-BR')} ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      const requesterFull = w.requesterSection ? `${w.requesterName} (${w.requesterSection})` : w.requesterName;
      const itemWithPrinter = w.targetPrinterName 
        ? `${w.itemName}\n(Para: ${w.targetPrinterName})` 
        : w.itemName;
      return [
        dateFormatted,
        itemWithPrinter,
        `-${w.quantity}`,
        w.destinationDepartmentName,
        requesterFull,
        w.technicianName || 'T.I.',
        w.ticketOrReason || 'Atendimento T.I.',
      ];
    });

    if (withdrawalRows.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      doc.text('Nenhuma movimentação de retirada registrada no período selecionado.', 14, currentY + 5);
      currentY += 12;
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [['Data/Hora', 'Item / Material', 'Qtd', 'Loja Destino', 'Solicitante & Setor', 'Técnico', 'Motivo / Chamado']],
        body: withdrawalRows,
        theme: 'grid',
        headStyles: {
          fillColor: [153, 27, 27],
          textColor: 255,
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'left',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          textColor: [31, 41, 55],
        },
        columnStyles: {
          0: { cellWidth: 23 },
          1: { cellWidth: 32, fontStyle: 'bold' },
          2: { cellWidth: 10, halign: 'center', textColor: [185, 28, 28], fontStyle: 'bold' },
          3: { cellWidth: 26 },
          4: { cellWidth: 35 },
          5: { cellWidth: 20 },
          6: { cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 },
      });

      // Update currentY after table
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Check if we need page break before next section
  if (currentY > 230 && (reportType === 'complete' || reportType === 'stock' || reportType === 'printers')) {
    doc.addPage();
    currentY = 20;
  }

  // 4. TABLE: Produtos & Estoque
  if (reportType === 'complete' || reportType === 'stock') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    doc.text(reportType === 'complete' ? '2. Posição Atual de Produtos & Estoque' : '1. Posição Atual de Produtos & Estoque', 14, currentY);
    currentY += 3;

    const productRows = filteredProducts.map(p => {
      const dep = departments.find(d => d.id === p.locationDepartmentId);
      const isCritical = p.quantity <= p.minQuantity;
      const statusText = p.quantity === 0 ? 'ZERADO' : isCritical ? 'REPOSIÇÃO NECESSÁRIA' : 'REGULAR';
      return [
        p.name,
        p.category,
        dep ? dep.name : 'Geral',
        p.notes || p.patrimonyCode || 'Bancada T.I.',
        `${p.quantity} ${p.unit}`,
        `${p.minQuantity} ${p.unit}`,
        statusText,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Nome do Produto', 'Categoria', 'Unidade', 'Localização / Gaveta', 'Saldo Atual', 'Estoque Mín.', 'Situação']],
      body: productRows,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 41, 55], // Slate dark
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [31, 41, 55],
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 26 },
        2: { cellWidth: 26 },
        3: { cellWidth: 28 },
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 'auto', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw as string;
          if (val === 'ZERADO' || val === 'REPOSIÇÃO NECESSÁRIA') {
            data.cell.styles.textColor = [185, 28, 28];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need page break before printers
  if (currentY > 230 && (reportType === 'complete' || reportType === 'printers')) {
    doc.addPage();
    currentY = 20;
  }

  // 5. TABLE: Impressoras (Cores & Modelos)
  if (reportType === 'complete' || reportType === 'printers') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    const sectionNum = reportType === 'complete' ? '3' : '1';
    doc.text(`${sectionNum}. Inventário Especializado de Impressoras (Cores & Modelos)`, 14, currentY);
    currentY += 3;

    const printerRows = filteredPrinters.map(pr => {
      const dep = departments.find(d => d.id === pr.departmentId);
      return [
        `${pr.brand} ${pr.model}`,
        pr.colorType,
        pr.serialNumber || pr.patrimonyNumber || '-',
        dep ? dep.name : 'CD',
        `${pr.quantityAvailable} un`,
        pr.status,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Marca / Modelo', 'Tipo de Impressão (Cor)', 'Série / Patrimônio', 'Localização Atual', 'Qtd Disp.', 'Status Operacional']],
      body: printerRows,
      theme: 'grid',
      headStyles: {
        fillColor: [153, 27, 27],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [31, 41, 55],
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 32, fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // 6. Signatures & Validation Footer (at bottom of last page or after content)
  if (currentY > 240) {
    doc.addPage();
    currentY = 30;
  } else {
    currentY = Math.max(currentY, 240);
  }

  // Horizontal line for signatures
  doc.setDrawColor(209, 213, 219);
  doc.line(20, currentY + 15, 85, currentY + 15);
  doc.line(125, currentY + 15, 190, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Assinatura do Técnico / T.I.', 52.5, currentY + 19, { align: 'center' });
  doc.text('Visto da Gerência / Loja', 157.5, currentY + 19, { align: 'center' });

  // Page numbering across all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Relatório gerado automaticamente pelo Sistema de Estoque T.I. Corporativo - Página ${i} de ${totalPages}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Download filename
  const cleanDepName = selectedDep ? selectedDep.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'todas-lojas';
  const fileName = `relatorio-estoque-ti-${cleanDepName}-${now.toISOString().slice(0, 10)}.pdf`;

  doc.save(fileName);
}
