const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: { type: String },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    link: { type: String },
    rating: { type: Number },
    vendor: { type: String },
    brand: { type: String },
    specs: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
});

const Product = model("Product", productSchema);
module.exports = Product;

