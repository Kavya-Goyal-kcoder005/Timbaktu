import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index';
import { logger } from '../utils/logger';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<void> {
  try {
    if (config.mongodbUri && config.mongodbUri.trim() !== '') {
      logger.info(`Connecting to configured MongoDB at ${config.mongodbUri.replace(/:\/\/.*@/, '://<credentials>@')}...`);
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('Connected to MongoDB successfully.');
      return;
    }
  } catch (error) {
    logger.warn(`Failed to connect to configured MongoDB URI: ${(error as Error).message}`);
    if (config.nodeEnv === 'production') {
      throw error;
    }
  }

  // Fallback to MongoMemoryServer in development and testing if external database is unavailable
  try {
    logger.info('Starting local in-memory MongoDB instance for development & testing...');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    logger.info(`Connected to in-memory MongoDB at ${uri}`);
  } catch (memError) {
    logger.error('Failed to initialize in-memory MongoDB fallback', { error: (memError as Error).message });
    throw memError;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
