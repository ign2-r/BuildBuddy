const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema(
    {
        createdAt: { type: Date, default: new Date(), immutable: true },
        role: { type: String },
        content: { type: String },
        userAuthor: { type: Schema.Types.ObjectId, ref: "User", required: false, immutable: true }, //blank/null if bot
        message: String,
    },
    { timestamps: true }
);

const Message = model("Message", messageSchema);
module.exports = Message;
