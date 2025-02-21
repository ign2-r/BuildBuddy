require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const chatbotRoutes = require('./routes/chatbotRoutes'); // Correct import

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/chatbot', chatbotRoutes);

module.exports = app;
