'use client';

import { Box, Typography, Card, CardContent, CardActions, Button } from '@mui/material';

type Part = {
  _id: string;
  name: string;
  price?: number;
  link?: string;
};

type RecommendationPanelProps = {
  results: Record<string, Part>;
};

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ results }) => {
  const parts = Object.entries(results || {});
  const total = parts.reduce((acc, [_, part]) => {
    const price = typeof part.price === 'number' ? part.price : parseFloat(part.price || '0');
    return acc + (isNaN(price) ? 0 : price);
  }, 0);  

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🧩 Recommended Parts
      </Typography>

      {parts.map(([category, part]) => (
        <Card key={part._id || category} sx={{ mb: 2, bgcolor: '#2e2e2e', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{category.toUpperCase()}</Typography>
            <Typography>{part.name}</Typography>
            {part.price && <Typography>💵 ${part.price.toFixed(2)}</Typography>}
          </CardContent>
          {part.link && (
            <CardActions>
              <Button
                href={part.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="info"
              >
                View Product
              </Button>
            </CardActions>
          )}
        </Card>
      ))}

      <Typography variant="h6" mt={3}>
        🧮 Total: ${total.toFixed(2)}
      </Typography>
    </Box>
  );
};

export default RecommendationPanel;
