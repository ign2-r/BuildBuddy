const express = require('express');
const bodyParser = require('body-parser');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', chatbotRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
