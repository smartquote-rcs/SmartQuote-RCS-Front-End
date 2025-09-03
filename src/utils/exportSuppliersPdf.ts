import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Supplier } from '../types/index';

interface ExportOptions {
  companyName?: string;
  username?: string;
  locale?: string;
}

export function exportSuppliersPdf(suppliers: Supplier[], options: ExportOptions = {}) {
  const { companyName = 'RCS', username = 'Usuário', locale = 'pt-PT' } = options;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

  // Header branding
  doc.setFillColor(20, 32, 60);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${companyName} - Relatório de Fornecedores`, 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const generatedAt = new Date().toLocaleString(locale);
  doc.text(`Gerado em: ${generatedAt}`, 40, 58);
  doc.text(`Gerado por: ${username}`, 260, 58);

  // Prepare table data
  const head = [['ID','Nome','Email','Telefone','Site','Ativo','Cadastrado Em','Cadastrado Por','Atualizado Em','Atualizado Por']];
  const body: RowInput[] = suppliers.map(s => [
    String(s.id ?? ''),
    s.nome || '',
    s.contato_email || '',
    s.contato_telefone || '',
    s.site || '',
    s.ativo ? 'Sim' : 'Não',
    s.cadastrado_em ? formatDate(s.cadastrado_em, locale) : '-',
    s.cadastrado_por != null ? String(s.cadastrado_por) : '-',
    s.atualizado_em ? formatDate(s.atualizado_em, locale) : '-',
    s.atualizado_por != null ? String(s.atualizado_por) : '-',
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 90,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    bodyStyles: { textColor: 20 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  didDrawPage: (_data: any) => {
      // Footer
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - 80, pageHeight - 20);
      doc.text(`${companyName} © ${new Date().getFullYear()}`, 40, pageHeight - 20);
    },
  });

  // Summary section
  const total = suppliers.length;
  const ativos = suppliers.filter(s => s.ativo).length;
  const inativos = total - ativos;

  const lastTable: any = (doc as any).lastAutoTable;
  let summaryY = lastTable?.finalY ? lastTable.finalY + 20 : 90;
  if (summaryY > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    summaryY = 90;
  }
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.setFont('helvetica','bold');
  doc.text('Resumo', 40, summaryY);
  doc.setFont('helvetica','normal');
  doc.setFontSize(10);
  doc.text(`Total de fornecedores: ${total}`, 40, summaryY + 18);
  doc.text(`Ativos: ${ativos}`, 40, summaryY + 34);
  doc.text(`Inativos: ${inativos}`, 40, summaryY + 50);

  doc.save(`relatorio_fornecedores_${Date.now()}.pdf`);
}

function formatDate(value: string, locale: string) {
  try {
    return new Date(value).toLocaleString(locale);
  } catch {
    return value;
  }
}
