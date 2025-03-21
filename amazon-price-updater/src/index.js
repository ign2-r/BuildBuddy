const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const { browserAgent } = require('./amazonScraper'); 
const { logger } = require('./utils/logger');

// Set up command line arguments
program
  .name('amazon-price-updater')
  .description('Update product data with current Amazon prices and links')
  .version('1.0.0')
  .requiredOption('-i, --input <path>', 'path to input JSON file')
  .option('-o, --output <path>', 'path to output JSON file', 'updated-products.json')
  .option('-d, --delay <ms>', 'delay between requests in milliseconds', '3000')
  .option('-s, --start <index>', 'start processing from this index', '0')
  .option('-l, --limit <count>', 'maximum number of products to process', '0')
  .parse(process.argv);

const options = program.opts();

async function writeToOutputFile(products) {
  try {
    await fs.writeFile(
      path.resolve(options.output),
      JSON.stringify(products, null, 2),
      'utf8'
    );
    logger.info(`Output file updated: ${options.output}`);
  } catch (error) {
    logger.error(`Error writing to output file: ${error.message}`);
  }
}

async function main() {
  try {
    logger.info(`Reading input file: ${options.input}`);
    const inputData = await fs.readFile(path.resolve(options.input), 'utf8');
    const products = JSON.parse(inputData);
    
    logger.info(`Found ${products.length} products in input file`);
    
    const startIndex = parseInt(options.start, 10);
    const limit = parseInt(options.limit, 10);
    const endIndex = limit > 0 ? Math.min(startIndex + limit, products.length) : products.length;
    
    logger.info(`Processing products from index ${startIndex} to ${endIndex - 1}`);
    
    const resultProducts = [...products];
    
    await writeToOutputFile(resultProducts);
    
    // Process products one by one incase captcha 
    for (let i = startIndex; i < endIndex; i++) {
      const product = products[i];
      
      logger.progress(i + 1 - startIndex, endIndex - startIndex, `Processing: ${product.name || 'Unknown product'}`);
      
      const updatedProducts = await browserAgent([product], parseInt(options.delay, 10));
      
      if (updatedProducts && updatedProducts[0]) {
        const updatedProduct = updatedProducts[0];
        
        if (updatedProduct.price !== undefined) 
          resultProducts[i].price = updatedProduct.price;
          
        if (updatedProduct.discountPrice !== undefined) 
          resultProducts[i].discountPrice = updatedProduct.discountPrice;
          
        if (updatedProduct.link) {
          if (!resultProducts[i].links) {
            resultProducts[i].links = [];
          }
          
          if (!resultProducts[i].links.includes(updatedProduct.link)) {
            resultProducts[i].links = [updatedProduct.link, ...resultProducts[i].links];
          }
          
          if (resultProducts[i].link) {
            delete resultProducts[i].link;
          }
        }
          
        if (updatedProduct.rating) 
          resultProducts[i].rating = updatedProduct.rating;
          
        resultProducts[i].vendor = "Amazon";
        
      }
      
      await writeToOutputFile(resultProducts);
    }
    
    logger.success(`Processing complete. Output saved to ${options.output}`);
    
  } catch (error) {
    logger.error(`Error in main process: ${error.message}`);
    process.exit(1);
  }
}

main();