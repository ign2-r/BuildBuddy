const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const { connectDB, saveProduct } = require('./database');
const { logger } = require('./utils/logger');
const puppeteer = require('puppeteer');
const { parseProductData } = require('./utils/parser');
const OUTPUT_FILE = path.join(__dirname, 'products.json');

/**
 * @param {Object} productData 
 */
const saveToJsonFile = async (productData) => {
    try {
        const formattedProduct = `{
      category:"${productData.category}",
      description:"${productData.description?.replace(/"/g, '\\"')}",
      price:${productData.price},
      discountPrice:${productData.discountPrice || null},
      link:"${productData.link}",
      name:"${productData.name?.replace(/"/g, '\\"')}",
      rating:"${productData.rating || ''}",
      specs:${JSON.stringify(productData.specs || [])},
      vendor:"${productData.vendor || 'Amazon'}",
      brand:"${productData.brand || ''}"
    }`;
        
        const mongoInsertStatement = `Product.insertMany([
  
    ${formattedProduct},
  ]  
  )`;
        
        // Write to file
        await fs.writeFile(OUTPUT_FILE, mongoInsertStatement, 'utf8');
        logger.success(`Product saved to ${OUTPUT_FILE} in MongoDB insert format`);
    } catch (error) {
        logger.error(`Error saving to JSON file: ${error.message}`);
        throw error;
    }
};


/**
 * Scrape Amazon for product data
 * @param {string} productName 
 * @param {string} category 
 * @returns {Object|null} 
 */
const scrapeProductData = async (productName, category) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    try {
        // Use a realistic user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        
        // Set viewport to appear more like a real browser
        await page.setViewport({ width: 1366, height: 768 });

        // Navigate to Amazon search with category-specific keywords
        const searchQuery = `${productName} ${category === 'other' ? 'computer component' : category}`;
        logger.info(`Searching Amazon for: ${searchQuery}`);
        await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`);
        
        // Wait for page to fully load
        await page.waitForSelector('body', { timeout: 10000 });
        
        // Check if we need to solve a captcha
        const captchaExists = await page.evaluate(() => {
            return document.body.innerText.includes('captcha') || 
                   document.body.innerText.includes('CAPTCHA') ||
                   document.body.innerText.includes('robot');
        });
        
        if (captchaExists) {
            logger.error('Amazon is showing a CAPTCHA. Cannot proceed with scraping.');
            return null;
        }
        
        
        // Wait for search results to load
        await page.waitForSelector('.s-result-item', { timeout: 10000 });
        
        // Find the first product link using multiple possible selectors
        const productLink = await page.evaluate(() => {
            // Try different selectors that might contain product links
            const selectors = [
                '.s-result-item[data-component-type="s-search-result"] h2 a',
                '.s-result-item .a-link-normal.s-no-outline',
                '.s-result-item .a-link-normal.a-text-normal',
                '.s-result-item .a-link-normal',
                'div[data-component-type="s-search-result"] a.a-link-normal',
                '.s-result-list a.a-link-normal'
            ];
            
            let href = null;
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.href) {
                    href = element.href;
                    break;
                }
            }
            
            return href;
        });
        
        if (!productLink) {
            logger.error('Could not find any product links in the search results.');
            return null;
        }
        
        logger.info(`Navigating to product page: ${productLink}`);
        await page.goto(productLink, { waitUntil: 'networkidle2' });
        
        // Wait for product page to load
        await page.waitForSelector('#productTitle', { timeout: 15000 }).catch(() => {
            logger.error('Product title element not found on page.');
        });
        
        // Get HTML content of the page
        const html = await page.content();
        const productUrl = page.url();
        
        // Parse the HTML content
        const productData = parseProductData(html, productUrl, category);
        
        if (productData && productData.name) {
            logger.info(`Successfully scraped data for: ${productData.name}`);
            return productData;
        } else {
            logger.error('Failed to extract product data from page');
            return null;
        }
    } catch (error) {
        logger.error(`Error during scraping: ${error.message}`);
        return null;
    } finally {
        await browser.close();
    }
};

const main = async () => {
    // Try to connect to database
    let dbConnected = false;
    let storageMethod = 'json';
    
    try {
        dbConnected = await connectDB();
        if (dbConnected) {
            storageMethod = 'database';
            logger.info('Using MongoDB for storage');
        } else {
            logger.info('Database connection failed. Using JSON file for storage instead');
        }
    } catch (error) {
        logger.info('Using JSON file for storage');
    }
    
    console.log('\n=================================================');
    console.log('     AMAZON COMPUTER PARTS SCRAPER');
    console.log('=================================================\n');
    logger.info(`Storage method: ${storageMethod === 'database' ? 'MongoDB' : 'JSON file'}`);

    // Start the interactive prompt
    const promptUser = async () => {
        // First, ask for the product category
        const { category } = await inquirer.prompt([
            {
                type: 'rawlist', // Changed from 'list' to 'rawlist'
                name: 'category',
                message: 'What type of computer component are you looking for? (Enter number)',
                choices: [
                    'cpu',
                    'gpu',
                    'motherboard',
                    'ram',
                    'storage',
                    'power_supply',
                    'case',
                    'cooler',
                    'monitor',
                    'keyboard',
                    'mouse',
                    'other'
                ]
            }
        ]);
        
        // Then ask for the specific product name
        const { productName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'productName',
                message: `Enter the ${category.toUpperCase()} name to search on Amazon (or "exit" to quit):`,
                validate: input => input.trim() !== '' || 'Please enter a valid product name'
            }
        ]);

        if (productName.toLowerCase() === 'exit') {
            logger.info('Exiting the application. Goodbye!');
            process.exit(0);
        }

        // Add confirmation step with category information
        const { confirmSearch } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmSearch',
                message: `You are about to search for a ${category.toUpperCase()}: "${productName}". Is this correct?`,
                default: true
            }
        ]);

        if (!confirmSearch) {
            logger.info('Search cancelled. Please try again.');
            return promptUser(); // Loop back to category selection
        }

        try {
            logger.info(`Confirmed! Searching for ${category}: ${productName}`);
            const productData = await scrapeProductData(productName, category);

            if (productData) {
                // Display product information
                console.log('\n-------------------------------------------------');
                console.log(`Product: ${productData.name}`);
                console.log(`Category: ${productData.category}`);
                console.log(`Brand: ${productData.brand || 'Unknown'}`);
                console.log(`Price: $${productData.price}`);
                if (productData.discountPrice) {
                    console.log(`Discount Price: $${productData.discountPrice}`);
                }
                console.log(`Rating: ${productData.rating || 'N/A'}`);
                console.log('-------------------------------------------------\n');
                
                // Ask user if they want to save this product
                const { shouldSave } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'shouldSave',
                        message: `Save this product to ${storageMethod === 'database' ? 'the database' : 'JSON file'}?`,
                        default: true
                    }
                ]);
                
                if (shouldSave) {
                    if (dbConnected) {
                        await saveProduct(productData);
                    } else {
                        await saveToJsonFile(productData);
                    }
                }
            } else {
                logger.error('No product data found. Try another search term.');
            }
        } catch (error) {
            logger.error(`Operation failed: ${error.message}`);
        }
        
        // Continue with another search
        await promptUser();
    };
    
    await promptUser();
};

// Start the application
main().catch(err => {
    logger.error(`Fatal error: ${err.message}`);
    process.exit(1);
});