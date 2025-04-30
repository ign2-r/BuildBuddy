const fs = require('fs');
const path = require('path');

/**
 * Generate search URLs for a product name.
 * @param {string} name
 * @returns {Array}
 */
function generateSearchLinks(name) {
  const encoded = encodeURIComponent(name);
  return [
    { site: 'Amazon', url: `https://www.amazon.com/s?k=${encoded}` },
    { site: 'Newegg', url: `https://www.newegg.com/p/pl?d=${encoded}` },
    { site: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${encoded}` },
  ];
}

/**
 * Read products from a JSON file, add search links to the links array, and output as JSON.
 * @param {string} inputPath
 * @param {string} outputPath
 */
function processProducts(inputPath, outputPath) {
  const products = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const updated = products.map(product => {
    if (product.name) {
      const links = Array.isArray(product.links) ? product.links : [];
      return {
        ...product,
        links: [
          ...links,
          ...generateSearchLinks(product.name)
        ]
      };
    }
    return product;
  });
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), 'utf-8');
}

// Example usage: will be changed to directly connect with db
if (require.main === module) {
  const input = path.resolve('c:/YOUR/PATH/HERE/IT491/updated_final_temp.json');
  const output = path.resolve('c:/YOUR/PATH/HERE/IT491/updated_final_with_urls.json');
  processProducts(input, output);
  console.log(`Done! Output written to ${output}`);
}

module.exports = { generateSearchLinks, processProducts };