import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (reportType, saftData) => {
    const doc = new jsPDF();
    const company = saftData?.header?.companyName || "Empresa";
    const year = saftData?.header?.fiscalYear || new Date().getFullYear();
    const today = new Date().toLocaleDateString('pt-PT');

    // HELPER: Currency Formatter
    const fmt = (val) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

    // --- PAGE 1: TITLE & EXECUTIVE SUMMARY ---

    // Brand
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text("ContaFranca", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Relatório de Análise SAFT", 14, 26);

    doc.setDrawColor(200);
    doc.line(14, 30, 196, 30);

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Cliente: ${company}`, 14, 45);
    doc.text(`Exercício Fiscal: ${year}`, 14, 52);
    doc.text(`Data de Emissão: ${today}`, 14, 59);

    if (saftData?.header?.companyID) {
        doc.text(`NIF: ${saftData.header.companyID}`, 100, 45);
    }

    // KPI Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 70, 182, 35, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("VOLUME DE VENDAS", 20, 80);
    doc.text("DOCUMENTOS", 80, 80);
    doc.text("IMPOSTO TOTAL (IVA)", 140, 80);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(fmt(saftData?.kpi?.totalSales || 0), 20, 90);
    doc.text(`${saftData?.kpi?.totalInvoices || 0}`, 80, 90);
    doc.text(fmt(saftData?.audit?.totalTaxPayable || 0), 140, 90);
    doc.setFont(undefined, 'normal');

    let finalY = 120;

    // --- SECTION 1: TOP PRODUCTS ---
    doc.setFontSize(12);
    doc.setTextColor(0, 50, 100);
    doc.text("1. Top Produtos / Serviços", 14, finalY);
    finalY += 5;

    const products = saftData?.topProducts || [];
    if (products.length > 0) {
        autoTable(doc, {
            startY: finalY,
            head: [['Descrição', 'Volume']],
            body: products.map(p => [p.name, fmt(p.value)]),
            theme: 'grid',
            headStyles: { fillColor: [230, 126, 34] }
        });
        finalY = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Dados insuficientes para análise de produtos.", 14, finalY + 10);
        finalY += 20;
    }

    // Check page break
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    // --- SECTION 2: VAT ANALYSIS ---
    doc.setFontSize(12);
    doc.setTextColor(0, 50, 100);
    doc.text("2. Mapa de Impostos e Taxas (IVA)", 14, finalY);
    finalY += 5;

    const taxes = saftData?.taxBreakdown || [];
    autoTable(doc, {
        startY: finalY,
        head: [['Taxa', 'Percentagem', 'Base Incidência', 'Total Imposto']],
        body: taxes.map(t => [t.code, `${t.percentage}%`, fmt(t.base), fmt(t.amount)]),
        theme: 'striped',
        headStyles: { fillColor: [39, 174, 96] },
        foot: [['TOTAL', '-', '-', fmt(saftData?.audit?.totalTaxPayable || 0)]]
    });
    finalY = doc.lastAutoTable.finalY + 15;

    // --- SECTION 3: AUDIT & RISK ---
    if (finalY > 240) {
        doc.addPage();
        finalY = 20;
    }

    doc.text("3. Auditoria de Conformidade (PT)", 14, finalY);
    finalY += 5;

    const audit = saftData?.audit || {};
    const risks = [
        ['Verificação', 'Estado', 'Resultado'],
        ['Estrutura ATCUD', audit.invoiceGaps?.length > 0 ? 'FALHA' : 'OK', audit.invoiceGaps?.length > 0 ? `${audit.invoiceGaps.length} Falhas seq.` : 'Sem quebras'],
        ['Validação NIFs', audit.invalidNifCount > 0 ? 'ATENÇÃO' : 'OK', `${audit.invalidNifCount} NIFs inválidos`],
        ['Assinatura Digital (Hash)', audit.hashChainBroken ? 'CRÍTICO' : 'OK', audit.hashChainBroken ? 'Cadeia Quebrada' : 'Válido']
    ];

    autoTable(doc, {
        startY: finalY,
        head: [risks[0]],
        body: risks.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [192, 57, 43] } // Red for audit
    });

    // -- FOOTER --
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Gerado por ContaFranca - Confidencial - Página ${i} de ${pageCount}`, 14, 285);
    }

    doc.save(`Analise_SAFT_${company.replace(/\s/g, '_')}_${year}.pdf`);
};

export const generateCSV = (reportType, saftData) => {
    // Advanced CSV Generator for Invoices using Real Data
    const list = saftData?.invoiceList || [];

    // Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data;Documento;Cliente;NIF;Total;IVA\n";

    if (list.length > 0) {
        list.forEach(inv => {
            const row = [
                inv.date,
                inv.no,
                inv.customer.replace(/;/g, ","), // Escape semicolons
                inv.nif,
                inv.total.toFixed(2).replace(".", ","),
                inv.vat.toFixed(2).replace(".", ",")
            ];
            csvContent += row.join(";") + "\n";
        });
    } else {
        // Fallback or empty message
        csvContent += "2024-01-01;SEM-DADOS;Sem Dados;999999990;0,00;0,00\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType.replace(/\s/g, '_')}_${saftData?.header?.fiscalYear || 2024}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
