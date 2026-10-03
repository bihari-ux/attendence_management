const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,          // Maintain up to 50 socket connections for load balancing
      minPoolSize: 10,          // Keep at least 10 sockets open for instant query response
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,                // Use IPv4, skip unnecessary IPv6 DNS queries
    });
    console.log(`MongoDB Connected: ${conn.connection.host} [Pool: 10-50 connections]`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

module.exports = connectDB;

