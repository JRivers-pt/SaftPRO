"use client";
import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import styles from '../styles/Analysis.module.css';

export default function PlanGuard({ children, requiredPlan = 'pro' }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = sessionStorage.getItem('clientData');
        if (data) {
            const client = JSON.parse(data);
            setPlan(client.plan || 'free');
        } else {
            setPlan('free');
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    // Pro and Agency plans both have access to 'pro' restricted content
    const hasAccess = plan === 'pro' || plan === 'agency' || plan === 'demo';

    if (!hasAccess) {
        return (
            <main style={{ background: 'var(--background)', minHeight: '100vh', display: 'flex' }}>
                <Sidebar />
                <div style={{ 
                    flex: 1, 
                    marginLeft: '260px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '40px',
                    textAlign: 'center' 
                }}>
                    <div style={{ 
                        background: 'var(--surface)', 
                        padding: '60px', 
                        borderRadius: '24px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        maxWidth: '600px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ 
                            background: 'var(--surface-highlight)', 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 24px auto',
                            color: 'var(--primary)'
                        }}>
                            <Lock size={40} />
                        </div>
                        <h1 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 800 }}>Funcionalidade Premium</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '32px', lineHeight: 1.6 }}>
                            Esta funcionalidade está reservada para subscritores <strong>Pro Professional</strong> ou <strong>Agency</strong>. 
                            Atualize o seu plano para desbloquear análises detalhadas, auditoria avançada e relatórios profissionais.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <Link href="/subscription">
                                <button style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '14px 28px', 
                                    borderRadius: '12px', 
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}>
                                    Ver Planos de Subscrição
                                </button>
                            </Link>
                            <Link href="/">
                                <button style={{ 
                                    background: 'transparent', 
                                    color: 'var(--text-main)', 
                                    border: '1px solid var(--border)', 
                                    padding: '14px 28px', 
                                    borderRadius: '12px', 
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}>
                                    Voltar ao Painel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return children;
}
