const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema({
    createdAt: { type: Date, default: new Date(), immutable: true },
    userAuthor: { type: Schema.Types.ObjectId, ref: "User", required: false, immutable: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, immutable: true },
    isBot: Boolean,
    message: String,
});



const Message = model("Message", messageSchema);
module.exports = Message;
