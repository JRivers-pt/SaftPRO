/**
 * Real Browser-Side SAFT Parser
 * Uses DOMParser to read XML structure directly in the browser.
 */

export const parseSaft = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");

                // Check for parser errors
                const parseError = xmlDoc.getElementsByTagName("parsererror");
                if (parseError.length > 0) {
                    throw new Error("Invalid XML File");
                }

                // --- 1. Header Extraction ---
                const header = xmlDoc.getElementsByTagName("Header")[0];
                const companyName = getTagValue(header, "CompanyName") || "Empresa Desconhecida";
                const companyID = getTagValue(header, "TaxRegistrationNumber") || "N/A";
                const fiscalYear = getTagValue(header, "FiscalYear") || new Date().getFullYear();
                const startDate = getTagValue(header, "StartDate");
                const endDate = getTagValue(header, "EndDate");

                // --- 2. MasterFiles (TaxTable & Customers) ---
                const masterFiles = xmlDoc.getElementsByTagName("MasterFiles")[0];
                const taxTableEntries = masterFiles ? masterFiles.getElementsByTagName("TaxTableEntry") : [];
                const taxTable = {};
                for (let i = 0; i < taxTableEntries.length; i++) {
                    const code = getTagValue(taxTableEntries[i], "TaxCode");
                    const percentage = parseFloat(getTagValue(taxTableEntries[i], "TaxPercentage") || "0");
                    taxTable[code] = percentage;
                }

                // Customer Map for Name Lookup
                const customerEntries = masterFiles ? masterFiles.getElementsByTagName("Customer") : [];
                const customerMap = {};
                for (let i = 0; i < customerEntries.length; i++) {
                    const id = getTagValue(customerEntries[i], "CustomerID");
                    const name = getTagValue(customerEntries[i], "CompanyName");
                    customerMap[id] = name;
                }

                // --- 3. Sales Totals & Invoice Extraction ---
                const salesInvoices = xmlDoc.getElementsByTagName("SalesInvoices")[0];
                const totalCredit = parseFloat(getTagValue(salesInvoices, "TotalCredit") || "0");
                const numberOfEntries = getTagValue(salesInvoices, "NumberOfEntries") || "0";

                const invoices = salesInvoices ? salesInvoices.getElementsByTagName("Invoice") : [];
                const invoiceList = [];
                const productMap = {};
                const clientVolumeMap = {};
                const monthlyValues = new Array(12).fill(0);
                const taxAggregation = {};

                // Limit processing to avoid browser crash on massive files
                const MAX_INVOICES = 10000; // Increased for Pro version

                for (let i = 0; i < invoices.length; i++) {
                    if (i >= MAX_INVOICES) break;

                    const invoiceDate = getTagValue(invoices[i], "InvoiceDate");
                    const invoiceNo = getTagValue(invoices[i], "InvoiceNo");
                    const customerID = getTagValue(invoices[i], "CustomerID");
                    const taxID = getTagValue(invoices[i], "CustomerTaxID") || "999999990";
                    const atcud = getTagValue(invoices[i], "ATCUD") || "";
                    
                    const docTotalsElement = invoices[i].getElementsByTagName("DocumentTotals")[0];
                    const docTotal = parseFloat(getTagValue(docTotalsElement, "GrossTotal") || "0");
                    const taxPayable = parseFloat(getTagValue(docTotalsElement, "TaxPayable") || "0");
                    const netTotal = parseFloat(getTagValue(docTotalsElement, "NetTotal") || "0");

                    // 3a. Monthly Distribution
                    if (invoiceDate) {
                        const month = new Date(invoiceDate).getMonth();
                        if (month >= 0 && month < 12) {
                            monthlyValues[month] += docTotal;
                        }
                    }

                    // 3b. Client Volume
                    const clientName = customerMap[customerID] || `Cliente ${customerID}`;
                    if (!clientVolumeMap[clientName]) clientVolumeMap[clientName] = 0;
                    clientVolumeMap[clientName] += docTotal;

                    invoiceList.push({
                        date: invoiceDate,
                        no: invoiceNo,
                        customer: clientName,
                        nif: taxID,
                        atcud: atcud,
                        total: docTotal,
                        vat: taxPayable,
                        net: netTotal
                    });

                    // 3c. Product & Tax Parsing (Lines)
                    const lines = invoices[i].getElementsByTagName("Line");
                    for (let j = 0; j < lines.length; j++) {
                        const prodDesc = getTagValue(lines[j], "ProductDescription") || "Desconhecido";
                        const creditAmount = parseFloat(getTagValue(lines[j], "CreditAmount") || "0");
                        
                        // Product Map
                        if (!productMap[prodDesc]) productMap[prodDesc] = 0;
                        productMap[prodDesc] += creditAmount;

                        // Tax Aggregation (Precise)
                        const taxElement = lines[j].getElementsByTagName("Tax")[0];
                        const taxCode = getTagValue(taxElement, "TaxCode") || "ISE";
                        const taxPercentage = parseFloat(getTagValue(taxElement, "TaxPercentage") || taxTable[taxCode] || "0");
                        const lineVat = creditAmount * (taxPercentage / 100);

                        if (!taxAggregation[taxCode]) {
                            taxAggregation[taxCode] = { code: taxCode, percentage: taxPercentage, base: 0, amount: 0 };
                        }
                        taxAggregation[taxCode].base += creditAmount;
                        taxAggregation[taxCode].amount += lineVat;
                    }
                }

                // --- 4. DATA TRANSFORMATION ---

                // Monthly Data
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const monthlyData = months.map((name, idx) => ({
                    name,
                    value: Math.round(monthlyValues[idx] * 100) / 100
                }));

                // Tax Breakdown
                const taxBreakdown = Object.values(taxAggregation).sort((a, b) => b.percentage - a.percentage);

                // Top Products
                const topProducts = Object.entries(productMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                // Top Clients
                const topClientsList = Object.entries(clientVolumeMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                // Fallbacks
                if (topProducts.length === 0) topProducts.push({ name: 'S/ Informação', value: 0 });
                if (topClientsList.length === 0) topClientsList.push({ name: 'S/ Informação', value: 0 });

                // --- 5. AUDIT & COMPATIBILITY ---
                let invalidNifCount = 0;
                let invoiceGaps = [];
                const nifRegex = /^\d{9}$/;

                invoiceList.forEach((inv, idx) => {
                    // NIF Validation (Excluding Generic)
                    if (inv.nif !== "999999990" && !nifRegex.test(inv.nif)) invalidNifCount++;

                    // Sequence Validation
                    const match = inv.no.match(/\/(\d+)$/);
                    if (match) {
                        const currentNo = parseInt(match[1]);
                        if (idx > 0) {
                            const prevMatch = invoiceList[idx - 1].no.match(/\/(\d+)$/);
                            if (prevMatch && parseInt(prevMatch[1]) !== currentNo - 1) {
                                if (invoiceGaps.length < 10) invoiceGaps.push(`${prevMatch[1]} -> ${currentNo}`);
                            }
                        }
                    }
                });

                const auditCompatibility = {
                    invoiceGaps,
                    invalidNifCount,
                    hashChainBroken: false,
                    totalTaxPayable: taxBreakdown.reduce((acc, curr) => acc + curr.amount, 0),
                    totalInvoiced: totalCredit
                };

                resolve({
                    fileName: file.name,
                    header: { companyName, companyID, fiscalYear, startDate, endDate },
                    kpi: {
                        totalSales: totalCredit,
                        totalInvoices: numberOfEntries,
                        productCount: Object.keys(productMap).length,
                        clientCount: Object.keys(clientVolumeMap).length
                    },
                    monthlyData,
                    taxBreakdown,
                    topProducts,
                    topClients: topClientsList,
                    invoiceList,
                    audit: auditCompatibility,
                    isRealData: true
                });

            } catch (err) {
                console.error("Parse Error:", err);
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
}

// Helper for safe tag reading
const getTagValue = (parent, tagName) => {
    if (!parent) return null;
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent : null;
}
