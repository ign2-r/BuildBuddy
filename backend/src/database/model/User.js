const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    budget_min: { type: Number, required: false }, //ensure float and rounded to second place
    budget_max: { type: Number, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, //hashed
    role: { type: String, required: true }, // free, paid, admin
    username: { type: String, required: true, unique: true }, //sanitize
    createdAt: { type: Date, default: Date.now },
    notes: { type: [String], default: [] } //sanitize
});

userSchema.statics.findByUsername = function(username) {
    return this.find({ username: new RegExp(username, 'i')});
};

const User = model("User", userSchema);
module.exports = User;

