require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const testRoutes = require("./routes/testRoutes");
const dataRoutes = require("./routes/dataRoutes");

const chatbotRoutes = require('./routes/chatbotRoutes'); // Correct import

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatbotRoutes);
app.use('/test', testRoutes);
app.use('/data', dataRoutes);

module.exports = app;
