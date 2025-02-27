const axios = require('axios');
const { parseProductData } = require('./utils/parser');
const Product = require('./models/Product');
const logger = require('./utils/logger');

const AMAZON_SEARCH_URL = 'https://www.amazon.com/s?k=';

async function scrapeProductData(productName) {
    try {
        const response = await axios.get(`${AMAZON_SEARCH_URL}${encodeURIComponent(productName)}`);
        const productData = parseProductData(response.data);

        const newProduct = new Product(productData);
        await newProduct.save();
        logger.log(`Product saved: ${newProduct.name}`);
    } catch (error) {
        logger.error('Error scraping product data:', error);
    }
}

module.exports = { scrapeProductData };