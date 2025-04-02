'use client';

import { useChatContext } from '@/context/ChatContext';
import { Box, Typography, Card, CardContent, CardActions, Button } from '@mui/material';

type Part = {
  _id: string;
  name: string;
  msrpPrice?: number | string;
  link?: string;
};

const RecommendationPanel: React.FC = () => {
  const { recommendations } = useChatContext();
  const parts: [string, Part][] = Object.entries(recommendations)
    .filter(([category]) => !['_id', 'display', 'createdAt', 'updatedAt'].includes(category))
    .map(([category, part]) => [category, part as unknown as Part]);

  const total = parts.reduce((acc, [, part]) => {
    const price =
      typeof part.msrpPrice === 'number'
        ? part.msrpPrice
        : parseFloat(part.msrpPrice || '0');
    return acc + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🧩 Recommended Parts
      </Typography>

      {parts.map(([category, part]) => (
        <Card
          key={`${part._id}_${category}`}
          sx={{ mb: 2, bgcolor: '#2e2e2e', color: 'white' }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {category.toUpperCase()}
            </Typography>
            <Typography>{part.name}</Typography>
            {part.msrpPrice && (
              <Typography>
                💵 $
                {typeof part.msrpPrice === 'number'
                  ? part.msrpPrice.toFixed(2)
                  : parseFloat(part.msrpPrice).toFixed(2)}
              </Typography>
            )}
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
