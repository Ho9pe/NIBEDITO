'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const protectedRoutes = ['/my-orders', '/dashboard', '/checkout', '/cart'];

export default function UserRouteHandler({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user && protectedRoutes.includes(pathname)) {
            router.push(`/login?redirect=${pathname}`);
        }
    }, [user, isLoading, pathname]);

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return children;
} 