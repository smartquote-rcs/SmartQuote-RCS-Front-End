import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuotationsSummaryData {
  aprovadas: number;
  rejeitadas: number;
  pendentes: number;
  currency: string;
  cotacoes: any[];
}

interface ProductsData {
  total: number;
  currency: string;
  produtos: any[];
}

interface SuppliersData {
  total: number;
  currency: string;
  fornecedores: any[];
}

const formatDate = (date: string | Date, locale: string = 'pt-PT'): string => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export async function exportQuotationsSummaryPdf(data: QuotationsSummaryData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE COTAÇÕES', pageWidth / 2, 35, { align: 'center' });
  doc.text('LISTA COMPLETA', pageWidth / 2, 55, { align: 'center' });

  // Tentar carregar o logotipo RCS.png
  try {
    const img = new Image();
    img.src = '/RCS.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    doc.addImage(img, 'PNG', pageWidth - 100, 20, 40, 40);
  } catch (error) {
    // Fallback com texto
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth - 50, 40, 20, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(16);
    doc.text('RCS', pageWidth - 50, 47, { align: 'center' });
  }

  // Data de geração
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatDate(new Date())}`, 40, 110);

  // Resumo geral
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TODAS AS COTAÇÕES`, 40, 130);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de cotações no sistema: ${data.cotacoes.length}`, 40, 150);

  // Tabela de cotações
  let finalY = 170;
  if (data.cotacoes && data.cotacoes.length > 0) {
    const tableHead = [['ID', 'Data', 'Status', 'Fornecedor', 'Valor Total', 'Observações']];
    const tableBody = data.cotacoes.map(cotacao => [
      cotacao.id?.toString() || cotacao.cotacao_id?.toString() || '-',
      cotacao.data_criacao ? formatDate(cotacao.data_criacao) : 
       cotacao.created_at ? formatDate(cotacao.created_at) : '-',
      cotacao.status || (cotacao.aprovacao === true ? 'Aprovada' : cotacao.aprovacao === false ? 'Rejeitada' : 'Pendente'),
      cotacao.fornecedor || cotacao.fornecedor_nome || cotacao.supplier_name || '-',
      cotacao.valor_total ? `${data.currency} ${parseFloat(cotacao.valor_total).toFixed(2)}` : 
       cotacao.orcamento_geral ? `${data.currency} ${parseFloat(cotacao.orcamento_geral).toFixed(2)}` :
       cotacao.valor ? `${data.currency} ${parseFloat(cotacao.valor).toFixed(2)}` : '-',
      cotacao.observacoes || cotacao.observacao || cotacao.comments || '-'
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 170,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didDrawPage: function (data) {
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      }
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text('Nenhuma cotação encontrada no sistema.', 40, 170);
    finalY = 190;
  }

  // Resumo de status (no final do documento)
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Se não houver espaço suficiente na página atual, adicionar nova página
  if (finalY > pageHeight - 100) {
    doc.addPage();
    finalY = 40;
  } else {
    finalY += 30;
  }

  // Seção de resumo compacta e clássica
  doc.setFillColor(245, 247, 250);
  doc.rect(40, finalY - 10, pageWidth - 80, 70, 'F');
  
  // Título do resumo
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO POR STATUS', pageWidth / 2, finalY + 15, { align: 'center' });
  
  // Labels das categorias
  const startX = pageWidth / 2 - 120;
  const colWidth = 80;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('APROVADAS', startX, finalY + 35, { align: 'center' });
  doc.text('REJEITADAS', startX + colWidth, finalY + 35, { align: 'center' });
  doc.text('PENDENTES', startX + (colWidth * 2), finalY + 35, { align: 'center' });
  
  // Valores
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(data.aprovadas.toString(), startX, finalY + 50, { align: 'center' });
  doc.text(data.rejeitadas.toString(), startX + colWidth, finalY + 50, { align: 'center' });
  doc.text(data.pendentes.toString(), startX + (colWidth * 2), finalY + 50, { align: 'center' });
  
  // Total
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Total: ${data.aprovadas + data.rejeitadas + data.pendentes} cotações`, pageWidth / 2, finalY + 65, { align: 'center' });

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('SmartQuote RCS - Sistema de Gestão de Cotações', pageWidth / 2, pageHeight - 30, { align: 'center' });

  const currentDate = new Date();
  doc.save(`cotacoes-completo-${currentDate.toISOString().split('T')[0]}.pdf`);
}

export async function exportProductsSummaryPdf(data: ProductsData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE PRODUTOS', pageWidth / 2, 35, { align: 'center' });
  doc.text('LISTA COMPLETA', pageWidth / 2, 55, { align: 'center' });

  // Tentar carregar o logotipo RCS.png
  try {
    const img = new Image();
    img.src = '/RCS.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    doc.addImage(img, 'PNG', pageWidth - 100, 20, 40, 40);
  } catch (error) {
    // Fallback com texto
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth - 50, 40, 20, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(16);
    doc.text('RCS', pageWidth - 50, 47, { align: 'center' });
  }

  // Data de geração
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatDate(new Date())}`, 40, 110);

  // Resumo
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL DE PRODUTOS: ${data.total}`, 40, 130);

  // Tabela de produtos
  if (data.produtos && data.produtos.length > 0) {
    const tableHead = [['ID', 'Nome', 'Descrição', 'Categoria', 'Preço', 'Status']];
    const tableBody = data.produtos.map(produto => [
      produto.id?.toString() || produto.produto_id?.toString() || '-',
      produto.nome || produto.name || '-',
      produto.descricao ? (produto.descricao.length > 50 ? produto.descricao.substring(0, 50) + '...' : produto.descricao) : 
       produto.description ? (produto.description.length > 50 ? produto.description.substring(0, 50) + '...' : produto.description) : '-',
      produto.categoria || produto.category || '-',
      produto.preco ? `${data.currency} ${parseFloat(produto.preco).toFixed(2)}` : 
       produto.price ? `${data.currency} ${parseFloat(produto.price).toFixed(2)}` : '-',
      produto.ativo === true ? 'Ativo' : produto.ativo === false ? 'Inativo' : 
       produto.active === true ? 'Ativo' : produto.active === false ? 'Inativo' : '-'
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 160,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text('Nenhum produto encontrado no sistema.', 40, 160);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('SmartQuote RCS - Sistema de Gestão de Cotações', pageWidth / 2, pageHeight - 30, { align: 'center' });

  doc.save(`produtos-completo-${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportSuppliersSummaryPdf(data: SuppliersData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE FORNECEDORES', pageWidth / 2, 35, { align: 'center' });
  doc.text('LISTA COMPLETA', pageWidth / 2, 55, { align: 'center' });

  // Tentar carregar o logotipo RCS.png
  try {
    const img = new Image();
    img.src = '/RCS.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    doc.addImage(img, 'PNG', pageWidth - 100, 20, 40, 40);
  } catch (error) {
    // Fallback com texto
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth - 50, 40, 20, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(16);
    doc.text('RCS', pageWidth - 50, 47, { align: 'center' });
  }

  // Data de geração
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatDate(new Date())}`, 40, 110);

  // Resumo
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL DE FORNECEDORES: ${data.total}`, 40, 130);

  // Tabela de fornecedores
  if (data.fornecedores && data.fornecedores.length > 0) {
    const tableHead = [['ID', 'Nome', 'Email', 'Telefone', 'Status']];
    const tableBody = data.fornecedores.map(fornecedor => [
      fornecedor.id?.toString() || fornecedor.fornecedor_id?.toString() || '-',
      fornecedor.nome || fornecedor.name || '-',
      fornecedor.contato_email || fornecedor.email || '-',
      fornecedor.contato_telefone || fornecedor.telefone || fornecedor.phone || '-',
      fornecedor.ativo === true ? 'Ativo' : fornecedor.ativo === false ? 'Inativo' : 
       fornecedor.active === true ? 'Ativo' : fornecedor.active === false ? 'Inativo' : '-'
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 160,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text('Nenhum fornecedor encontrado no sistema.', 40, 160);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('SmartQuote RCS - Sistema de Gestão de Cotações', pageWidth / 2, pageHeight - 30, { align: 'center' });

  doc.save(`fornecedores-completo-${new Date().toISOString().split('T')[0]}.pdf`);
}
