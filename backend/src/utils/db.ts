import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI as string;
    
    // Check if it's the dummy URI
    if (mongoUri.includes('cluster0.mongodb.net')) {
      console.log('⚠️ Dummy MongoDB URI detected. Starting In-Memory MongoDB for local testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Ready for Testing!)`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
