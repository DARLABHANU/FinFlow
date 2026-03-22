import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';
import { startSelfPinging } from './utils/keepAlive';

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finflow';

if (process.env.NODE_ENV === 'production' && MONGO_URI.includes('localhost')) {
  console.warn('\n⚠️  [WARNING]: MONGO_URI is pointing to localhost in production!');
  console.warn('   Ensure you have added your MongoDB Atlas connection string to the Render Dashboard -> Environment tab.\n');
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
      if (process.env.NODE_ENV === 'production') {
        startSelfPinging(PORT);
      }
    });
  })
  .catch((err) => {
    console.error('❌ FATAL: Database connection error:', err.message);
    process.exit(1); // Exit with error so Render knows the deploy failed
  });
