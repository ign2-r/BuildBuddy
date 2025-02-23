'use client';

import { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Link } from '@mui/material';
import { doCredentialLogin, doRegister } from '../actions';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currError, setCurrError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const formData = new FormData(e.currentTarget);
      const response = await doRegister(formData);

      if (response) {
        const response = await doCredentialLogin(formData);
        if (!!response.error) {
            setCurrError(response.error);
        } else {
          router.push("/home");
        }
      } else{
        setCurrError("Something has went wrong")
      }
    } catch (e) {
      console.error(e);
      setCurrError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>
        {!!currError &&
          <Typography color='red' align='center'>
            {currError}
          </Typography>
        }
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Full Name"
            fullWidth
            required
            margin="normal"
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            name='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link href="/login" underline="hover">
            Log in here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
