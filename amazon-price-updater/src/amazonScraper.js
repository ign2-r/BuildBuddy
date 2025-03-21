const puppeteer = require('puppeteer');
const { logger } = require('./utils/logger');


/**
 * Scrapes Amazon for product information
 */
async function scrapeAmazonProduct(page, product) {
  try {
    // Build search query with product info and category
    let searchQuery = `${product.brand || ''} ${product.name || ''}`.trim();
    
    if (product.category) {
      searchQuery += ` ${product.category}`;
    }
    
    logger.info(`Searching for: ${searchQuery}`);
    
    await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    
    // Wait for page to fully load with longer timeout
    await page.waitForSelector('body', { timeout: 15000 });
    
    // Check for CAPTCHA
    const captchaExists = await page.evaluate(() => {
      return document.body.innerText.includes('captcha') || 
             document.body.innerText.includes('CAPTCHA') ||
             document.body.innerText.includes('robot');
    });
    
    if (captchaExists) {
      logger.error('Amazon is showing a CAPTCHA. Cannot proceed with scraping.');
      return product;
    }
    
    // Use a more reliable way to find any product links
    const productLink = await page.evaluate(() => {
      // Try multiple selector patterns to find product links
      const selectors = [
        'div.s-result-item a.a-link-normal.s-no-outline', // Common pattern
        'div.s-result-item h2 a',                         // Another common pattern
        'div.s-result-item a.a-text-normal',              // Alternative pattern
        '.s-result-item a[href*="/dp/"]',                 // Any link with /dp/ in URL
        'a[href*="/dp/"]'                                 // Any link with /dp/ (broader)
      ];
      
      // Try each selector
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Return the first valid product URL
          for (const element of elements) {
            if (element.href && element.href.includes('/dp/')) {
              return element.href;
            }
          }
        }
      }
      
      return null;
    });
    
    if (!productLink) {
      logger.error('Could not find any product links in the search results.');
      return product;
    }
    
    logger.success(`Found product link: ${productLink}`);
    
    // Navigate to the product page
    await page.goto(productLink, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for product page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Get the current URL
    const productUrl = page.url();
    
    // Extract product details including prices
    const productDetails = await page.evaluate(() => {
      // Helper function to clean text
      const cleanText = text => text ? text.trim().replace(/\s+/g, ' ') : null;
      
      // Get regular price (original/list price)
      let originalPrice = null;
      
      // Try various selectors for the original price (non-discounted)
      const originalPriceSelectors = [
        '.a-text-price .a-offscreen',
        '#listPrice',
        '.a-text-strike',
        '.a-price.a-text-price:not(.apexPriceToPay) .a-offscreen',
        'span[data-a-strike="true"]'
      ];
      
      for (const selector of originalPriceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const priceText = element.textContent.trim();
          if (priceText.includes('$')) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(price) && price > 0) {
              originalPrice = price;
              break;
            }
          }
        }
      }
      
      // Get current price
      let currentPrice = null;
      
      const currentPriceSelectors = [
        '.priceToPay .a-offscreen',
        '.apexPriceToPay .a-offscreen',
        '.a-price:not(.a-text-price) .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '#priceblock_saleprice',
        '.a-offscreen'
      ];
      
      for (const selector of currentPriceSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const priceText = element.textContent.trim();
          if (priceText.includes('$')) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(price) && price > 0) {
              currentPrice = price;
              break;
            }
          }
        }
        if (currentPrice) break;
      }
      
      // Get rating
      let rating = null;
      const ratingElement = document.querySelector('#acrPopover, .a-icon-star');
      if (ratingElement) {
        const ratingText = ratingElement.getAttribute('title') || ratingElement.textContent;
        if (ratingText) {
          const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
          rating = ratingMatch ? ratingMatch[1] : null;
        }
      }
      
      // Get actual product title to verify we got the right product
      const title = cleanText(document.querySelector('#productTitle')?.textContent);
      
      return {
        originalPrice,
        currentPrice,
        rating,
        title
      };
    });
    
    // Create a copy of the original product and update fields
    const updatedProduct = { ...product };
    
    // Log the product title for verification
    if (productDetails.title) {
      logger.info(`Found product: ${productDetails.title}`);
    }
    
    if (productDetails.originalPrice && productDetails.currentPrice && 
        productDetails.originalPrice > productDetails.currentPrice) {
      updatedProduct.price = productDetails.originalPrice;
      updatedProduct.discountPrice = productDetails.currentPrice;
      logger.info(`Updated prices: Original $${updatedProduct.price}, Discount $${updatedProduct.discountPrice}`);
    } else if (productDetails.currentPrice) {
      // Only current price found - set it as the main price, no discount
      updatedProduct.price = productDetails.currentPrice;
      updatedProduct.discountPrice = null;
      logger.info(`Updated price: $${updatedProduct.price} (no discount)`);
    }
    
    // Use the full product page URL
    updatedProduct.link = productUrl;
    logger.info(`Updated link: ${productUrl}`);
    
    // Update rating if one is found
    if (productDetails.rating) {
      updatedProduct.rating = productDetails.rating;
      logger.info(`Updated rating: ${productDetails.rating}`);
    }
    
    updatedProduct.vendor = 'Amazon';
    
    return updatedProduct;
  } catch (error) {
    logger.error(`Error scraping product: ${error.message}`);
    return product; // Return original product on error
  }
}

async function browserAgent(products, delay = 3000) {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    // User Agent that isnt blocked as of 3/20/2025
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const updatedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      // Process the product
      const upProduct = await scrapeAmazonProduct(page, products[i]);
      updatedProducts.push(upProduct);
      
      // Add delay between requests to avoid being blocked
      if (i < products.length - 1) {
        logger.info(`Waiting ${delay}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return updatedProducts;
  } finally {
    await browser.close();
  }
}

module.exports = {
  browserAgent,
  scrapeAmazonProduct
};