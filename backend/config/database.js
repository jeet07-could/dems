import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Use public DNS servers for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MongoDB is not configured; starting in API-only mode.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);

    return true;
  } catch (error) {
    console.warn(
      'MongoDB is unavailable; database routes will remain disabled:',
      error.message
    );

    return false;
  }
};

export default connectDB;