# amazon-parts-scraper/amazon-parts-scraper/README.md

# Amazon Parts Scraper

This project is a terminal-based web scraper designed to fetch product data from Amazon based on user input. It allows users to search for computer parts and stores the relevant information in a MongoDB database.

## Features

- Scrapes product data from Amazon based on the provided product name.
- Stores the scraped data in a MongoDB database.
- Provides a structured format for product information, including name, category, description, price, discount price, link, rating, specs, and vendor.

## Project Structure

```
amazon-parts-scraper
├── src
│   ├── index.js          # Entry point of the application
│   ├── scraper.js        # Main scraping logic
│   ├── database.js       # MongoDB connection and data handling
│   ├── utils
│   │   ├── parser.js     # Utility functions for parsing HTML data
│   │   └── logger.js      # Logging functions for debugging
│   └── models
│       └── Product.js    # Mongoose schema for the Product model
├── package.json          # npm configuration file
├── .env.example          # Example environment variables
├── .gitignore            # Files and directories to ignore by Git
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd amazon-parts-scraper
   ```

2. Install the dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and provide your MongoDB connection string.

## Usage

To run the scraper, execute the following command:

```
node src/index.js
```

Follow the prompts to enter the product name you wish to search for. The scraper will fetch the relevant data and store it in the database.
