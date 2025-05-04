'use client';

import { FormEvent, useState } from 'react';
import { Container, Box, TextField, Button, Typography, Link } from '@mui/material';
import { doCredentialLogin } from "@/app/actions";
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/context/ChatContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);
  const {setdialogState, setopenDialog} = useChatContext();

  const router = useRouter();

  const credentialsAction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const response = await doCredentialLogin(formData);
      if (!!response.error) {
        if (response.error === "Invalid credentials.") {
          setInvalid(true);
        }
      } else {
        setdialogState({type:"success", message: "Logged in!"});
        setopenDialog(true);
        router.push("/chats");
      }
    } catch (e) {
      console.error(e);
      setInvalid(true);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        {invalid && (<Typography color='red' align='center'>Invalid credentials</Typography>)}
        <Box component="form" onSubmit={credentialsAction} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            name="email"
            value={email}
            
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Login
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" underline="hover">
            Register here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
