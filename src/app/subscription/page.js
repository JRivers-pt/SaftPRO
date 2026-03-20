"use client";
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/Dashboard.module.css';
import { Check, Zap, ShieldCheck, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            const plan = params.get('plan') || 'Pro';
            setMessage({ type: 'success', text: `🎉 Subscrição ${plan} ativada com sucesso! Bem-vindo ao SaftPRO Pro.` });
            // Update local session to reflect new plan
            const clientData = JSON.parse(sessionStorage.getItem('clientData') || '{}');
            clientData.plan = plan.toLowerCase();
            sessionStorage.setItem('clientData', JSON.stringify(clientData));
        } else if (params.get('cancelled') === 'true') {
            setMessage({ type: 'error', text: 'Pagamento cancelado. Pode tentar novamente quando quiser.' });
        }
    }, []);

    const handleUpgrade = async (plan) => {
        setLoading(true);
        try {
            const clientData = JSON.parse(sessionStorage.getItem('clientData') || '{}');
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, userEmail: clientData.email }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao iniciar checkout.' });
                setLoading(false);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro de ligação ao servidor.' });
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <Sidebar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h1>Planos e Subscrição</h1>
                        <p>Escolha o plano ideal para a sua contabilidade</p>
                    </div>
                </header>

                {/* Payment Status Messages */}
                {message && (
                    <div style={{
                        marginTop: '24px',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    }}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span style={{ fontWeight: 600 }}>{message.text}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '40px' }}>
                    
                    {/* Free Plan */}
                    <div className={styles.card} style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <h2 style={{ marginBottom: '8px' }}>Free</h2>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>€0<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mês</span></div>
                            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Para freelancers e pequenos volumes</p>
                        </div>
                        <div style={{ padding: '24px', flex: 1, borderTop: '1px solid var(--border)' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                                <FeatureItem text="Até 100 faturas/mês" />
                                <FeatureItem text="Painel de Controlo & KPIs" />
                                <FeatureItem text="Histórico Local (1 análise)" />
                                <FeatureItem text="Sem Acesso a Relatórios" />
                                <FeatureItem text="Sem Auditoria Detalhada" />
                            </ul>
                        </div>
                        <button className={styles.btnSecondary} style={{ margin: '24px', cursor: 'default' }} disabled>
                            Plano Atual
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={styles.card} style={{ borderColor: 'var(--primary)', borderWidth: '2px', position: 'relative', transform: 'scale(1.05)', zIndex: 1 }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>RECOMENDADO</div>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <h2 style={{ marginBottom: '8px' }}>Pro Professional</h2>
                            <div style={{ fontSize: '40px', fontWeight: 'bold' }}>€29<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mês</span></div>
                            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Análises ilimitadas para profissionais</p>
                        </div>
                        <div style={{ padding: '24px', flex: 1, borderTop: '1px solid var(--border)' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                                <FeatureItem text="Faturas Ilimitadas" icon={<Zap size={16} color="var(--primary)" />} />
                                <FeatureItem text="Auditoria Avançada & Risco" />
                                <FeatureItem text="Relatórios PDF Profissionais" />
                                <FeatureItem text="Cloud Sync Histórico" />
                                <FeatureItem text="Exportação Excel Detalhada" />
                                <FeatureItem text="Suporte Prioritário" />
                            </ul>
                        </div>
                        <button 
                            className={styles.btnPrimary} 
                            style={{ margin: '24px' }}
                            onClick={() => handleUpgrade('Pro')}
                            disabled={loading}
                        >
                            {loading ? 'A processar...' : 'Atualizar para Pro'}
                        </button>
                    </div>

                    {/* Agency Plan */}
                    <div className={styles.card} style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <h2 style={{ marginBottom: '8px' }}>Agency</h2>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>€79<span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mês</span></div>
                            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Para gabinetes de contabilidade</p>
                        </div>
                        <div style={{ padding: '24px', flex: 1, borderTop: '1px solid var(--border)' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: '12px', display: 'flex', flexDirection: 'column' }}>
                                <FeatureItem text="Tudo do plano Pro" />
                                <FeatureItem text="Até 5 colaboradores" />
                                <FeatureItem text="Relatórios White-label" />
                                <FeatureItem text="API para integração" />
                            </ul>
                        </div>
                        <button className={styles.btnSecondary} style={{ margin: '24px' }} onClick={() => handleUpgrade('Agency')}>
                            Contatar Vendas
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '64px', textAlign: 'center', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                    <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                    <h3>Pagamentos Seguros com Stripe</h3>
                    <p style={{ maxWidth: '600px', margin: '8px auto', color: 'var(--text-secondary)' }}>
                        Utilizamos o Stripe para garantir que os seus dados de pagamento estão protegidos. Pode cancelar a sua subscrição a qualquer momento nas definições da conta.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" height="24" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function FeatureItem({ text, icon }) {
    return (
        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
            {icon || <Check size={16} color="#10b981" />}
            <span>{text}</span>
        </li>
    );
}
