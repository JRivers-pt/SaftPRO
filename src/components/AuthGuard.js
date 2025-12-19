"use client";
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import { Lock } from 'lucide-react';

import { usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
    const pathname = usePathname();

    // IMMEDIATE BYPASS for /reset route
    useEffect(() => {
        if (pathname === '/reset' && typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            alert('✅ Cache limpa! Clique OK para continuar.');
            window.location.href = '/';
        }
    }, [pathname]);

    // If on reset page, show nothing while redirecting
    if (pathname === '/reset') {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>🔄 A limpar...</h2>
            </div>
        );
    }

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already authenticated
        if (typeof window !== 'undefined') {
            const clientData = sessionStorage.getItem('clientData');
            if (clientData) {
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Load client database
            const response = await fetch('/clientDatabase.json');
            const database = await response.json();

            // Find matching client
            const client = database.clients.find(
                c => c.username === username && c.password === password
            );

            if (client) {
                // Store client data in session
                const clientData = {
                    id: client.id,
                    companyName: client.companyName,
                    companyID: client.companyID,
                    logo: client.logo,
                    primaryColor: client.primaryColor,
                    primaryLight: client.primaryLight
                };
                sessionStorage.setItem('clientData', JSON.stringify(clientData));
                setIsAuthenticated(true);
            } else {
                setError('Credenciais inválidas. Verifique o utilizador e palavra-passe.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Erro ao efetuar login. Tente novamente.');
        }
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
                        background: 'var(--surface-highlight)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        color: 'var(--primary)'
                    }}>
                        <Lock size={32} />
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>SAFTPro</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Acesso Reservado a Clientes</p>

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
                            cursor: 'pointer'
                        }}>
                            Entrar
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.reload();
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginTop: '12px',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 Limpar Cache
                        </button>
                    </form>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
                        &copy; 2025 TechScire Solutions. Todos os direitos reservados. | SaftPro v1.1
                    </p>
                </div>
            </main>
        );
    }

    return children;
}
