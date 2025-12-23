"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { generatePDF } from '../../lib/reportGenerator';
import { generateProfessionalExcel } from '../../lib/excelGenerator';
import { FileText, Download, Calendar } from 'lucide-react';
import styles from '../../styles/Analysis.module.css';

export default function ReportsPage() {
    const [saftData, setSaftData] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('saftData');
        if (raw) {
            setSaftData(JSON.parse(raw));
        }
    }, []);

    const companyName = saftData?.header?.companyName || "Empresa Exemplo";
    const fiscalYear = saftData?.header?.fiscalYear || new Date().getFullYear();

    // Using distinct IDs to map to generator types
    const reports = [
        { id: 'EXEC', name: `Relatório Executivo - ${companyName}`, date: `Exercício ${fiscalYear}`, type: 'PDF' },
        { id: 'EXCEL', name: `Extrato Financeiro Profissional (Excel)`, date: `Todas as faturas`, type: 'XLSX' },
        { id: 'IVA', name: `Mapa de Impostos (IVA)`, date: `Resumo Mensal`, type: 'PDF' },
    ];

    const handleDownload = (report) => {
        if (!saftData) {
            alert("Por favor carregue um ficheiro SAFT primeiro.");
            return;
        }

        if (report.type === 'XLSX') {
            generateProfessionalExcel(saftData);
        } else {
            // PDF Handling
            let type = "Relatório Genérico";
            if (report.id === 'IVA') type = "Mapa de IVA";
            if (report.id === 'AUDIT') type = "Relatório de Auditoria"; // String includes "NIF" check inside generator, or pass specific ID logic
            // For simplicity, passing the Name as the key since generator checks includes strings
            generatePDF(report.name, saftData);
        }
    };

    if (!saftData) {
        // Fallback
        reports.forEach(r => {
            r.name = r.name.replace("Empresa Exemplo", "Exemplo").replace("undefined", "---");
            r.date = r.date.replace("undefined", "---");
        });
    }

    return (
        <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <Sidebar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Relatórios: {companyName}</h1>
                    <p className={styles.subtitle}>Consulte e exporte os relatórios gerados automaticamente.</p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {reports.map((report) => (
                        <div key={report.id} className={styles.card} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '12px', background: 'var(--surface-highlight)', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 600 }}>{report.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <Calendar size={12} color="var(--text-secondary)" />
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{report.date}</span>
                                        <span style={{ background: 'var(--surface-highlight)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>{report.type}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(report)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}>
                                <Download size={16} />
                                <span>Download</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
