'use client';

import { signOut } from "next-auth/react"
import { useChatContext } from '@/context/ChatContext';
import { User } from '@/utils/db';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const { data: session } = useSession();
    const { setUser } = useChatContext();
    const [open, setopen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const sessionUser = session?.user;

    useEffect(() => {
        if (sessionUser) {
            setUser(session?.user as User);
            if (pathname === "/register" || pathname === "/login") {
                router.replace("/chats");
            }
        } else {
            router.replace("/login");
        }
    }, [pathname, sessionUser]);

    const handleSignOut = async () => {
        setopen(false);
        signOut();
        // router.replace("/api/auth/signout");
    };

    const handleClose = () => {
        setopen(false);
    }

  return (
    <AppBar position="static" sx={{ bgcolor: '#1E1E1E', boxShadow: 3, height: "6vh" }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={() => (window.location.href = '/home')}
        >
          🧠 BuildBuddy
        </Typography>

        <Box display="flex" gap={2}>
          {pathname.includes("/home/") &&
            <Button variant="contained" onClick={() => router.push('/chats')}>
            ← Back to Chats
            </Button>
          }
          {
            sessionUser &&
            <Button color="error" variant="contained" onClick={() => {setopen(true)}}>
            Sign Out
          </Button>
          }
        </Box>
        <Dialog
            open={open}
            aria-label="alert-dialog-logout"
            >
            <DialogTitle id="alert-dialog-logout-title">{"Are you sure you want to log out?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-logout-description">
                    Logging out will sign you out of Buildbuddy and you will have to log in again.
                </DialogContentText>
                <DialogActions>
                <Button onClick={handleClose} variant="contained" color="secondary">Cancel</Button>
                <Button onClick={handleSignOut} variant="contained" autoFocus>
                    Sign out
                </Button>
                </DialogActions>
            </DialogContent>

        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
