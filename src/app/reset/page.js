"use client";
import { useEffect } from 'react';

export default function ResetPage() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Clear EVERYTHING
            localStorage.clear();
            sessionStorage.clear();

            // Show confirmation
            alert('✅ Cache limpa! A página vai recarregar.');

            // Redirect to home
            window.location.href = '/';
        }
    }, []);

    return (
        <div style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>🔄 A limpar cache...</h1>
            <p>Aguarde...</p>
        </div>
    );
}
