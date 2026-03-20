"use client";
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import { Lock, Play, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { demoData } from '../lib/demoData';
import { supabase } from '../lib/supabaseClient';

export default function AuthGuard({ children }) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(''); // Now using email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Reset bypass
        if (pathname === '/reset' && typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            alert('✅ Cache limpa!');
            window.location.href = '/';
            return;
        }

        // 2. Initial Auth Check
        checkUser();
    }, [pathname]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const demoActive = sessionStorage.getItem('clientData');
        
        if (session || demoActive) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Special Client: Conta Franca
        if (username === 'contafranca' && password === 'cf2025') {
            const clientData = {
                id: 'contafranca',
                companyName: 'Conta Franca',
                email: 'comercial@techscire.pt',
                plan: 'pro',
                logo: '/logo.jpg'
            };
            sessionStorage.setItem('clientData', JSON.stringify(clientData));
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });

        if (error) {
            setError(error.message === 'Invalid login credentials' ? 'Utilizador ou password incorretos.' : error.message);
            setLoading(false);
            return;
        }

        // Success - Set session metadata
        const clientData = {
            id: data.user.id,
            companyName: data.user.email.split('@')[0],
            email: data.user.email,
            plan: 'free' // Default
        };
        sessionStorage.setItem('clientData', JSON.stringify(clientData));
        setIsAuthenticated(true);
        setLoading(false);
    };

    const handleDemo = () => {
        const demoClient = {
            id: 'demo',
            companyName: 'SaftPro Demo',
            companyID: '501234567',
            logo: '/logo.jpg',
            primaryColor: '#3498db',
            primaryLight: '#ebf5fb'
        };
        sessionStorage.setItem('clientData', JSON.stringify(demoClient));
        sessionStorage.setItem('saftData', JSON.stringify(demoData));
        setIsAuthenticated(true);
    };

    if (loading) return null; // Or a spinner

    if (!isAuthenticated) {
        return (
            <main style={{
                height: '100vh',
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, #2c3e50 100%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(52, 152, 219, 0.2)'
                    }}>
                        <ShieldCheck size={40} />
                    </div>

                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: 800, 
                        background: 'linear-gradient(to right, var(--primary), #2c3e50)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '4px' 
                    }}>SAFTPro</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Análise Inteligente de SAF-T</p>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Utilizador</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="contafranca"
                                autoComplete="username"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Palavra-Passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                            {error && <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
                        </div>

                        <button type="submit" style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginBottom: '12px'
                        }}>
                            Entrar
                        </button>

                        <button 
                            type="button" 
                            onClick={handleDemo}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'white',
                                color: 'var(--primary)',
                                border: '1px solid var(--primary)',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Play size={16} fill="var(--primary)" /> Ver Demonstração (Demo)
                        </button>

                    </form>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
                        © 2025 TechScire Solutions. Todos os direitos reservados. | SaftPro v1.1
                    </p>
                </div>
            </main>
        );
    }

    return children;
}
