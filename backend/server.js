const express = require('express');
const bodyParser = require('body-parser');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', chatbotRoutes);

// Mongo
mongoose.connect(process.env.DATABASE_URL);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
