
import ExcelJS from 'exceljs';

export const generateProfessionalExcel = async (saftData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SaftPro by TechScire';
    workbook.created = new Date();

    const company = saftData?.header?.companyName || "Empresa";
    const year = saftData?.header?.fiscalYear || new Date().getFullYear();

    // 1. Create Worksheet
    const sheet = workbook.addWorksheet('Extrato de Faturação', {
        properties: { tabColor: { argb: 'FFFFFFFF' } },
        views: [{ showGridLines: true, state: 'frozen', ySplit: 5 }]
    });

    // 2. Define Columns with proper widths from the start
    sheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Nº Documento', key: 'docNo', width: 25 },
        { header: 'Cliente', key: 'customer', width: 35 },
        { header: 'NIF', key: 'nif', width: 15 },
        { header: 'Tipo', key: 'type', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Total Líquido', key: 'net', width: 15, style: { numFmt: '#,##0.00 "€"' } },
        { header: 'IVA', key: 'vat', width: 15, style: { numFmt: '#,##0.00 "€"' } },
        { header: 'Total Bruto', key: 'gross', width: 15, style: { numFmt: '#,##0.00 "€"', font: { bold: true } } }
    ];

    // 3. Add Title Header
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Relatório de Faturação - ${company}`;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    sheet.mergeCells('A2:H2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `Exercício Fiscal: ${year} | Gerado em: ${new Date().toLocaleDateString('pt-PT')}`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true };
    subtitleCell.alignment = { horizontal: 'center' };

    // Empty row before table
    sheet.getRow(5).values = ['Data', 'Nº Documento', 'Cliente', 'NIF', 'Tipo', 'Total Líquido', 'IVA', 'Total Bruto'];

    // Style Table Header (Row 5)
    const headerRow = sheet.getRow(5);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBE185D' } }; // TechScire Pink
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    // 4. Add Data
    const list = saftData?.invoiceList || [];
    let totalNet = 0;
    let totalVat = 0;
    let totalGross = 0;

    list.forEach(inv => {
        const net = inv.total - inv.vat;
        totalNet += net;
        totalVat += inv.vat;
        totalGross += inv.total;

        // Parse date reliably
        let dateVal = inv.date;
        // Try to convert to Date object if string
        if (typeof inv.date === 'string') {
            // Basic YYYY-MM-DD support
            dateVal = new Date(inv.date);
        }

        sheet.addRow({
            date: dateVal,
            docNo: inv.no,
            customer: inv.customer.replace(/;/g, ",").replace(/"/g, "") || "Consumidor Final",
            nif: inv.nif,
            type: inv.type || 'FT',
            net: net,
            vat: inv.vat,
            gross: inv.total
        });
    });

    // 5. Add Totals Row
    const totalRow = sheet.addRow({
        date: 'TOTAlS',
        docNo: `${list.length} Documentos`,
        customer: '',
        nif: '',
        type: '',
        net: totalNet,
        vat: totalVat,
        gross: totalGross
    });

    totalRow.font = { bold: true };
    totalRow.eachCell((cell, colNumber) => {
        if (colNumber >= 6) { // Net to Gross columns
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
            cell.border = { top: { style: 'double' } };
        }
    });

    // 6. Footer
    sheet.addRow([]); // Space
    const footerRow = sheet.addRow(['Powered by TechScire Solutions']);
    footerRow.font = { italic: true, color: { argb: 'FF888888' }, size: 9 };

    // 7. Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 8. Trigger Download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Faturas_${company.replace(/\s+/g, '_')}_${year}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
};
