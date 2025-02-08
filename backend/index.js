const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/recommend', (req, res) => {
  // Mock PC build recommendation
  const mockRecommendation = {
    cpu: 'Intel Core i5-12600K',
    gpu: 'NVIDIA GeForce RTX 3060',
    ram: '16GB DDR4 3200MHz',
    storage: '1TB NVMe SSD',
  };
  res.json(mockRecommendation);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});