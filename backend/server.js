const express = require('express');
const bodyParser = require('body-parser');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const testRoutes = require("./src/routes/testRoutes");
const dotenv = require('dotenv');
const cors = require('cors');
const {connectDB} = require('./src/database/mongoHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mongo
connectDB();

app.use('/api', chatbotRoutes);
app.use('/test', testRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
