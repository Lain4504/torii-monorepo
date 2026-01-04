'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks/hooks';
import { checkAuth } from '@/store/slices/authSlice';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            dispatch(checkAuth());
            initialized.current = true;
        }
    }, [dispatch]);

    return <>{children}</>;
}
