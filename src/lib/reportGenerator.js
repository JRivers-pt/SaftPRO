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

    doc.text("3. Auditoria de Conformidade e Análise de Risco", 14, finalY);
    finalY += 5;

    const audit = saftData?.audit || {};

    // Build comprehensive risk table with real data
    const risks = [
        ['Verificação', 'Estado', 'Detalhes'],
        [
            'Sequência de Faturas (ATCUD)',
            audit.invoiceGaps?.length > 0 ? '⚠️ FALHA' : '✓ OK',
            audit.invoiceGaps?.length > 0
                ? `${audit.invoiceGaps.length} quebra(s) detetada(s)`
                : 'Numeração sequencial correta'
        ],
        [
            'Validação de NIFs',
            audit.invalidNifCount > 0 ? '⚠️ ATENÇÃO' : '✓ OK',
            audit.invalidNifCount > 0
                ? `${audit.invalidNifCount} NIF(s) inválido(s) encontrado(s)`
                : 'Todos os NIFs válidos'
        ],
        [
            'Cadeia de Hash (Assinatura)',
            audit.hashChainBroken ? '❌ CRÍTICO' : '✓ OK',
            audit.hashChainBroken
                ? 'Integridade comprometida - Cadeia quebrada'
                : 'Assinaturas digitais válidas'
        ],
        [
            'Total Taxável (Base IVA)',
            '✓ OK',
            fmt(audit.totalInvoiced || 0)
        ],
        [
            'IVA a Entregar ao Estado',
            '✓ OK',
            fmt(audit.totalTaxPayable || 0)
        ]
    ];

    autoTable(doc, {
        startY: finalY,
        head: [risks[0]],
        body: risks.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [192, 57, 43], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 65 },
            1: { cellWidth: 35, halign: 'center' },
            2: { cellWidth: 82 }
        },
        didParseCell: function (data) {
            // Color-code the status column
            if (data.column.index === 1 && data.section === 'body') {
                const text = data.cell.text[0];
                if (text.includes('CRÍTICO')) {
                    data.cell.styles.textColor = [192, 57, 43]; // Red
                    data.cell.styles.fontStyle = 'bold';
                } else if (text.includes('FALHA') || text.includes('ATENÇÃO')) {
                    data.cell.styles.textColor = [230, 126, 34]; // Orange
                    data.cell.styles.fontStyle = 'bold';
                } else if (text.includes('OK')) {
                    data.cell.styles.textColor = [39, 174, 96]; // Green
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    finalY = doc.lastAutoTable.finalY + 10;

    // Add risk summary box if there are issues
    const totalIssues = (audit.invoiceGaps?.length || 0) + (audit.invalidNifCount || 0) + (audit.hashChainBroken ? 1 : 0);

    if (totalIssues > 0) {
        if (finalY > 240) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFillColor(255, 243, 224);
        doc.roundedRect(14, finalY, 182, 25, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(230, 126, 34);
        doc.setFont(undefined, 'bold');
        doc.text(`⚠️ ATENÇÃO: ${totalIssues} problema(s) detetado(s)`, 20, finalY + 8);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('Recomendamos ação corretiva para garantir conformidade fiscal.', 20, finalY + 16);

        finalY += 30;
    }

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
    // Professional Excel-ready CSV with proper formatting
    const list = saftData?.invoiceList || [];
    const company = saftData?.header?.companyName || "Empresa";
    const year = saftData?.header?.fiscalYear || new Date().getFullYear();

    // Build CSV with BOM for Excel compatibility
    let csvContent = "\uFEFF"; // UTF-8 BOM for proper Excel encoding

    // Title row
    csvContent += `Relatório de Faturas - ${company}\n`;
    csvContent += `Exercício Fiscal: ${year}\n`;
    csvContent += `Gerado em: ${new Date().toLocaleDateString('pt-PT')}\n`;
    csvContent += `\n`; // Empty line

    // Header row with styled columns
    csvContent += "Data;Nº Documento;Cliente;NIF;Total s/ IVA;IVA;Total c/ IVA;Tipo Doc\n";

    let totalNet = 0;
    let totalVAT = 0;
    let totalGross = 0;

    if (list.length > 0) {
        list.forEach(inv => {
            const netAmount = inv.total - inv.vat;
            totalNet += netAmount;
            totalVAT += inv.vat;
            totalGross += inv.total;

            const row = [
                inv.date,
                inv.no,
                inv.customer.replace(/;/g, ",").replace(/"/g, ""), // Clean special chars
                inv.nif || "999999990",
                netAmount.toFixed(2).replace(".", ","),
                inv.vat.toFixed(2).replace(".", ","),
                inv.total.toFixed(2).replace(".", ","),
                inv.type || "FT"
            ];
            csvContent += row.join(";") + "\n";
        });

        // Add summary row
        csvContent += "\n"; // Empty line
        csvContent += `TOTAIS;;;${list.length} documento(s);${totalNet.toFixed(2).replace(".", ",")};${totalVAT.toFixed(2).replace(".", ",")};${totalGross.toFixed(2).replace(".", ",")}\n`;

    } else {
        csvContent += "Sem dados disponíveis;;;;;;;;\n";
    }

    // Footer
    csvContent += "\n";
    csvContent += `Gerado por SAFT Pro - ContaFranca\n`;

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `Faturas_${company.replace(/\s/g, '_')}_${year}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
