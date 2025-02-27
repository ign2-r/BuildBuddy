const cheerio = require('cheerio');

/**
 * Extract brand name from product title or page elements
 * @param {Object} $ Cheerio object loaded with HTML
 * @param {string} productTitle 
 * @returns {string} Brand name
 */
const extractBrand = ($, productTitle) => {
    // First try to get brand from dedicated brand elements
    let brand = null;
    
    // Check if there's a brand element on the page
    const brandElement = $('#bylineInfo, .po-brand .a-span9, #brand');
    if (brandElement.length) {
        const brandText = brandElement.first().text().trim();
        if (brandText) {
            // Extract brand from texts like "Brand: Intel" or "Visit the AMD Store"
            const brandMatch = brandText.match(/(?:Brand:|Visit the\s+)([A-Za-z0-9]+)(?:\s+Store)?/i);
            brand = brandMatch ? brandMatch[1].trim() : brandText.split(' ')[0];
        }
    }
    
    // If brand is not found from elements, try to extract from product title
    if (!brand && productTitle) {
        // Common PC component brands
        const commonBrands = [
            'AMD', 'Intel', 'Nvidia', 'ASUS', 'Acer', 'MSI', 'Gigabyte', 
            'Corsair', 'EVGA', 'NZXT', 'Cooler Master', 'Thermaltake', 
            'Kingston', 'G.Skill', 'Crucial', 'Western Digital', 'Seagate',
            'Samsung', 'Logitech', 'Razer', 'HyperX', 'SteelSeries', 'ASRock',
            'ZOTAC', 'PNY', 'XFX', 'Sapphire', 'be quiet!', 'Fractal Design',
            'Lian Li', 'Phanteks', 'Silverstone', 'TEAMGROUP', 'Patriot', 'Palit'
        ];
        
        // Check if product title starts with a known brand
        for (const knownBrand of commonBrands) {
            if (productTitle.toLowerCase().startsWith(knownBrand.toLowerCase())) {
                brand = knownBrand;
                break;
            }
            
            // Also check if brand appears as a word in the title
            const regex = new RegExp(`\\b${knownBrand}\\b`, 'i');
            if (regex.test(productTitle)) {
                brand = knownBrand;
                break;
            }
        }
    }
    
    return brand || 'Unknown'; // If brand is not found, default to 'Unknown'
};

/**
 * Parse Amazon product HTML and extract structured data
 * @param {string} html The HTML content of the Amazon product page
 * @param {string} productUrl The URL of the product
 * @returns {Object} Structured product data
 */
exports.parseProductData = (html, productUrl) => {
    const $ = cheerio.load(html);
    const product = {};

    const cleanText = text => text ? text.trim().replace(/\s+/g, ' ') : null;
    
    // Extract product name
    product.name = cleanText($('#productTitle').text());
    
    // Extract brand
    product.brand = extractBrand($, product.name);
    
    // Extract price information (MSRP and current price)
    let currentPrice = null;
    let originalPrice = null;

    // First try to find the "Was" price (MSRP/List Price)
    const listPriceSelectors = [
        '.a-price.a-text-price .a-offscreen',
        '#listPrice',
        '#priceblock_ourprice_lbl',
        '.savingsPercentage + .a-text-price .a-offscreen'
    ];

    for (const selector of listPriceSelectors) {
        const priceText = $(selector).first().text();
        if (priceText && priceText.includes('$')) {
            originalPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            break;
        }
    }

    // Then get the current selling price
    const currentPriceSelectors = [
        '.priceToPay .a-offscreen',
        '.apexPriceToPay .a-offscreen',
        '.a-price:not(.a-text-price) .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_saleprice',
        '.a-color-price'
    ];

    for (const selector of currentPriceSelectors) {
        const priceText = $(selector).first().text();
        if (priceText && priceText.includes('$')) {
            currentPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            break;
        }
    }

    // Set price and discountPrice appropriately
    if (originalPrice && currentPrice) {
        // Both prices found - set MSRP as price and current as discountPrice
        product.price = originalPrice;
        product.discountPrice = currentPrice;
    } else if (currentPrice) {
        // Only current price found - assume it's not discounted (will change)
        product.price = currentPrice;
    } else if (originalPrice) {
        // Only original price found
        product.price = originalPrice;
    }

    // Also check the savings percentage section for confirmation of a discount
    const savingsText = $('.savingsPercentage').text();
    if (savingsText && !product.discountPrice && product.price) {
        // If we have a savings percentage but didn't detect the discount properly
        const match = savingsText.match(/\((\d+)%\)/);
        if (match && match[1]) {
            const savingsPercent = parseInt(match[1]) / 100;
            // Estimate original price from current price and savings percentage
            const estimatedOriginal = product.price / (1 - savingsPercent);
            product.discountPrice = product.price;
            product.price = Math.round(estimatedOriginal * 100) / 100; // Round to 2 decimal places
        }
    }
    
    // Extract product rating
    const ratingText = $('#acrPopover').attr('title') || $('.a-icon-star').first().text();
    if (ratingText) {
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        product.rating = ratingMatch ? ratingMatch[0] : null;
    }
    
    // Extract product description
    product.description = cleanText($('#productDescription').text()) || 
                          cleanText($('#feature-bullets').text()) ||
                          'No description available';
    
    // Set product URL
    product.link = productUrl;
    
    // Extract product specs
    product.specs = [];
    
    // From bullet points
    $('#feature-bullets ul li').each((i, el) => {
        const spec = cleanText($(el).text());
        if (spec) product.specs.push(spec);
    });
    
    // From technical details table
    $('#productDetails_techSpec_section_1 tr, #technicalSpecifications_section_1 tr').each((i, el) => {
        const label = cleanText($(el).find('th').text());
        const value = cleanText($(el).find('td').text());
        if (label && value) {
            product.specs.push(`${label}: ${value}`);
        }
    });
    
    // Determine category
    const categoryText = $('#wayfinding-breadcrumbs_feature_div').text().toLowerCase();
    if (categoryText.includes('processor') || categoryText.includes('cpu')) {
        product.category = 'cpu';
    } else if (categoryText.includes('graphics card') || categoryText.includes('gpu')) {
        product.category = 'gpu';
    } else if (categoryText.includes('memory') || categoryText.includes('ram')) {
        product.category = 'ram';
    } else {
        product.category = 'computer_component';
    }
    
    product.vendor = 'Amazon';
    
    return product;
};