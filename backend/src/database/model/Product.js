const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { createFromHexString } = mongoose.Types.ObjectId;

const productSchema = new Schema({
    name: { type: String, unique: true },
    category: { type: String, required: true }, // cpu, gpu, ram, etc.
    description: { type: String },
    msrpPrice: { type: Number }, // backup and for rough estimates
    links: [
        {
            url: { type: String },
            rating: { type: Number },
            vendor: { type: String },
            price: { type: Number },
            discountPrice: { type: Number },
            createdAt: {type: Date, default: new Date()}
        },
    ],
    brand: { type: String }, // AMD, intel, etc, sanitize
    specs: {
        type: [
            {
                speed: { type: String }, //includes ram size, storage size, core count cpu, wattages psu,
                wattageUse: { type: Number },
                size: { type: String }, // (itx, atx mini, micro, eatx), socket, pcie requirements, memory type
                requirements: { type: [String], default: [] }, //key value check ex: {"cpu": [{size: "a1700", speed: "300"}]}
                overclock: { type: Boolean },
                other: { type: [String], default: [] }, // storage read write, ram size
            },
        ],
    }, // core count, size
    aesthetic: { type: [String] }, //[any color], white, black, pink, rgb, no lights,
    releaseDate: { type: Date },
    createdAt: { type: Date, default: new Date(), immutable: true },
    updatedAt: { type: Date, default: new Date() },
});

// Make a link pull based on the item
// Make a product update thing for specs and links

/*
 * Update a link for a product, pass null to any missing values
 * @param {string} productId - Product id of the .
 * @param {string} url - link to the product.
 * @param {number} rating - rate of the product normalized (4/5 = 0.8 or 5/10 = 0.5).
 * @param {string} vendor - name of company distributing the product.
 * @param {number} price - price for the product without discounts.
 * @param {number} discountPrice - discounted price.
 */
productSchema.statics.updateLink = async function (productId, url, rating, vendor, price, discountPrice) {
    try {
        const updateFields = {url: url, vendor: vendor};
        if (rating !== null && rating !== undefined) updateFields.rating = rating;
        if (price !== null && price !== undefined) updateFields.price = price;
        if (discountPrice !== null && discountPrice !== undefined) updateFields.discountPrice = discountPrice;

        const result = await this.updateOne(
            { _id: createFromHexString(productId) },
            { $push: { links: updateFields } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully removed item with ID: ${productId}`);
        } else {
            console.log(`Item with ID: ${productId} not found in any document`);
        }
    } catch (error) {
        console.error("Error removing product link: " + error);
    }
};

/*
 * Remove the instance of the link
 * @param {string} productId - Product id of the .
 * @param {string} url - link to the product used as reference.
 */
productSchema.statics.removeLink = async function (productId, url) {
    try {
        const result = await this.updateOne({ _id: createFromHexString(productId) }, { $pull: { links: { url: url } } });

        if (result.modifiedCount > 0) {
            console.log(`Successfully removed item with ID: ${productId}`);
        } else {
            console.log(`Item with ID: ${productId} not found in any document`);
        }
    } catch (error) {
        console.error("Error removing product link: " + error);
    }
};

productSchema.statics.addSpec = function (productId, url, rating, vendor, price, discountPrice) {};

const Product = model("Product", productSchema);

module.exports = Product;
