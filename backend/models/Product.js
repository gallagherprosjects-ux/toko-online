const mongoose = require("mongoose");

const ART = ["kopi", "teh", "keripik", "batik", "anyaman", "madu", "wayang", "sambal"];
const CATEGORIES = ["Makanan", "Minuman", "Fashion", "Souvenir"];
const hex = /^#[0-9a-fA-F]{6}$/;

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Nama produk wajib diisi."], trim: true, maxlength: [80, "Nama maksimal 80 karakter."] },
    price: { type: Number, required: [true, "Harga wajib diisi."], min: [0, "Harga tidak boleh negatif."] },
    stock: {
      type: Number, default: 0, min: [0, "Stok tidak boleh negatif."],
      validate: { validator: Number.isInteger, message: "Stok harus bilangan bulat." },
    },
    category: { type: String, required: [true, "Kategori wajib dipilih."], enum: { values: CATEGORIES, message: "Kategori tidak dikenal." } },
    origin: { type: String, trim: true, default: "" },
    netto: { type: String, trim: true, default: "" },
    desc: { type: String, trim: true, default: "", maxlength: [400, "Deskripsi maksimal 400 karakter."] },
    art: { type: String, enum: { values: ART, message: "Motif tidak dikenal." }, default: "keripik" },
    bg: { type: String, match: [hex, "Warna latar harus berformat #RRGGBB."], default: "#8a6a3b" },
    fg: { type: String, match: [hex, "Warna motif harus berformat #RRGGBB."], default: "#e5d1a1" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// keluaran JSON memakai "id" (string) alih-alih "_id" dan "__v"
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; return ret; },
});

module.exports = mongoose.model("Product", productSchema);
module.exports.ART = ART;
module.exports.CATEGORIES = CATEGORIES;
