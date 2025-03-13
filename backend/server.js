const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mainApp = require("./src/app");
const morgan = require('morgan');
const {connectDB} = require('./src/database/mongoHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));


// Mongo
connectDB();

app.use('/', mainApp);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
