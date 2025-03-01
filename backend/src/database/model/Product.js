const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: { type: String },
    category: { type: String, required: true }, // cpu, gpu, ram, etc. 
    description: { type: String },
    msrpPrice: { type: Number }, // backup and for rough estimates
    links: [{
        url: {type: String},
        rating: { type: Number },
        vendor: { type: String },
        price: { type: Number },
        discountPrice: { type: Number }
    }],
    brand: { type: String },
    specs: {type: [
        {
            speed: {type: String}, //includes ram size, storage size, core count cpu, wattages psu, 
            wattageUse: {type: Number},
            size: {type: String}, // (itx, atx mini, micro, eatx), socket, pcie requirements, memory type    
            requirements: {type: [String], default: []}, //key value check ex: {"cpu": [{size: "a1700", speed: "300"}]} 
            overclock: {type: Boolean},
            other: {type: [String], default: []} // storage read write, ram size
        }
    ]}, // core count, size 
    aesthetic: {type: [String]}, //[any color], white, black, pink, rgb, no lights,     
    releaseDate: { type: Date },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
});

// Make a link pull based on the item
// Make a product update thing for specs and links

const Product = model("Product", productSchema);
module.exports = Product;
