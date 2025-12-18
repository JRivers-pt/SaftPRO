"use client";
import styles from '../styles/Dashboard.module.css';

export default function VatDashboard({ overrideSales, overrideVat }) {
    // If props are provided, use them. Otherwise fallback to 0 (or mock if strictly needed, but user asked for precision).
    // Precision means: If we read 0 purchases, we show 0 purchases.

    const salesBase = overrideSales || 0;
    const salesVat = overrideVat || 0;

    const purchasesBase = 0; // Standard SAFT (Billing) does not contain purchases
    const purchasesVat = 0;

    const vatData = [
        { type: 'Vendas (Saídas)', base: salesBase, vat: salesVat, total: salesBase + salesVat },
        { type: 'Compras (Entradas)*', base: purchasesBase, vat: purchasesVat, total: purchasesBase + purchasesVat },
        { type: 'Regularizações', base: 0.00, vat: 0.00, total: 0.00 },
    ];

    const netVat = vatData[0].vat - vatData[1].vat + vatData[2].vat;

    return (
        <div className={styles.chartCard} style={{ marginTop: '24px' }}>
            <div className={styles.chartHeader} style={{ marginBottom: '20px' }}>
                <h2>Mapa de Apuramento IVA (Simulação Trimestre Atual)</h2>
                <span style={{ fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                    Em Tempo Real
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Main Table */}
                <div className={styles.tableWrapper} style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ background: 'transparent', paddingLeft: 0 }}>Natureza</th>
                                <th style={{ textAlign: 'right', background: 'transparent' }}>Base Tributável</th>
                                <th style={{ textAlign: 'right', background: 'transparent' }}>Valor IVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vatData.map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ paddingLeft: 0, fontWeight: 500 }}>{row.type}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '14px' }}>
                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(row.base)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(row.vat)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Big Number Summary */}
                <div style={{
                    background: netVat > 0 ? 'var(--primary-light)' : '#dcfce7',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {netVat > 0 ? 'IVA a Pagar ao Estado' : 'IVA a Recuperar'}
                    </h3>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: 800,
                        color: netVat > 0 ? 'var(--primary)' : 'var(--success)',
                        margin: '12px 0'
                    }}>
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Math.abs(netVat))}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        *Valores sujeitos a validação. O SAFT de Faturação não contém dados de Compras (Dedutível).
                    </p>
                </div>
            </div>
        </div>
    );
}
