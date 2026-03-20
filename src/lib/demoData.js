export const demoData = {
    fileName: "DEMO_SAFT_2024.xml",
    header: {
        companyName: "Tecnologia & Inovação, Lda.",
        companyID: "501234567",
        fiscalYear: "2024",
        startDate: "2024-01-01",
        endDate: "2024-12-31"
    },
    kpi: {
        totalSales: 1254300.50,
        totalInvoices: 4820,
        productCount: 142,
        clientCount: 856
    },
    monthlyData: [
        { name: 'Jan', value: 92000 },
        { name: 'Fev', value: 85000 },
        { name: 'Mar', value: 105000 },
        { name: 'Abr', value: 112000 },
        { name: 'Mai', value: 98000 },
        { name: 'Jun', value: 120000 },
        { name: 'Jul', value: 135000 },
        { name: 'Ago', value: 75000 },
        { name: 'Set', value: 110000 },
        { name: 'Out', value: 102000 },
        { name: 'Nov', value: 118000 },
        { name: 'Dez', value: 145000 }
    ],
    taxBreakdown: [
        { code: 'NOR', percentage: 23, base: 1050000, amount: 241500 },
        { code: 'INT', percentage: 13, base: 154300.50, amount: 20059.06 },
        { code: 'ISE', percentage: 0, base: 50000, amount: 0 }
    ],
    topProducts: [
        { name: 'Consultoria de Software', value: 450000 },
        { name: 'Licenças Enterprise', value: 320000 },
        { name: 'Suporte Premium', value: 180000 },
        { name: 'Formação Técnica', value: 120000 },
        { name: 'Serviços de Cloud', value: 85000 }
    ],
    topClients: [
        { name: 'Global Solutions SA', value: 210000 },
        { name: 'Inova Corp', value: 185000 },
        { name: 'Tech Direct Lda', value: 150000 },
        { name: 'Prime Finance', value: 120000 },
        { name: 'EduCloud Portugal', value: 95000 }
    ],
    invoiceList: [], // Will be empty for demo as it's too large
    audit: {
        invoiceGaps: ["1245 -> 1247", "3301 -> 3305"],
        invalidNifCount: 3,
        hashChainBroken: false,
        totalTaxPayable: 261559.06,
        totalInvoiced: 1254300.50
    },
    isRealData: true,
    isDemo: true
};
