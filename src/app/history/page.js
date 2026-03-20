"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/Dashboard.module.css';
import { FileStack, Calendar, Building2, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        // 1. Get Local
        const localRaw = localStorage.getItem('saftHistory');
        let localHistory = localRaw ? JSON.parse(localRaw) : [];

        // 2. Get Cloud
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase.from('saft_logs')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                const cloudHistory = data.map(item => ({
                    id: item.id,
                    fileName: item.file_name,
                    company: item.company_name,
                    nif: item.tax_id,
                    year: item.fiscal_year,
                    totalSales: item.total_sales,
                    dateAnalyzed: item.created_at,
                    isCloud: true
                }));
                
                // Merge and deduplicate by NIF
                const combined = [...cloudHistory];
                localHistory.forEach(lh => {
                    if (!combined.find(ch => ch.nif === lh.nif)) {
                        combined.push(lh);
                    }
                });
                setHistory(combined);
            } else {
                setHistory(localHistory);
            }
        } else {
            setHistory(localHistory);
        }
        setLoading(false);
    };

    const loadAnalysis = (item) => {
        // In a real app, we'd fetch the full data. 
        // For this local version, we'd need to store the FULL data in indexedDB or similar.
        // However, for now, we'll let the user know they can see the metadata,
        // but re-uploading is needed for the full drill-down if not in sessionStorage.
        
        // If it's the demo, we can just reload it
        if (item.nif === "501234567") {
            router.push('/');
        } else {
            alert("Para análise detalhada completa, por favor carregue o ficheiro novamente. O histórico guarda apenas os KPIs principais para referência rápida.");
        }
    };

    const deleteEntry = (id) => {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('saftHistory', JSON.stringify(updated));
    };

    return (
        <main className={styles.main}>
            <Sidebar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h1>Histórico de Análises</h1>
                        <p>Aceda rapidamente aos resumos das suas últimas auditorias</p>
                    </div>
                    {loading && <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTop: '2px solid transparent', borderRadius: '50%' }}></div>}
                </header>

                <div className={styles.grid}>
                    {loading ? (
                        <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                             <p>A carregar histórico...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                            <FileStack size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
                            <h3>Nenhuma análise encontrada</h3>
                            <p>As suas análises aparecerão aqui automaticamente após o carregamento.</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className={styles.card} style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div className={styles.kpiIcon} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', position: 'relative' }}>
                                        <Building2 size={20} />
                                        {item.isCloud && (
                                            <div style={{ position: 'absolute', top: '-10px', right: '-15px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '8px' }}>CLOUD</div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => deleteEntry(item.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 style={{ marginBottom: '4px' }}>{item.company}</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    NIF: {item.nif} | {item.year}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-secondary)' }}>Vendas Totais</span>
                                        <span style={{ fontWeight: 'bold' }}>€{item.totalSales.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <TrendingUp size={16} color="#10b981" />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    <Calendar size={12} />
                                    <span>Analisado em: {new Date(item.dateAnalyzed).toLocaleDateString('pt-PT')}</span>
                                </div>

                                <button 
                                    className={styles.btnPrimary} 
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => loadAnalysis(item)}
                                >
                                    Ver Resumo <ArrowRight size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
