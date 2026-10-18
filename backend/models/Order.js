const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    items: [
      {
        _id: false,
        id: { type: String, required: true },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", { versionKey: false, transform: (d, ret) => { ret.id = String(ret._id); delete ret._id; return ret; } });

module.exports = mongoose.model("Order", orderSchema);
