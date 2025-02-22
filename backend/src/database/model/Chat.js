const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { ObjectId } = mongoose.Types;

const chatSchema = new mongoose.Schema({
    display: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
    messages: {type: [{ type: Schema.Types.ObjectId, ref: "Message" }], default: []},
    recommendation: {
        type: [
            {
                createdAt: { type: Date, default: Date.now, immutable: true },
                cpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                gpu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                ram: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                psu: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                motherboard: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                storage: { type: Schema.Types.ObjectId, ref: "Product", required: false },
                accessories: [{ type: Schema.Types.ObjectId, ref: "Product", required: false }],
            },
        ],
        default: []
    },
});

chatSchema.statics.withRecommendationsByUser = function(id) {
    return this.populate("creator").populate("recommendation").find({ creator: new ObjectId(id) });
};

chatSchema.statics.findByUsername = function(username) {
    return this.find({ username: new RegExp(username, 'i')});
};

chatSchema.query.withMessages = function() {
    return this.populate("messages").populate("creator").sort({createdAt: 1});
};

const Chat = model("Chat", chatSchema);
module.exports = Chat;