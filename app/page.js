'use client';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import { Box, Stack, Typography, TextField, Button } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import './globals.css';

export default function Home() {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('userId');
      if (session) {
        setUserSession(session);
      } else if (!user) {
        router.push('/sign-in');
      }
    }
  }, [user, router]);

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi, I'm the Headstarter Support Agent. How can I assist you today?",
  }]);

  const [message, setMessage] = useState('');
  const messageInputRef = useRef(null);

  const sendMessage = async () => {
    if (message.trim() === '') return; // Prevent sending empty messages

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      reader.read().then(function processText({ done, value }) {
        if (done) {
          const htmlResponse = marked(result, { sanitize: true, breaks: true }); // Convert markdown to HTML
          console.log("HTML response:", htmlResponse);

          setMessages((messages) => {
            const lastMessage = messages[messages.length - 1];
            const otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: htmlResponse },
            ];
          });

          return;
        }

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        result += text;
        reader.read().then(processText);
      });
    } catch (error) {
      console.error("Error fetching chat response:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        sendMessage();
      }
    };

    const inputElement = messageInputRef.current;
    inputElement?.addEventListener('keydown', handleKeyDown);

    return () => {
      inputElement?.removeEventListener('keydown', handleKeyDown);
    };
  }, [message]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          position: 'fixed',
          width: '100%',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <Typography variant="h4">Headstarter AI</Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              signOut(auth)
              sessionStorage.removeItem('userId')
              }}
            >
              Log Out
            </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          marginTop: '64px',
        }}
      >
        <Box
          sx={{
            width: '250px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #ddd',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">Model: gpt-4o-mini</Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            height: 'calc(100vh - 64px)', 
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid black',
              backgroundColor: 'white',
              overflowY: 'auto', 
            }}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              sx={{ p: 2 }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
                      color: 'white',
                      borderRadius: 2,
                      maxWidth: '90%',
                      overflowWrap: 'break-word',
                      padding: '5px', 
                      overflow: 'hidden', 
                    }}
                  >
                    {message.content ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: message.content }} // Inject HTML content
                        className="bubble-content"
                      />
                    ) : (
                      <Typography variant="body1">Loading...</Typography> // Fallback while loading
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              inputRef={messageInputRef}
            />
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
