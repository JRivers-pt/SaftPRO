"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Clear license
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('contafranca_license');
            sessionStorage.clear();
            // Force reload to home
            window.location.href = '/';
        }
    }, [router]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            A sair...
        </div>
    );
}
