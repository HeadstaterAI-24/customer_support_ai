'use client'
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Grid, Link } from '@mui/material';
import { auth } from '@/firebase';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSignIn = async (event) => {
    event.preventDefault()
    try {
        const res = await signInWithEmailAndPassword(email, password)
        console.log({ res })
        
        if (res) {
            sessionStorage.setItem('userId', res.user.uid)
            setEmail('')
            setPassword('')
            setErrorMessage('')
            router.push('/')
        }
        else{
            setErrorMessage('Incorrect email or password.')
        }
    } catch (e) {
        console.error(e)
        setErrorMessage('An error occurred. Please try again.')
      }  
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSignIn} sx={{ mt: 3 }}>
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
                autoComplete="current-password"
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
            Sign In
          </Button>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/sign-up" variant="body2">
                Don&apos;t have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default SignIn