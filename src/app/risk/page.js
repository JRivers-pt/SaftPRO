"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ShieldAlert, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import styles from '../../styles/Analysis.module.css';
import { parseSaft } from '../../lib/saftParser';
import { runAudit } from '../../lib/auditEngine';

export default function RiskPage() {
    const [loading, setLoading] = useState(true);
    const [auditResults, setAuditResults] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Simulate loading and processing
        const loadData = async () => {
            // Try getting real data from session
            const raw = sessionStorage.getItem('saftData');
            let data = null;

            if (raw) {
                data = JSON.parse(raw);
            } else {
                // Fallback for direct page access without upload (Mock)
                // We can't use parseSaft(null) anymore as it expects a file.
                // So we construct a basic mock object manually or redirect.
                // For user experience, we'll create a mock object.
                data = {
                    header: { companyName: "Demonstração (Sem Dados)" },
                    structure: { hasSourceDocuments: true },
                    audit: { invoiceGaps: ['FT A/99 (Simulado)'], invalidNifCount: 2, severity: 'critical' }
                };
            }

            const results = runAudit(data);

            setAuditResults(results);

            // Calculate score
            const passed = results.filter(r => r.passed).length;
            setScore(Math.round((passed / results.length) * 100));

            setLoading(false);
        };

        loadData();
    }, []);

    return (
        <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <Sidebar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Centro de Risco & Auditoria</h1>
                    <p className={styles.subtitle}>Auditoria técnica e fiscal (Regras DGCI/AT)</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                        <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <ScoreCard title="Score de Conformidade" value={`${score}/100`} status={score > 80 ? "Bom" : "Risco"} color={score > 80 ? "var(--success)" : "var(--error)"} />
                            <ScoreCard title="Erros Críticos" value={auditResults.filter(r => !r.passed && r.severity === 'critical').length} status="Bloqueante" color="var(--error)" />
                            <ScoreCard title="Avisos de Qualidade" value={auditResults.filter(r => !r.passed && r.severity !== 'critical').length} status="Rever" color="var(--warning)" />
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>Matriz de Auditoria</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {auditResults.map((rule) => (
                                    <RiskItem
                                        key={rule.id}
                                        title={rule.name}
                                        status={rule.passed ? 'pass' : 'fail'}
                                        severity={rule.severity}
                                        details={rule.details}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

const ScoreCard = ({ title, value, status, color }) => (
    <div className={styles.card} style={{ alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{title}</h3>
        <div style={{ fontSize: '32px', fontWeight: 700, color: color, marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--surface-highlight)', borderRadius: '12px', color: color }}>{status}</div>
    </div>
)

const RiskItem = ({ title, status, severity, details }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        background: 'var(--background)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{title}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>{severity}</span>
            </div>

            {status === 'pass' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Validado</span>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Falha</span>
                </div>
            )}
        </div>

        {/* Detail Section */}
        {details && (
            <div style={{
                marginTop: '12px',
                padding: '8px',
                background: status === 'pass' ? '#f0fdf4' : '#fef2f2',
                borderLeft: `4px solid ${status === 'pass' ? 'var(--success)' : 'var(--error)'}`,
                fontSize: '13px',
                color: 'var(--text-secondary)'
            }}>
                {details}
            </div>
        )}
    </div>
)
