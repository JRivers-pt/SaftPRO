"use client";
import {
    LayoutDashboard,
    FileText,
    ShieldAlert,
    BarChart3,
    Settings,
    LogOut,
    FileStack,
    CreditCard,
    HelpCircle,
    ShieldCheck
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
// We will create this css file next
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const [clientData, setClientData] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const data = sessionStorage.getItem('clientData');
            if (data) {
                setClientData(JSON.parse(data));
            }
        }
    }, []);

    const companyName = clientData?.companyName || 'SAFTPro';
    const isBranded = !clientData?.logo || clientData?.id === 'demo';

    // Split company name for styling
    const nameParts = companyName.split(' ');
    const firstName = nameParts[0] || companyName;
    const restName = nameParts.slice(1).join(' ');

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                {isBranded ? (
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #2c3e50 100%)',
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                ) : (
                    <img 
                        src={clientData.logo} 
                        alt={`${companyName} Logo`} 
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} 
                    />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, fontSize: '18px' }}>
                        {firstName}{restName && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{restName}</span>}
                    </span>
                    {clientData?.plan === 'pro' && (
                        <span style={{ 
                            fontSize: '10px', 
                            background: 'var(--primary)', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            fontWeight: 700,
                            width: 'fit-content',
                            marginTop: '2px',
                            textTransform: 'uppercase'
                        }}>
                            Pro Professional
                        </span>
                    )}
                </div>
            </div>

            <nav className={styles.nav}>
                <NavItem
                    href="/"
                    icon={<LayoutDashboard size={20} />}
                    label="Painel de Controlo"
                    isActive={pathname === '/'}
                />
                <NavItem
                    href="/history"
                    icon={<FileStack size={20} />}
                    label="Histórico"
                    isActive={pathname === '/history'}
                />
                <NavItem
                    href="/analysis"
                    icon={<FileText size={20} />}
                    label="Análise Detalhada"
                    isActive={pathname === '/analysis'}
                    isLocked={clientData?.plan === 'free'}
                />
                <NavItem
                    href="/risk"
                    icon={<ShieldAlert size={20} />}
                    label="Análise de Risco"
                    isActive={pathname === '/risk'}
                    isLocked={clientData?.plan === 'free'}
                />
                <NavItem
                    href="/reports"
                    icon={<BarChart3 size={20} />}
                    label="Relatórios"
                    isActive={pathname === '/reports'}
                    isLocked={clientData?.plan === 'free'}
                />
                <NavItem
                    href="/subscription"
                    icon={<CreditCard size={20} />}
                    label="Subscrição"
                    isActive={pathname === '/subscription'}
                />
                <NavItem
                    href="mailto:suporte@saftpro.pt"
                    icon={<HelpCircle size={20} />}
                    label="Suporte Técnico"
                />
            </nav>

            <div className={styles.footer}>
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '8px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                    Sessão Local Segura
                </div>

                <div style={{ padding: '0 16px 12px 16px' }}>
                    <ThemeToggle />
                </div>

                <NavItem href="/settings" icon={<Settings size={20} />} label="Definições" />
                <Link
                    href="/logout"
                    className={styles.navItem}
                    style={{ cursor: 'pointer', color: 'var(--error)', textDecoration: 'none' }}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </Link>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, isActive, href, isLocked }) {
    return (
        <Link href={isLocked ? '/subscription' : (href || '#')} style={{ textDecoration: 'none' }}>
            <div className={`${styles.navItem} ${isActive ? styles.active : ''} ${isLocked ? styles.locked : ''}`}>
                {icon}
                <span style={{ flex: 1 }}>{label}</span>
                {isLocked && <Lock size={14} style={{ opacity: 0.5 }} />}
                {isActive && <div className={styles.activeIndicator} />}
            </div>
        </Link>
    );
}
