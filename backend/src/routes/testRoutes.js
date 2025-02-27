const express = require("express");
const dotenv = require("dotenv");
const Chat = require("../database/model/Chat");
const User = require("../database/model/User");
const Product = require("../database/model/Product");
const { addMessageToChat } = require("../database/mongoHandler");

dotenv.config();
const router = express.Router();

router.get("/database", async (req, res) => {
    const data = {
        users: await User.find(),
        info: await Chat.find().withMessages(),
        products: await Product.find().populate()
    };
    res.status(200).json({ data, status: "success", status_message: "" });
});

router.get("/allChat", async (req, res) => {
    try {
        const data = await Chat.getAll().exec();
        res.status(200).json({ chats: data, status: "success", status_message: "" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/database", async (req, res) => {
    const newUser = new User({
        email: "testuser@example.com",
        password: "password123",
        role: "free",
        username: "testuser",
    });

    const savedUser = await newUser.save();

    const newChat = new Chat({
        display: "Test Chat",
        creator: savedUser._id,
    });

    const savedChat = await newChat.save();

    await addMessageToChat(savedChat._id, "Hello there", true, savedUser._id);
    await addMessageToChat(savedChat._id, "Hello there user", false, null);

    res.status(201).json({ status: "error", message: "Test data created successfully" });
});

router.post("/addmsg", async (req, res) => {
    console.log("Addmsg start");
    const { chatId, message, isSystem, userId } = req.body;
    try {
        addMessageToChat(chatId, message, isSystem, userId).then((result) => {
            if (result.status == "success") res.status(201).json({ chats: data, status: "success", status_message: "Message created" });
            else {
                res.status(400).json(result);
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: "error", message: "Internal Server Error: Test message" });
    }
});

router.get("/chat", async (req, res) => {
    const { chatId } = req.query;

    try {
        const data = await Chat.findById(chatId);
        res.status(200).json({ chats: data, status: "success", status_message: "" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: "error", message: "Internal Error" });
    }
});

router.get("/recommendations", async (req, res) => {
    const { userId } = req.query;

    try {
        const data = await Chat.getUserRecommendation(userId).exec();
        res.status(200).json({ chats: data, status: "success", status_message: "" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/addRandomProducts", async (req, res) => {
    try {
        await Product.insertMany([
            {
                name: "Laptop",
                category: "Electronics",
                description: "A high performance laptop",
                price: 999.99,
                discountPrice: 899.99,
                link: "http://example.com/laptop",
                rating: 4.5,
                vendor: "Vendor A",
                brand: "Brand A",
                specs: ["16GB RAM", "512GB SSD", "Intel i7"],
            },
            {
                name: "Smartphone",
                category: "Electronics",
                description: "A latest model smartphone",
                price: 699.99,
                discountPrice: 649.99,
                link: "http://example.com/smartphone",
                rating: 4.7,
                vendor: "Vendor B",
                brand: "Brand B",
                specs: ["128GB Storage", "6GB RAM", "5G"],
            },
            {
                name: "Headphones",
                category: "Accessories",
                description: "Noise-cancelling headphones",
                price: 199.99,
                discountPrice: 149.99,
                link: "http://example.com/headphones",
                rating: 4.3,
                vendor: "Vendor C",
                brand: "Brand C",
                specs: ["Bluetooth", "20 hours battery life"],
            },
            {
                name: "GPU",
                category: "Components",
                description: "High performance graphics card",
                price: 499.99,
                discountPrice: 449.99,
                link: "http://example.com/gpu",
                rating: 4.8,
                vendor: "Vendor D",
                brand: "Brand D",
                specs: ["8GB GDDR6", "Ray Tracing", "PCIe 4.0"],
            },
            {
                name: "CPU",
                category: "Components",
                description: "Powerful processor",
                price: 299.99,
                discountPrice: 279.99,
                link: "http://example.com/cpu",
                rating: 4.6,
                vendor: "Vendor E",
                brand: "Brand E",
                specs: ["8 Cores", "16 Threads", "3.6GHz"],
            },
            {
                name: "Motherboard",
                category: "Components",
                description: "High-end motherboard",
                price: 199.99,
                discountPrice: 179.99,
                link: "http://example.com/motherboard",
                rating: 4.4,
                vendor: "Vendor F",
                brand: "Brand F",
                specs: ["ATX", "LGA 1200", "DDR4"],
            },
            {
                name: "Storage",
                category: "Components",
                description: "Fast SSD storage",
                price: 149.99,
                discountPrice: 129.99,
                link: "http://example.com/storage",
                rating: 4.7,
                vendor: "Vendor G",
                brand: "Brand G",
                specs: ["1TB", "NVMe", "PCIe 3.0"],
            },
            {
                name: "RAM",
                category: "Components",
                description: "High-speed RAM",
                price: 89.99,
                discountPrice: 79.99,
                link: "http://example.com/ram",
                rating: 4.5,
                vendor: "Vendor H",
                brand: "Brand H",
                specs: ["16GB", "DDR4", "3200MHz"],
            }
        ]);
        res.status(200).json({ status: "success", status_message: "" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/addRec", async (req, res) => {
    const { chatId, cpuId, gpuId, ramId, psuId, motherboardId, storageId, accessoriesIds } = req.query;
    try {
        // chatId, cpuId, gpuId, ramId, psuId, motherboardId, storageId, ...accessoriesIds
        const result = await Chat.addRecommendation("67b9421bdc98ff8f9541512e", "67bfd00a2ebfddd86b1ca550", "67bfd00a2ebfddd86b1ca54f", "67bfd00a2ebfddd86b1ca553" ); //hardcoded
        res.status(200).json({status: "success", status_message: `${result}` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

module.exports = router;
