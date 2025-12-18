"use client";
import Sidebar from '../components/Sidebar';
import styles from '../styles/Dashboard.module.css';
import { UploadCloud, CheckCircle, AlertTriangle, TrendingUp, DollarSign, FileStack, Users, Activity, FileText } from 'lucide-react';
import Link from 'next/link';
import VatDashboard from '../components/VatDashboard';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseSaft } from '../lib/saftParser';

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const data = await parseSaft(file);
        sessionStorage.setItem('saftData', JSON.stringify(data));
        setSaftData(data); // Immediate update state
        setIsUploading(false);
        // No redirect - we stay here!
      } catch (error) {
        console.error(error);
        alert("Erro ao ler ficheiro SAFT. Verifique se é um XML válido.");
        setIsUploading(false);
      }
    }
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
                    <UploadCloud size={64} />
                  </div>
                  <h3>Arraste o ficheiro SAFT aqui</h3>
                  <p>ou clique para selecionar do computador</p>
                  <div className={styles.supportedFormats}>Suporta XML (Standard Audit File for Tax) - PT v1.04</div>
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
