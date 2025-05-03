const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { createFromHexString } = mongoose.Types.ObjectId;

const recommendationSchema = new mongoose.Schema(
    {
        display: { type: String },
        cpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        cpuCooler: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        gpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        ram: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        psu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        motherboard: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        storage: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        accessories: [{ type: Schema.Types.ObjectId, ref: "Product", required: false }],
    },
    { timestamps: true, id: true }
);

const chatSchema = new mongoose.Schema(
    {
        display: { type: String, required: true },
        creator: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
        archived: { type: Boolean, default: false },
        messages: { type: [{ type: Schema.Types.ObjectId, ref: "Message" }], default: [] },
        recommendation: {
            type: [recommendationSchema],
            default: [],
        },
    },
    { timestamps: true }
);

/**
 * Swap the status of the archive.
 * @param {string} chatId - Chat id of the item.
 * @param {string} [archiveState=null] - state to set the archive manually.
 * @returns {boolean} - determines if it has succeeded
 */
chatSchema.statics.toggleArchive = async function (chatId, toggleArchive = null) {
    try {
        const chat = await this.findById({ _id: createFromHexString(chatId) });
        chat.archived = toggleArchive === true || toggleArchive === false ? toggleArchive : !chat.archived;
        const result = await chat.save();

        if (result) {
            console.log(`Successfully toggled chat ID to archive: ${chatId}`);
            return true;
        } else {
            console.log(`Item with ID: ${chatId} not found in any document`);
            return false;
        }
    } catch (error) {
        console.error("Error updating chat to toggled archive: " + error);
        return false;
    }
};

/**
 * Get the recommendations with uid, only has recommendatons, last update, and creator
 * @param {string} uid - uid to search.
 * @returns {Chat[]}
 */
chatSchema.statics.getUserRecommendation = function (uid) {
    return this.find({ creator: createFromHexString(uid) })
        .withRecommendations()
        .sort({ updatedAt: 1 })
        .select({ recommendation: 1, creator: 1 });
};

/**
 * Get the filled informaton for all chats based on UID
 * @param {string} uid - uid to search.
 * @returns {Chat[]}
 */
chatSchema.statics.withRecommendationsByUser = function (uid) {
    console.log(`With populated recommendation with ${uid}`);
    return this.find({ creator: createFromHexString(uid) }).withRecommendations();
};

/**
 * Get all stats populated - should only be used for development
 * @returns {Chat[]}
 */
chatSchema.statics.getAll = function () {
    return this.find({}).populate("messages").populate("creator").withRecommendations();
};

/**
 * Add recommendation to a chat, recommended to do key value run.
 * @param {string} chatId - Product id of the item.
 * @param {string} cpuId - CPU object id.
 * @param {string} cpuCooler - CPU cooler object id.
 * @param {string} gpuId - GPU object id.
 * @param {string} ramId - RAM  object id.
 * @param {string} psuId - PSU  object id.
 * @param {string} motherboardId - Motherboard object id.
 * @param {string[]} accessoriesIds - Keys for all accessories.
 * @returns {Chat}
 */
chatSchema.statics.addRecommendation = function (chatId, cpuId, cpuCoolerId, gpuId, ramId, psuId, motherboardId, storageId, accessoriesIds) {
    return this.findById(createFromHexString(chatId)).then((chat) => {
        if (!chat) throw new Error("Chat not found");
        const recommendation = {
            cpu: cpuId && createFromHexString(cpuId),
            cpuCooler: cpuCoolerId && createFromHexString(cpuCoolerId),
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

/**
 * Get user chats populated with recommendations.
 * @param {string} uid - search by user.
 * @returns {Chat[]}
 */
chatSchema.statics.getChatByUser = function (uid) {
    return this.find({ creator: createFromHexString(uid) })
        .withMessagesMin()
        .withRecommendations();
};

chatSchema.statics.getUserChats = function (uid) {
    return this.find({ creator: createFromHexString(uid) })
        .select({ display: 1, archived: 1, updatedAt: 1, createdAt: 1 })
        .populate({
            path: "messages",
            match: { role: { $ne: "system" } },
            options: { sort: { createdAt: 1 }, limit: 2, select: { role: 1, content: 1 } }
        });
}

// ===========================================Queries================================================

/**
 * Query to add to search that populates the messages.
 * @returns {Chat[]}
 */
chatSchema.query.withMessages = function () {
    return this.populate("messages").sort({ createdAt: 1 });
};

/**
 * Query to add to search that populates the messages.
 * @returns {Chat[]}
 */
chatSchema.query.withMessagesMin = function () {
    return this.populate({
        path: "messages",
        match: { role: { $ne: "system" } },
        options: { sort: { createdAt: 1 } }
    }).lean();
};

/**
 * Query to add to search that add creator information - assumes the user information should be loaded into client memory.
 * @returns {Chat[]}
 */
chatSchema.query.withCreatorInfo = function () {
    return this.populate("creator");
};

/**
 * Query to add to search that populates the recommendations.
 * @returns {Chat[]}
 */
chatSchema.query.withRecommendations = function () {
    return this.populate({
        path: "recommendation",
        populate: [{ path: "cpu" }, { path: "gpu" }, { path: "ram" }, { path: "psu" }, { path: "motherboard" }, { path: "storage" }, { path: "accessories" }],
    });
};

// archive a chat
// sanitize id's

const Chat = model("Chat", chatSchema);
module.exports = Chat;
