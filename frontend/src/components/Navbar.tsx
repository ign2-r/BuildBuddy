'use client';

import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navbar = () => {
    const handleSignOut = async () => {
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
      
        try {
          await fetch('/api/auth/signout', {
            method: 'GET',
            credentials: 'include',
          });
          window.location.href = '/';
        } catch (err) {
          console.error('Failed to sign out:', err);
        }
      };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1E1E1E', boxShadow: 3 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={() => (window.location.href = '/home')}
        >
          🧠 BuildBuddy
        </Typography>

        <Button color="error" variant="contained" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
