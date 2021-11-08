const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    isCompleted: Boolean,
    isReminder: Boolean,
    isAchieved: Boolean,
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
