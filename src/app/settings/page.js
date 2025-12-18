"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/Analysis.module.css';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        companyName: '',
        nif: '',
        email: '',
        notifyEmail: true,
        autoReport: true,
        validateSignatures: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load from LocalStorage
        const savedSettings = localStorage.getItem('contafranca_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        setLoading(false);
    }, []);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('contafranca_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return null;

    return (
        <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <Sidebar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Definições</h1>
                    <p className={styles.subtitle}>Configure a sua conta e preferências de análise.</p>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.cardTitle} style={{ marginBottom: '24px' }}>Perfil da Empresa</h2>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <InputGroup
                                label="Nome da Empresa"
                                value={settings.companyName}
                                onChange={(val) => handleChange('companyName', val)}
                                placeholder="Ex: A Sua Empresa, Lda"
                            />
                            <InputGroup
                                label="NIF"
                                value={settings.nif}
                                onChange={(val) => handleChange('nif', val)}
                                placeholder="Ex: 500100200"
                            />
                        </div>
                        <InputGroup
                            label="Email de Contacto"
                            value={settings.email}
                            onChange={(val) => handleChange('email', val)}
                            placeholder="email@exemplo.com"
                        />

                        <h2 className={styles.cardTitle} style={{ marginTop: '24px', marginBottom: '12px' }}>Preferências de Análise</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Toggle
                                label="Notificar sobre anomalias críticas por email"
                                checked={settings.notifyEmail}
                                onToggle={() => handleChange('notifyEmail', !settings.notifyEmail)}
                            />
                            <Toggle
                                label="Gerar relatórios mensais automaticamente"
                                checked={settings.autoReport}
                                onToggle={() => handleChange('autoReport', !settings.autoReport)}
                            />
                            <Toggle
                                label="Validar assinaturas digitais (completo)"
                                checked={settings.validateSignatures}
                                onToggle={() => handleChange('validateSignatures', !settings.validateSignatures)}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                            <button type="submit" style={{
                                background: saved ? 'var(--success)' : 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                width: 'fit-content',
                                cursor: 'pointer',
                                transition: 'background 0.3s'
                            }}>
                                {saved ? 'Alterações Guardadas!' : 'Guardar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

const InputGroup = ({ label, value, onChange, placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                background: 'var(--surface-highlight)',
                border: '1px solid var(--border)',
                padding: '12px',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none'
            }}
        />
    </div>
)

const Toggle = ({ label, checked, onToggle }) => (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <div style={{
            width: '40px',
            height: '24px',
            background: checked ? 'var(--primary)' : 'var(--border)',
            borderRadius: '12px',
            position: 'relative',
            transition: 'background 0.2s'
        }}>
            <div style={{
                position: 'absolute',
                left: checked ? '18px' : '2px',
                top: '2px',
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s'
            }} />
        </div>
        <span style={{ color: 'var(--text-main)', fontSize: '14px' }}>{label}</span>
    </div>
)
