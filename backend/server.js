const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mainApp = require("./src/app");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.locals.statusReady = false;

// Mongo
(async () => {
    try {
        let db_status = null;
        while (!db_status) {
            console.log(`Waiting to connect to Mongodb server on ${process.env.DATABASE_URL}...`);
            try {
                db_status = await mongoose.connect(process.env.DATABASE_URL);
            } catch (err) {
                console.error("Connection attempt failed, retrying in 5 seconds...", err.message);
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        console.log("MongoDB Connected!");
        app.locals.statusReady = true;
      } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
})();

app.use("/", mainApp);
app.use("/status", async (req, res) => {
  try{
    console.log(app.locals.statusReady);
      if (app.locals.statusReady)
          res.status(200).json({ status: "online" });
      else 
          res.status(500).json({ status: "offline" });
  } catch(error){
      console.error("Invalid status", error);
      res.status(500).json({ status: "Error checking status" });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
