import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Import all models to register them with mongoose
import '../models/User';
import '../models/Organization';
import '../models/Role';
import '../models/Lead';
import '../models/Project';
import '../models/Task';
import '../models/Note';
import '../models/Attachment';
import '../models/AuditLog';
import '../models/Token';

let mongoServer: MongoMemoryReplSet;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB replica set for transaction support
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
}, 60000); // Increase timeout for replica set initialization

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Reset rate limiter stores
  try {
    const { generalStore, authStore } = await import('../middleware/rateLimit');
    await generalStore.resetAll();
    await authStore.resetAll();
  } catch (error) {
    // Ignore if rate limiter is not imported in this test
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect and stop the in-memory database
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Increase timeout for database operations
jest.setTimeout(30000);