"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            await supabase.auth.signOut();
            sessionStorage.clear();
            localStorage.removeItem('saftData');
            router.push('/');
        };
        performLogout();
    }, [router]);

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%' }}></div>
            <p>A encerrar sessão de forma segura...</p>
        </div>
    );
}
