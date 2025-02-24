"use client";

import { useEffect } from 'react';
import { doLogout } from "../actions";
import { Button } from '@mui/material';

export default function LogoutPage() {

    useEffect(() => {
        const logout = async () => {
            await doLogout();
        };
        logout();
    }, []);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Button
                    variant="contained"
                    color="error"
                    onClick={async () => {
                        await doLogout();
                        window.location.href = '/login';
                    }}
                >
                    Logging out
                </Button>
            </div>
        </>
    );
}