const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { createFromHexString } = mongoose.Types.ObjectId;

const chatSchema = new mongoose.Schema({
    display: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
    messages: { type: [{ type: Schema.Types.ObjectId, ref: "Message" }], default: [] },
    recommendation: {
        type: [
            {
                createdAt: { type: Date, default: Date.now, immutable: true },
                display: {type: String},
                cpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                cpuCooler: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                gpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                ram: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                psu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                motherboard: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                storage: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                accessories: [{ type: Schema.Types.ObjectId, ref: "Product", required: false }],
            },
        ],
        default: [],
    },
});

chatSchema.statics.getUserRecommendation = function (id) {
    return this.find({ creator: createFromHexString(id) })
        .populate("creator")
        .populate({
            path: "recommendation",
            populate: [{ path: "cpu" }, { path: "gpu" }, { path: "ram" }, { path: "psu" }, { path: "motherboard" }, { path: "storage" }, { path: "accessories" }],
        })
        .select({ recommendation: 1, updatedAt: 1, creator: 1 });
};

chatSchema.statics.withRecommendationsByUser = function (id) {
    console.log(`With populated recommendation with ${id}`);
    return this.find({ creator: createFromHexString(id) })
        .populate("creator")
        .populate({
            path: "recommendation",
            populate: [{ path: "cpu" }, { path: "gpu" }, { path: "ram" }, { path: "psu" }, { path: "motherboard" }, { path: "storage" }, { path: "accessories" }],
        });
};

chatSchema.statics.findByUsername = function (username) {
    return this.find({ username: new RegExp(username, "i") });
};

chatSchema.statics.getAll = function () {
    return this.find({})
        .populate("messages")
        .populate("creator")
        .populate({
            path: "recommendation",
            populate: [{ path: "cpu" }, { path: "gpu" }, { path: "ram" }, { path: "psu" }, { path: "motherboard" }, { path: "storage" }, { path: "accessories" }],
        });
};

chatSchema.statics.addRecommendation = function (chatId, cpuId, gpuId, ramId, psuId, motherboardId, storageId, ...accessoriesIds) {
    return this.findById(createFromHexString(chatId)).then((chat) => {
        if (!chat) throw new Error("Chat not found");
        const recommendation = {
            cpu: cpuId && createFromHexString(cpuId),
            gpu: gpuId && createFromHexString(gpuId),
            ram: ramId && createFromHexString(ramId),
            psu: psuId && createFromHexString(psuId),
            motherboard: motherboardId && createFromHexString(motherboardId),
            storage: storageId && createFromHexString(storageId),
            accessories: accessoriesIds.map((id) => (id ? createFromHexString(id) : null)),
        };
        chat.recommendation.push(recommendation);
        return chat.save();
    });
};

chatSchema.query.withMessages = function () {
    return this.populate("messages").populate("creator").sort({ createdAt: 1 });
};


// get a user's chats
// get a user's recs
// archieve a chat
// sanitize id's

const Chat = model("Chat", chatSchema);
module.exports = Chat;
