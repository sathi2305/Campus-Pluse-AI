import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  if (!process.env.MONGO_URI) {
    logger.info('No MONGO_URI provided — running with high-fidelity in-memory campus data store');
    return false;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { autoIndex: true, serverSelectionTimeoutMS: 2500 });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    logger.warn(`MongoDB connection error: ${err.message}. Operating in in-memory mode.`);
    return false;
  }
};
export default connectDB;
