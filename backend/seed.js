const Product = require("./models/Product");
const data = require("./seed-data");

// isi katalog awal hanya jika koleksi masih kosong
async function seedIfEmpty() {
  if ((await Product.estimatedDocumentCount()) > 0) return false;
  await Product.insertMany(data);
  console.log(`Seed: ${data.length} produk dimasukkan.`);
  return true;
}
module.exports = seedIfEmpty;

// jalankan manual: npm run seed  (menghapus semua produk lalu mengisi ulang)
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/toko_online")
    .then(async () => { await Product.deleteMany({}); await Product.insertMany(data); console.log("Seed ulang selesai."); })
    .catch((e) => { console.error(e.message); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
}
