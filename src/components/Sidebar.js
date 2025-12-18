"use client";
import {
    LayoutDashboard,
    FileText,
    ShieldAlert,
    BarChart3,
    Settings,
    LogOut
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

    const companyName = clientData?.companyName || 'ContaFranca';
    const logo = clientData?.logo || '/logo.jpg';

    // Split company name for styling
    const nameParts = companyName.split(' ');
    const firstName = nameParts[0] || companyName;
    const restName = nameParts.slice(1).join(' ');

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                {/* Using a simple img tag for the uploaded file in public */}
                <img src={logo} alt={`${companyName} Logo`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} />
                <span>{firstName}{restName && <span style={{ color: 'var(--primary)' }}>{restName}</span>}</span>
            </div>

            <nav className={styles.nav}>
                <NavItem
                    href="/"
                    icon={<LayoutDashboard size={20} />}
                    label="Painel de Controlo"
                    isActive={pathname === '/'}
                />
                <NavItem
                    href="/analysis"
                    icon={<FileText size={20} />}
                    label="Análise Detalhada"
                    isActive={pathname === '/analysis'}
                />
                <NavItem
                    href="/risk"
                    icon={<ShieldAlert size={20} />}
                    label="Análise de Risco"
                />
                <NavItem
                    href="/reports"
                    icon={<BarChart3 size={20} />}
                    label="Relatórios"
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

function NavItem({ icon, label, isActive, href }) {
    return (
        <Link href={href || '#'} style={{ textDecoration: 'none' }}>
            <div className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {icon}
                <span>{label}</span>
                {isActive && <div className={styles.activeIndicator} />}
            </div>
        </Link>
    );
}
