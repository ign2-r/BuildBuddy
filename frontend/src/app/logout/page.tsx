"use client";

import { useEffect } from 'react';
import { doLogout } from "../actions";
import { Button } from '@mui/material';
import {useChatContext} from "@/context/ChatContext"

export default function LogoutPage() {
    const {setDefault} = useChatContext()
    useEffect(() => {
        const logout = async () => {
            setDefault(true);
            await doLogout();
        };
        logout();
    }, [setDefault]);

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