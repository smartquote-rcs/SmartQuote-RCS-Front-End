


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore
import * as XLSX from 'xlsx';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv';

/**
 * Exporta cotação e itens nos formatos PDF, Excel (XLSX) ou CSV.
 * @param cotacao Dados da cotação
 * @param itens Itens da cotação
 * @param format Formato de exportação ('pdf', 'xlsx', 'csv')
 */
export function exportCotacao({ cotacao, itens, format }: { cotacao: any; itens: any[]; format: ExportFormat }) {
  const locale = 'pt-PT';

  if (format === 'pdf') {
    // PDF em modo paisagem
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // Header estilizado
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA DE COTAÇÃO', pageWidth / 2, 45, { align: 'center' });

    // Logo fictício (círculo)
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth - 50, 35, 20, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(18);
    doc.text('RCS', pageWidth - 50, 42, { align: 'center' });

    // Dados da cotação (caixa)
    y = 90;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(30, y, pageWidth - 60, 80, 8, 8, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`ID Cotação:`, 50, y + 22);
    doc.text(`Cliente:`, 50, y + 42);
    doc.text(`Fornecedor:`, 50, y + 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cotacao.id ?? '-'}`, 140, y + 22);
    doc.text(`${cotacao.cliente ?? '-'}`, 140, y + 42);
    doc.text(`${cotacao.fornecedor ?? '-'}`, 140, y + 62);
    doc.setFont('helvetica', 'bold');
    doc.text(`Data:`, pageWidth / 2 + 10, y + 22);
    doc.text(`Valor Total:`, pageWidth / 2 + 10, y + 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cotacao.dataRecebido ? new Date(cotacao.dataRecebido).toLocaleDateString(locale) : '-'}`, pageWidth / 2 + 90, y + 22);
    doc.text(`${cotacao.orcamento_geral ?? '-'}`, pageWidth / 2 + 90, y + 42);

    // Tabela de itens detalhada
    const head = [[
      '#',
      'Descrição',
      'Quantidade',
      'Unidade',
      'Preço Unitário (AOA)',
      'Total (AOA)',
      'Marca',
      'Modelo',
      'Referência',
      'Observações'
    ]];
    const currency = (v: any) => {
      const n = Number(v);
      return isNaN(n) ? '-' : n.toLocaleString(locale, { style: 'currency', currency: 'AOA', minimumFractionDigits: 2 });
    };
    const body = itens.map((item, idx) => [
      String(idx + 1),
      item.item_descricao || '-',
      item.quantidade || '-',
      item.unidade || '-',
      currency(item.preco_unitario),
      currency(item.total),
      item.marca || '-',
      item.modelo || '-',
      item.referencia || '-',
      item.observacoes || '-'
    ]);

    autoTable(doc, {
      head,
      body,
      startY: y + 100,
      margin: { left: 30, right: 30 },
      tableWidth: pageWidth - 60,
      styles: {
        fontSize: 11,
        cellPadding: 6,
        valign: 'middle',
        overflow: 'linebreak',
        lineColor: [220, 220, 220],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [30, 64, 175],
        lineWidth: 1,
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      bodyStyles: { textColor: 30, lineColor: [220, 220, 220], lineWidth: 0.5 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 35 }, // #
        1: { cellWidth: 180, overflow: 'linebreak' }, // Descrição
        2: { halign: 'center', cellWidth: 60 }, // Quantidade
        3: { halign: 'center', cellWidth: 60 }, // Unidade
        4: { halign: 'right', cellWidth: 90 }, // Preço Unitário
        5: { halign: 'right', cellWidth: 90 }, // Total
        6: { cellWidth: 80, overflow: 'linebreak' }, // Marca
        7: { cellWidth: 80, overflow: 'linebreak' }, // Modelo
        8: { cellWidth: 80, overflow: 'linebreak' }, // Referência
        9: { cellWidth: 120, overflow: 'linebreak' }, // Observações
      },
      didDrawPage: () => {
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Gerado em: ${new Date().toLocaleString(locale)}`, 40, doc.internal.pageSize.getHeight() - 30);
        doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - 80, doc.internal.pageSize.getHeight() - 30);
      },
    });

    // Observações
    let obsY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 24 : y + 180;
    if (cotacao.motivo) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Observações:', 40, obsY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(String(cotacao.motivo), 40, obsY + 18, { maxWidth: pageWidth - 80 });
    }

    // Assinatura fictícia
    const signY = doc.internal.pageSize.getHeight() - 90;
    doc.setDrawColor(180);
    doc.line(pageWidth - 220, signY, pageWidth - 60, signY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text('Assinatura', pageWidth - 140, signY + 16, { align: 'center' });

    doc.save(`cotacao_${cotacao.id || 'fatura'}_${Date.now()}.pdf`);
    return;
  }

  // Excel (XLSX) ou CSV
  const wsData = [
    ['#', 'Descrição', 'Quantidade', 'Preço Unitário (AOA)', 'Total (AOA)'],
    ...itens.map((item: any, idx: number) => [
      String(idx + 1),
      item.item_descricao || '-',
      item.quantidade || '-',
      item.preco_unitario ?? '-',
      item.total ?? '-',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wsInfo = XLSX.utils.aoa_to_sheet([
    ['ID Cotação', cotacao.id ?? '-'],
    ['Cliente', cotacao.cliente ?? '-'],
    ['Fornecedor', cotacao.fornecedor ?? '-'],
    ['Data', cotacao.dataRecebido ? new Date(cotacao.dataRecebido).toLocaleDateString(locale) : '-'],
    ['Valor Total', cotacao.orcamento_geral ?? '-'],
    ['Observações', cotacao.motivo ?? '-'],
  ]);
  // Cria workbook manualmente para máxima compatibilidade de tipos
  const wb = {
    SheetNames: ['Itens', 'Cotação'],
    Sheets: {
      'Itens': ws,
      'Cotação': wsInfo,
    },
  };

  let fileType = '';
  let fileExt = '';
  let fileData: any;
  if (format === 'xlsx') {
    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    fileExt = 'xlsx';
    // @ts-ignore
    fileData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  } else {
    fileType = 'text/csv';
    fileExt = 'csv';
    // @ts-ignore
    fileData = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  }

  // Download
  const blob = new Blob([fileData], { type: fileType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cotacao_${cotacao.id || 'fatura'}_${Date.now()}.${fileExt}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
