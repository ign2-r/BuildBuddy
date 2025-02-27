const mongoose = require('mongoose');
const { logger } = require('./utils/logger');

// Use environment variable if available, otherwise use local MongoDB
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/buildbuddy';

const connectDB = async () => {
    try {
        // Removed deprecated options (useNewUrlParser and useUnifiedTopology)
        await mongoose.connect(DATABASE_URL);
        logger.info(`MongoDB connected successfully at ${DATABASE_URL}`);
        return true;
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        return false;
    }
};

const saveProduct = async (productData) => {
    const Product = require('./models/Product');
    const product = new Product(productData);
    try {
        await product.save();
        logger.success(`Product saved successfully: ${productData.name}`);
        return product;
    } catch (error) {
        logger.error(`Error saving product: ${error.message}`);
        throw error;
    }
};

module.exports = { connectDB, saveProduct };