const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const Order = require('./backend/models/Order');

async function clearOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const count = await Order.countDocuments();
    console.log(`Found ${count} orders. Deleting all...`);
    
    await Order.deleteMany({});
    
    console.log('Successfully deleted all orders in the Database!');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearOrders();
