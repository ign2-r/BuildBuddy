'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Chatbot from '../../components/Chatbot';
import RecommendationPanel from '../../components/RecommendationPanel';
import Navbar from '../../components/Navbar';

export default function HomePage() {
  const [recommendations, setRecommendations] = useState({});
  useEffect(() => {
    console.log(recommendations);
  }, [recommendations]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      <Navbar />

      <Box display="flex" flexGrow={1} minHeight={0} sx={{ p: 3, bgcolor: '#121212' }}>
        <Box
          sx={{
            width: '50%',
            height: '100%',
            bgcolor: 'white',
            color: 'black',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 3,
            mr: 2,
            minHeight: 0,
          }}
        >
          <Chatbot setRecommendations={setRecommendations} />
        </Box>

        <Box
          sx={{
            width: '50%',
            height: '100%',
            bgcolor: '#1E1E1E',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3,
            p: 4,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <RecommendationPanel results={recommendations} />
        </Box>
      </Box>
    </Box>
  );
}
