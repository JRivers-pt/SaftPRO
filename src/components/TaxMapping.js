"use client";
import styles from '../styles/Dashboard.module.css';

export default function TaxMapping({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className={styles.chartCard} style={{ marginTop: '24px' }}>
            <div className={styles.chartHeader}>
                <h2>Apuramento de IVA (Resumo de Taxas)</h2>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Código Taxa</th>
                            <th>Taxa (%)</th>
                            <th>Incidência (Base)</th>
                            <th>IVA Apurado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.code}</td>
                                <td>{row.percentage.toFixed(2)}%</td>
                                <td>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(row.base)}</td>
                                <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(row.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
