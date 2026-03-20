"use client";
import Sidebar from '../components/Sidebar';
import styles from '../styles/Dashboard.module.css';
import { Upload, CheckCircle, AlertTriangle, TrendingUp, DollarSign, FileStack, Users, Activity, FileText, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import VatDashboard from '../components/VatDashboard';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseSaft } from '../lib/saftParser';
import { demoData } from '../lib/demoData';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saftData, setSaftData] = useState(null);

  // Check valid session on mount
  useEffect(() => {
    const raw = sessionStorage.getItem('saftData');
    if (raw) {
      setSaftData(JSON.parse(raw));
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const saveToHistory = async (data) => {
    if (typeof window === 'undefined') return;
    
    // 1. Local Persistence (Fast)
    const history = JSON.parse(localStorage.getItem('saftHistory') || '[]');
    const newEntry = {
        id: Date.now(),
        fileName: data.fileName,
        company: data.header.companyName,
        nif: data.header.companyID,
        year: data.header.fiscalYear,
        totalSales: data.kpi.totalSales,
        dateAnalyzed: new Date().toISOString(),
        isDemo: data.isDemo || false
    };
    
    const updatedHistory = [newEntry, ...history.filter(h => h.nif !== data.header.companyID)].slice(0, 10);
    localStorage.setItem('saftHistory', JSON.stringify(updatedHistory));

    // 2. Cloud Sync (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    if (session && !data.isDemo) {
        try {
            await supabase.from('saft_logs').insert({
                user_id: session.user.id,
                file_name: data.fileName,
                company_name: data.header.companyName,
                tax_id: data.header.companyID,
                fiscal_year: data.header.fiscalYear,
                total_sales: data.kpi.totalSales,
                metadata: {
                    invoices: data.kpi.totalInvoices,
                    audits: data.audit?.totalTaxPayable
                }
            });
        } catch (e) {
            console.error("Cloud sync failed:", e);
        }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const data = await parseSaft(file);
        sessionStorage.setItem('saftData', JSON.stringify(data));
        saveToHistory(data);
        setSaftData(data); // Immediate update state
        setIsUploading(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao ler ficheiro SAFT. Verifique se é um XML válido.");
        setIsUploading(false);
      }
    }
  };

  const handleDemoMode = () => {
    sessionStorage.setItem('saftData', JSON.stringify(demoData));
    setSaftData(demoData);
  };

  const clearSession = () => {
    sessionStorage.removeItem('saftData');
    setSaftData(null);
  }

  // --- RENDER LOGIC ---

  // 1. Initial State (No File)
  if (!saftData) {
    return (
      <main className={styles.main}>
        <Sidebar />
        <div className={styles.content}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Nova Análise SAFT</h1>
              <p className={styles.subtitle}>Carregue um ficheiro para iniciar a auditoria automática.</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.btnPrimary} onClick={handleUploadClick}>+ Carregar SAFT</button>
            </div>
          </header>

          <section className={styles.uploadSection}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".xml"
            />
            <div className={styles.uploadCard} onClick={handleUploadClick} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%' }}></div>
                  <h3>A Processar Ficheiro...</h3>
                  <p>A validar estrutura XSD e integridade de dados</p>
                </div>
              ) : (
                <>
                  <div className={styles.uploadIconWrapper}>
                    <Upload size={56} strokeWidth={1.5} />
                  </div>
                  <h3>Analise o seu ficheiro SAF-T</h3>
                  <p>Arraste e solte o ficheiro ou clique para procurar</p>
                  <div className={styles.supportedFormats} style={{ marginBottom: '32px' }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '6px' }} />
                    Conformidade Legal PT v1.04
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className={styles.btnSecondary} onClick={handleDemoMode} style={{ borderRadius: '12px' }}>
                        Ver Demonstração
                    </button>
                    <button 
                        className={styles.btnPrimary} 
                        style={{ 
                            background: 'linear-gradient(135deg, #000000 0%, #2c3e50 100%)', 
                            borderColor: 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }} 
                        onClick={handleUploadClick}
                    >
                        <Zap size={18} /> Carregar Pro
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    )
  }

  // 2. Active Dashboard (File Loaded)
  const totalSales = saftData?.kpi?.totalSales || 0;
  const invoiceCount = saftData?.kpi?.totalInvoices || 0;
  const productCount = saftData?.kpi?.productCount || 0;
  const activeClients = Math.floor(invoiceCount * 0.4) || 0; // Mock derived

  return (
    <main className={styles.main}>
      <Sidebar />
      <div className={styles.content}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h1 className={styles.title}>Dashboard: {saftData.header.companyName}</h1>
              <p className={styles.subtitle}>
                NIF: {saftData.header.companyID} | Exercício: {saftData.header.fiscalYear}
              </p>
            </div>
            <span className={styles.riskBadge} style={{ background: 'var(--success)', color: '#fff', fontSize: '14px', padding: '6px 12px' }}>
              ONLINE
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={clearSession}>Fechar Análise</button>
            <Link href="/analysis"><button className={styles.btnPrimary}>Ver Análise Detalhada &rarr;</button></Link>
          </div>
        </header>

        {/* Live KPI Grid */}
        <section className={styles.statsGrid}>
          <StatCard
            title="Volume de Vendas (Total)"
            value={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalSales)}
            change="Baseado no SAFT"
            positive
            icon={<DollarSign size={24} />}
          />
          <StatCard
            title="Clientes Ativos"
            value={activeClients}
            change="Neste ficheiro"
            positive
            icon={<Users size={24} />}
          />
          <StatCard
            title="Documentos"
            value={invoiceCount}
            change="Processados"
            positive
            icon={<FileStack size={24} />}
          />
          <StatCard
            title="Alertas de Risco"
            value={saftData?.audit ? (
              (saftData.audit.invalidNifCount > 0 ? 1 : 0) +
              (saftData.audit.invoiceGaps?.length > 0 ? 1 : 0) +
              (saftData.audit.hashChainBroken ? 1 : 0)
            ) : 0}
            change="Verificar Agora"
            positive={false}
            icon={<AlertTriangle size={24} />}
          />
        </section>

        {/* Live VAT Map */}
        <section className={styles.recentSection} style={{ marginTop: '32px' }}>
          <VatDashboard overrideSales={totalSales} overrideVat={saftData?.audit?.totalTaxPayable} />
        </section>

        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
          <Link href="/analysis" style={{ flex: 1 }}>
            <div className={styles.statCard} style={{ cursor: 'pointer', borderColor: 'var(--primary)', textAlign: 'center', background: 'var(--primary-light)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Ir para Análise Detalhada</h3>
              <p style={{ fontSize: '13px' }}>Ver gráficos mensais, top produtos e impostos detalhados</p>
            </div>
          </Link>
          <Link href="/risk" style={{ flex: 1 }}>
            <div className={styles.statCard} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>Ir para de Risco</h3>
              <p style={{ fontSize: '13px' }}>Verificar sequências, assinaturas e alertas de conformidade</p>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value, change, positive, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statTitle}>{title}</span>
        <div className={`${styles.statIcon} ${positive ? styles.iconPositive : styles.iconNegative}`}>
          {icon}
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={`${styles.statChange} ${positive ? styles.textSuccess : styles.textError}`}>
        {change}
      </div>
    </div>
  )
}
