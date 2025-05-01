const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { createFromHexString } = mongoose.Types.ObjectId;

const productLinkSchema = new Schema(
    {
        url: { type: String },
        rating: { type: Number },
        vendor: { type: String },
        price: { type: Number },
        discountPrice: { type: Number },
        createdAt: { type: Date, default: new Date() },
    },
    { timestamps: true, id: false }
);

const productSchema = new Schema(
    {
        name: { type: String, unique: true },
        category: { type: String, required: true }, // cpu, gpu, ram, etc.
        description: { type: String },
        msrpPrice: { type: Number }, // backup and for rough estimates
        brand: { type: String }, // AMD, intel, etc, sanitize
        links: [productLinkSchema],
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
    },
    { timestamps: true }
);

/**
 * Update a link for a product, pass null to any missing values
 * @param {string} productId - Product id of the item.
 * @param {string} name - Name of product if you want to search instead.
 * @param {string} url - link to the product.
 * @param {number} rating - rate of the product normalized (4/5 = 0.8 or 5/10 = 0.5).
 * @param {string} vendor - name of company distributing the product.
 * @param {number} price - price for the product without discounts.
 * @param {number} discountPrice - discounted price.
 */
productSchema.statics.updateLink = async function (productId, name = null, url, rating, vendor, price, discountPrice) {
    try {
        const updateFields = { url: url, vendor: vendor };
        if (rating !== null && rating !== undefined) updateFields.rating = rating;
        if (price !== null && price !== undefined) updateFields.price = price;
        if (discountPrice !== null && discountPrice !== undefined) updateFields.discountPrice = discountPrice;

        let result = { modifiedCount: -1 };
        if (productId) {
            result = await this.updateOne({ _id: createFromHexString(productId) }, { $push: { links: updateFields } });
        } else if (name) {
            result = await this.updateOne({ name: name }, { $push: { links: updateFields } });
        } else {
            throw new Error("Missing name or productID for updating product spec");
        }

        if (result.modifiedCount > 0) {
            console.log(`Successfully upaded item with ID: ${productId}`);
        } else {
            console.log(`Item with ID: ${productId} not found in any document`);
        }
    } catch (error) {
        console.error("Error removing product link: " + error);
    }
};

/**
 * Remove the instance of the link
 * @param {string} productId - Product id of the item being added to.
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

/**
 * Add a specification for a product.
 * @param {string} productId - Product id of the item.
 * @param {string} [name=null] - Name of product if you want to search instead.
 * @param {string} speed - Speed specification (includes RAM size, storage size, core count CPU, wattages PSU).
 * @param {number} wattageUse - Wattage usage specification.
 * @param {string} size - Size specification (ITX, ATX mini, micro, EATX), socket, PCIe requirements, memory type.
 * @param {string[]} requirements - Key value check (e.g., {"cpu": [{size: "a1700", speed: "300"}]}).
 * @param {boolean} overclock - Overclock capability.
 * @param {string[]} other - Other specifications (e.g., storage read/write, RAM size).
 */
productSchema.statics.addSpec = async function (productId, name = null, speed, wattageUse, size, requirements, overclock, other) {
    try {
        const updateFields = {};
        if (speed !== null && speed !== undefined) updateFields.speed = speed;
        if (wattageUse !== null && wattageUse !== undefined) updateFields.wattageUse = wattageUse;
        if (size !== null && size !== undefined) updateFields.size = size;
        if (requirements !== null && requirements !== undefined) updateFields.requirements = requirements;
        if (overclock !== null && overclock !== undefined) updateFields.overclock = overclock;
        if (other !== null && other !== undefined) updateFields.other = other;

        let result = { modifiedCount: -1 };
        if (productId) {
            result = await this.updateOne({ _id: createFromHexString(productId) }, { $push: { specs: updateFields } });
        } else if (name) {
            result = await this.updateOne({ name: name }, { $push: { specs: updateFields } });
        } else {
            throw new Error("Missing name or productID for updating product spec");
        }

        if (result.modifiedCount > 0) {
            console.log(`Successfully added spec item with ID: ${productId}`);
        } else {
            console.log(`Item with ID: ${productId} not found in any document`);
        }
    } catch (error) {
        console.error("Error removing product link: " + error);
    }
};

/**
 * get a list of products by category, can be limited
 * @param {string} category to be searched.
 * @param {number} limit the amount of returns - optional, default 25.
 */
productSchema.statics.getCategory = function (category, limit = 25) {
    return this.find({ category: category }).sort({ releaseDate: -1 }).limit(limit);
};

/**
 * Find the product by name
 * @param {string} name to be searched.
 * @returns {Product}
 */
productSchema.statics.findByName = function (name) {
    return this.find({ name: new RegExp(name, "i") });
};

/**
 * Upsert a product
 * @param {product} product to be added.
 * @returns {Product}
 */
productSchema.statics.findByName = function (product) {
    return this.find({ name: new RegExp(name, "i") });
};

productSchema.statics.recSearch = function (category, minPrice, maxPrice, keywords, limit) {
    console.debug(`Starting rec search with ${category}, ${minPrice}, ${maxPrice}, ${keywords}`);
    const regex = keywords.length !== 0 ? new RegExp(keywords.map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|"), "i") : new RegExp(/.*/g);

    const pipeline = [
        {
            $match: {
                category: new RegExp(category, "i"),
            },
        },
        {
            $addFields: {
                score: {
                    $add: [
                        // +10 for matching msrpPrice
                        {
                            $cond: [
                                {
                                    $and: [{ $gte: ["$msrpPrice", minPrice] }, { $lte: ["$msrpPrice", maxPrice] }],
                                },
                                10,
                                0,
                            ],
                        },
                        // +5 × (number of brand matches)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $regexFindAll: {
                                            input: { $ifNull: ["$brand", ""] },
                                            regex,
                                        },
                                    },
                                },
                                5,
                            ],
                        },

                        // +5 × (number of matches in size)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$size", []] },
                                            as: "str",
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toString: "$$str" },
                                                    regex,
                                                },
                                            },
                                        },
                                    },
                                },
                                5,
                            ],
                        },

                        // +3 × (number of matches in otherStrings)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$other", []] },
                                            as: "str",
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toString: "$$str" },
                                                    regex,
                                                },
                                            },
                                        },
                                    },
                                },
                                3,
                            ],
                        },

                        // +2 × (number of matches in aesthetic)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: { $ifNull: ["$aesthetic", []] },
                                            as: "str",
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toString: "$$str" },
                                                    regex,
                                                },
                                            },
                                        },
                                    },
                                },
                                2,
                            ],
                        },
                        // +1 × (number of name matches)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $regexFindAll: {
                                            input: { $ifNull: ["$name", ""] },
                                            regex,
                                        },
                                    },
                                },
                                1,
                            ],
                        },

                        // +1 × (number of description matches)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $regexFindAll: {
                                            input: { $ifNull: ["$description", ""] },
                                            regex,
                                        },
                                    },
                                },
                                1,
                            ],
                        },
                    ],
                },
            },
        },
        { $sort: { score: -1, releaseDate: -1 } },
        {
            $project: {
                _id: 1,
                category: 1,
                name: 1,
                aesthetic: 1,
                brand: 1,
                description: 1,
                msrpPrice: 1,
                releaseDate: 1,
                specs: 1,
                score: 1, // include score if you want to inspect it
            },
        },
        { $limit: limit },
    ];
    return this.aggregate(pipeline);
};

// ===========================================Queries================================================
/**
 * additional query to futher filter a static and get products between a min and max
 * @param {number} minPrice to be used to query min.
 * @param {number} maxPrice to be used to query max.
 * @returns {Product}
 */
productSchema.query.msrpPriceRange = function (minPrice, maxPrice) {
    return this.find({ msrpPrice: { $gte: minPrice, $lte: maxPrice } }).sort({
        msrpPrice: 1,
    });
};

/**
 * search for other words
 * @param {string} keywords to be used to query.
 * @returns {Product}
 */
productSchema.query.searchByKeywords = function (keywords) {
    const query = {
        $or: [
            { name: { $in: keywords.map((k) => new RegExp(k, "i")) } },
            { brand: { $in: keywords.map((k) => new RegExp(k, "i")) } },
            { "specs.other": { $in: keywords.map((k) => new RegExp(k, "i")) } },
        ],
    };

    if (keywords.length === 0) {
        return this.find(); // Return a few products if no keywords are provided
    }
    return this.find(query);
};

const Product = model("Product", productSchema);

module.exports = Product;

module.exports.VALID_CAT = ["cpu", "gpu", "memory", "psu", "motherboard", "storage"];
