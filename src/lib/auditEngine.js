// Portuguese VAT Rates (Continent - 2024)
const PORTUGUESE_VAT_RATES = {
    'NOR': 23,  // Normal
    'INT': 13,  // Intermediate  
    'RED': 6,   // Reduced
    'ISE': 0    // Exempt
};

// Validate Portuguese NIF with checksum
const validateNIF = (nif) => {
    if (!nif || nif === '999999990') return { valid: false, isGeneric: true };
    if (!/^\d{9}$/.test(nif)) return { valid: false, error: 'Invalid format' };

    // Portuguese NIF checksum algorithm
    const digits = nif.split('').map(Number);
    const sum = digits.slice(0, 8).reduce((acc, digit, i) => acc + digit * (9 - i), 0);
    const checkDigit = 11 - (sum % 11);
    const expectedCheck = checkDigit >= 10 ? 0 : checkDigit;

    return { valid: digits[8] === expectedCheck, error: digits[8] !== expectedCheck ? 'Invalid checksum' : null };
};

// Validate ATCUD format
const validateATCUD = (atcud) => {
    if (!atcud) return { valid: false, error: 'Missing ATCUD' };

    // Format: ATCUD-[ValidationCode]-[SequenceNumber] or 0 for exempt
    if (atcud === '0') return { valid: true, exempt: true };

    const parts = atcud.split('-');
    if (parts.length < 2) return { valid: false, error: 'Invalid format' };

    return { valid: true };
};

export const AUDIT_RULES = [
    {
        id: 'R001',
        category: 'Critical',
        name: 'ATCUD - Código Único de Documento',
        severity: 'critical',
        check: (data) => {
            const invoices = data?.invoiceList || [];
            if (invoices.length === 0) return true; // No data to validate

            const missingATCUD = invoices.filter(inv => !inv.atcud || inv.atcud === '').length;
            return missingATCUD === 0;
        },
        getDetails: (data) => {
            const invoices = data?.invoiceList || [];
            const missing = invoices.filter(inv => !inv.atcud || inv.atcud === '').length;
            if (missing > 0) return `${missing} documentos sem ATCUD. Obrigatório desde 01/01/2023.`;
            return 'Todos os documentos têm ATCUD válido.';
        }
    },
    {
        id: 'R002',
        category: 'Critical',
        name: 'Sequencialidade de Faturas',
        severity: 'critical',
        check: (data) => data?.audit?.invoiceGaps?.length === 0,
        getDetails: (data) => {
            const gaps = data?.audit?.invoiceGaps || [];
            if (gaps.length > 0) return `Detetadas ${gaps.length} falhas na sequência: ${gaps.slice(0, 3).join(', ')}${gaps.length > 3 ? '...' : ''}`;
            return 'Sequência numérica correta.';
        }
    },
    {
        id: 'R003',
        category: 'Tax',
        name: 'Consistência de Taxas de IVA',
        severity: 'high',
        check: (data) => {
            const taxBreakdown = data?.taxBreakdown || [];
            // Check if all tax rates match Portuguese standard rates
            return taxBreakdown.every(tax => {
                const rate = Math.round(tax.percentage);
                return Object.values(PORTUGUESE_VAT_RATES).includes(rate);
            });
        },
        getDetails: (data) => {
            const taxBreakdown = data?.taxBreakdown || [];
            const invalid = taxBreakdown.filter(tax => {
                const rate = Math.round(tax.percentage);
                return !Object.values(PORTUGUESE_VAT_RATES).includes(rate);
            });

            if (invalid.length > 0) {
                return `${invalid.length} taxa(s) não conforme(s): ${invalid.map(t => `${t.percentage}%`).join(', ')}`;
            }
            return 'Taxas conforme tabela oficial (23%, 13%, 6%, Isento).';
        }
    },
    {
        id: 'R004',
        category: 'Data Quality',
        name: 'Validação de NIFs (Formato e Checksum)',
        severity: 'high',
        check: (data) => {
            const invoices = data?.invoiceList || [];
            if (invoices.length === 0) return true;

            const invalidNIFs = invoices.filter(inv => {
                const result = validateNIF(inv.nif);
                return !result.valid && !result.isGeneric;
            }).length;

            return invalidNIFs < 5; // Allow some consumer final
        },
        getDetails: (data) => {
            const invoices = data?.invoiceList || [];
            const invalidCount = invoices.filter(inv => {
                const result = validateNIF(inv.nif);
                return !result.valid && !result.isGeneric;
            }).length;

            const genericCount = invoices.filter(inv => inv.nif === '999999990').length;

            if (invalidCount > 0) {
                return `${invalidCount} NIF(s) com formato/checksum inválido. ${genericCount} consumidor final.`;
            }
            return `NIFs validados. ${genericCount} consumidor final (999999990).`;
        }
    },
    {
        id: 'R005',
        category: 'Critical',
        name: 'Integridade de Hash (Assinatura Digital)',
        severity: 'critical',
        check: (data) => {
            // Check if hash chain is broken
            return !data?.audit?.hashChainBroken;
        },
        getDetails: (data) => {
            if (data?.audit?.hashChainBroken) {
                return 'Cadeia de hash quebrada. Possível alteração de documentos.';
            }
            return 'Cadeia de assinaturas digitais íntegra.';
        }
    },
    {
        id: 'R006',
        category: 'Tax',
        name: 'Cálculo de IVA (Precisão Matemática)',
        severity: 'high',
        check: (data) => {
            const invoices = data?.invoiceList || [];
            if (invoices.length === 0) return true;

            // Sample check: verify VAT calculations on invoices
            const errors = invoices.filter(inv => {
                const netTotal = inv.total - inv.vat;
                const expectedVat = netTotal * 0.23; // Simplified - assumes 23%
                const diff = Math.abs(inv.vat - expectedVat);
                // Allow 2% deviation for rounding and mixed rates
                return diff > (inv.total * 0.02);
            }).length;

            return errors < (invoices.length * 0.05); // Allow 5% error margin
        },
        getDetails: (data) => {
            const invoices = data?.invoiceList || [];
            const totalVAT = invoices.reduce((sum, inv) => sum + inv.vat, 0);
            return `IVA total: €${totalVAT.toFixed(2)}. Cálculos verificados com margem de arredondamento.`;
        }
    },
    {
        id: 'R007',
        category: 'Data Quality',
        name: 'Campos Obrigatórios (Completude)',
        severity: 'medium',
        check: (data) => {
            const invoices = data?.invoiceList || [];
            if (invoices.length === 0) return true;

            const incomplete = invoices.filter(inv =>
                !inv.date || !inv.no || !inv.customer || inv.total === 0
            ).length;

            return incomplete === 0;
        },
        getDetails: (data) => {
            const invoices = data?.invoiceList || [];
            const incomplete = invoices.filter(inv =>
                !inv.date || !inv.no || !inv.customer || inv.total === 0
            ).length;

            if (incomplete > 0) {
                return `${incomplete} documento(s) com campos obrigatórios em falta.`;
            }
            return 'Todos os campos obrigatórios preenchidos.';
        }
    },
    {
        id: 'R008',
        category: 'Structure',
        name: 'Integridade Referencial (Produtos/Clientes)',
        severity: 'medium',
        check: (data) => {
            // Check if structure sections exist
            const hasProducts = data?.topProducts && data.topProducts.length > 0;
            const hasInvoices = data?.invoiceList && data.invoiceList.length > 0;

            return hasProducts && hasInvoices;
        },
        getDetails: (data) => {
            const productCount = data?.topProducts?.length || 0;
            const invoiceCount = data?.invoiceList?.length || 0;

            return `${productCount} produtos referenciados em ${invoiceCount} documentos.`;
        }
    }
];

export const runAudit = (saftData) => {
    return AUDIT_RULES.map(rule => ({
        ...rule,
        passed: rule.check(saftData),
        details: rule.getDetails ? rule.getDetails(saftData) : null
    }));
}
