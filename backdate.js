const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./backend/models/Product.js');

dotenv.config({ path: './backend/.env' });

async function backdateProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const products = await Product.find({}, '_id name createdAt').limit(10);
    
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const p of products) {
      await Product.updateOne({ _id: p._id }, { $set: { createdAt: thirtyDaysAgo } });
      console.log(`Backdated product: ${p.name}`);
    }

    console.log('Done backdating 10 products to 30 days ago.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

backdateProducts();
