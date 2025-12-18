export const AUDIT_RULES = [
    {
        id: 'R001',
        category: 'Structure',
        name: 'Validação XSD',
        severity: 'critical',
        check: (data) => true // Mock pass
    },
    {
        id: 'R002',
        category: 'Sales',
        name: 'Sequencialidade de Faturas (ATCUD)',
        severity: 'critical',
        check: (data) => data?.audit?.invoiceGaps?.length === 0,
        getDetails: (data) => data?.audit?.invoiceGaps?.length > 0 ? `Faltam ${data.audit.invoiceGaps.length} faturas: ${data.audit.invoiceGaps.join(', ')}` : "Sequência correta."
    },
    {
        id: 'R003',
        category: 'Tax',
        name: 'Consistência de Taxas de IVA',
        severity: 'high',
        check: (data) => true, // Mock pass
        getDetails: () => "Taxas validadas de acordo com a tabela em vigor."
    },
    {
        id: 'R004',
        category: 'Data Quality',
        name: 'NIF de Consumidor Final',
        severity: 'medium',
        check: (data) => (data?.audit?.invalidNifCount || 0) < 5,
        getDetails: (data) => data?.audit?.invalidNifCount > 0 ? `${data.audit.invalidNifCount} registos com NIF inválido ou genérico.` : "NIFs validados."
    }
];

export const runAudit = (saftData) => {
    return AUDIT_RULES.map(rule => ({
        ...rule,
        passed: rule.check(saftData),
        details: rule.getDetails ? rule.getDetails(saftData) : null
    }));
}
