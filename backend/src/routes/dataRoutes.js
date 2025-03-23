const express = require("express");
const Product = require("../database/model/Product");

const router = express.Router();

router.get("/searchCategory", async (req, res) => {
    const { category } = req.query;
    try {
        const response = await Product.getCategory(category, 5).msrpPriceRange(300, 500);
        res.status(200).json({ status: "success", message: "Test data created successfully", products: response });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to create data", error: error.message });
    }
});

router.get("/allProducts", async (req, res) => {
    try {
        const response = await Product.find();
        res.status(200).json({ status: "success", message: "Test data created successfully", products: response });
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
        const bulkOperations = dataFile.map((obj) => ({
            updateOne: {
                filter: { name: obj.name, category: obj.category },
                update: { $set: obj },
                upsert: true,
            },
        }));

        const response = await Product.bulkWrite(bulkOperations);
        res.status(201).json({ status: "success", message: `Data added successfully: ${response.toString()}` });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to create data", error: error.message });
    }
});

router.post("/addSpec", async (req, res) => {
    const { productId, name, speed, wattageUse, size, requirements, overclock, other } = req.body;
    try {
        const response = await Product.addSpec(productId, name, speed, wattageUse, size, requirements, overclock, other);
        res.status(201).json({ status: "success", message: `Data added successfully` });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to create data", error: error.message });
    }
});

module.exports = router;
