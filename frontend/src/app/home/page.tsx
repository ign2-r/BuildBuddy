'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import Chatbot from '../../components/Chatbot';
import RecommendationPanel from '../../components/RecommendationPanel';

export default function HomePage() {
  const [recommendations, setRecommendations] = useState({});

  return (
    <Box display="flex" height="100vh" sx={{ p: 3, bgcolor: '#121212' }}>
      <Box
        sx={{
          width: '50%',
          bgcolor: 'white',
          color: 'black',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: 3,
          mr: 2,
        }}
      >
        <Chatbot setRecommendations={setRecommendations} />
      </Box>

      <Box
        sx={{
          width: '50%',
          bgcolor: '#1E1E1E',
          color: 'white',
          borderRadius: 3,
          boxShadow: 3,
          p: 4,
          overflowY: 'auto',
        }}
      >
        <RecommendationPanel results={recommendations} />
      </Box>
    </Box>
  );
}
