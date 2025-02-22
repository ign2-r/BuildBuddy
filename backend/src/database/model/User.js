import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    budget_min: { type: Number, required: true },
    budget_max: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    notes: { type: [String], default: [] }
});

chatSchema.statics.findByUsername = function(username) {
    return this.find({ username: new RegExp(username, 'i')});
};

const User = model("User", userSchema);
export default User;

