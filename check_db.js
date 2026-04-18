const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const Order = require('./backend/models/Order');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const count = await Order.countDocuments();
    console.log('Total orders in DB:', count);
    
    const orders = await Order.find().limit(5);
    console.log('Recent 5 orders:', JSON.stringify(orders, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
