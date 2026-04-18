import mongoose from 'mongoose';
import Order from '../models/Order.js';

const migrateOrders = async () => {
  try {
    const orders = await Order.find({ orderStatus: { $exists: false } });
    console.log(`Found ${orders.length} orders to migrate.`);

    for (const order of orders) {
      // Map old status to new dual status
      if (order.status === 'paid') {
        order.orderStatus = 'DELIVERED';
        order.paymentStatus = 'PAID';
      } else if (order.status === 'cancelled') {
        order.orderStatus = 'CANCELLED';
        order.paymentStatus = 'PENDING';
      } else {
        // pending
        order.orderStatus = 'CREATED';
        order.paymentStatus = 'PENDING';
      }
      await order.save();
    }
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
};

export default migrateOrders;
