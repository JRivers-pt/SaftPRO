"use client";
import { Package } from 'lucide-react';
import styles from '../styles/Dashboard.module.css';

export default function TopProducts({ products }) {
    if (!products || products.length === 0) return null;

    const maxVal = Math.max(...products.map(p => p.value));

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartHeader} style={{ marginBottom: '16px' }}>
                <h2>Top Produtos / Serviços</h2>
                <Package size={20} color="var(--text-secondary)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {products.map((p, idx) => (
                    <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{p.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p.value)}
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'var(--surface-highlight)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(p.value / maxVal) * 100}%`,
                                height: '100%',
                                background: 'var(--accent)', // Cyan
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
