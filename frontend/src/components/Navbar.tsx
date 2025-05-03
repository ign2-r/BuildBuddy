'use client';

import { useChatContext } from '@/context/ChatContext';
import { User } from '@/utils/db';
import { AppBar, Toolbar, Typography, Button, Box, useMediaQuery, useTheme, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const { data: session } = useSession();
    const { setUser, setDefault } = useChatContext();
    const [open, setopen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const sessionUser = session?.user;

    useEffect(() => {
      if (pathname !== "/register" && pathname !== "/login" && pathname.includes("/api")) {
        router.replace("/login");
    } else if (sessionUser) {
            setUser(session?.user as User);
            if (pathname === "/register" || pathname === "/login") {
                router.replace("/chats");
            }
          }
    }, [pathname, sessionUser, router, session, setUser]);

    const handleSignOut = async () => {
        setDefault(true);
        setopen(false);
        // signOut(); //TODO: to fix it later
        router.replace("/api/auth/signout");
    };

    const handleClose = () => {
        setopen(false);
    }

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#1E1E1E',
        boxShadow: 3,
        // height: { xs: "6vh", sm: "6vh", md: "7vh" }, 
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          minHeight: { xs: 56, sm: 56, md: 64 }, 
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={() => (router.push('/chats'))}
        >
          🧠 BuildBuddy
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "row" : "row",
            gap: isMobile ? 1 : 2,
            justifyContent: "flex-end",
            alignItems: "center",
            mb: isMobile ? 1 : 0,
          }}
        >
          {pathname !== "/chats" && pathname !== "/register" && pathname !== "/login" && (
            isMobile ? (
              <Tooltip title="Back to Chats">
                <IconButton
                  color="primary"
                  onClick={() => router.push("/chats")}
                  sx={{
                    bgcolor: "#1976d2",
                    color: "#fff",
                    "&:hover": { bgcolor: "#1565c0" },
                    borderRadius: 2,
                    p: 1.2,
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/chats")}
                sx={{
                  bgcolor: "#1976d2",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1565c0" },
                }}
              >
                Back to Chats
              </Button>
            )
          )}

          {pathname !== "/register" && pathname !== "/login" && (
            isMobile ? (
              <Tooltip title="Sign Out">
                <IconButton
                  color="error"
                  onClick={() => { setopen(true); }}
                  sx={{
                    bgcolor: "#d32f2f",
                    color: "#fff",
                    "&:hover": { bgcolor: "#b71c1c" },
                    borderRadius: 2,
                    p: 1.2,
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => { setopen(true); }}
                sx={{
                  bgcolor: "#d32f2f",
                  color: "#fff",
                  "&:hover": { bgcolor: "#b71c1c" },
                }}
              >
                Sign Out
              </Button>
            )
          )}
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
