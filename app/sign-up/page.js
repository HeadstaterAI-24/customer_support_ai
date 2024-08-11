'use client'
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Grid, Link } from '@mui/material';
import { auth } from '@/firebase';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth)
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter()

  const handleSignUp = async (event) => {
    event.preventDefault()
    try {
      const res = await createUserWithEmailAndPassword(email, password)
      console.log({ res })

      if (res) {
        const user = res.user
        sessionStorage.setItem('userId', user.uid)

        setEmail('')
        setPassword('')
        router.push('/')
      }
      else{
        setErrorMessage('Email already exists')
      }
    } catch (e) {
        console.error(e)
        setErrorMessage('An error occurred. Please try again.')
      }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/ai-chatbot.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container 
        component="main" 
        maxWidth="xs"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography component="h1" variant="h4" align="center">
          AI-Powered Chatbot for HeadStarterAI
        </Typography>
        <Typography component="h2" variant="h5" align="center" sx={{ mt: 2 }}>
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/sign-in" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}

export default SignUp