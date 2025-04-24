'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useChatContext } from '@/context/ChatContext';
import { useSession } from 'next-auth/react';
import { Chat } from '@/utils/db';

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const { user, setChat, setMessages } = useChatContext();
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, create: false }),
    })
      .then(res => res.json())
      .then(data => setChats(data.chat || []))
      .catch(err => console.error('Failed to fetch chats:', err));
  }, [user]);

  const createChat = async () => {
    try {
      if (!user?._id) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();
      const newChat: Chat = data.chat;

      if (!newChat || !newChat._id) return;

      setChat(newChat);
      setMessages(newChat.messages || []);
      router.push('/home');
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const openChat = async (chatId: string) => {
    try {
      if(!chatId){

        throw new Error("Invalid Chat URL");
      }
      router.push(`/home/${chatId}`);
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100%', p: 4 }}>
      <Typography variant="h4" color="white" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Your Chats
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button variant="contained" onClick={createChat}>
          + New Chat
        </Button>
      </Box>
      <Grid container spacing={2}>
        {chats.map(chat => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={chat._id}>
            <Card
              sx={{
                position: 'relative',
                height: '120px',
                cursor: 'pointer',
                p: 2,
                bgcolor: '#1E1E1E',
                color: 'white',
                borderRadius: 2,
                boxShadow: 3,
                transition: '0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.02)',
                },
              }}
              onClick={() => openChat(chat._id!)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                  {chat.display || 'Untitled Chat'}
                </Typography>
              </CardContent>

              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  p: 0,
                  fontSize: '0.75rem',
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirmed = confirm('Delete this chat?');
                  if (!confirmed) return;

                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatId: chat._id }),
                  });

                  if (res.ok) {
                    setChats(prev => prev.filter(c => c._id !== chat._id));
                  } else {
                    alert('Failed to delete chat.');
                  }
                }}
              >
                🗑️
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
