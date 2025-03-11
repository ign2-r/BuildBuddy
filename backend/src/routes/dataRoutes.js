const express = require("express");
const Product = require("../database/model/Product");

const router = express.Router();

router.get("/allProducts", async (req, res) => {
    try {
        const response = await Product.find();
        res.status(200).json({ status: "success", message: "Test data created successfully", products: response});
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to create data", error: error.message });
    }
});

router.post("/bulkAddProduct", async (req, res) => {
    const body = req.body;
    try {
        for (const product of body) {
            const newProduct = new Product(product);
            await newProduct.validate();
        }
        const response = await Product.insertMany(body);
        res.status(201).json({ status: "success", message: `Data added successfully: ${response.toString()}` });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to create data", error: error.message });
    }
});

module.exports = router;