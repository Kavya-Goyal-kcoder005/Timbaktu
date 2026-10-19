import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'timbaktu_dev_jwt_secret_key_needs_min_32_characters_12345',
  sessionSecret: process.env.SESSION_SECRET || 'timbaktu_dev_session_secret_cookie_key_67890',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  publicAppUrl: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  
  // Media Storage
  storageProvider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 'cloudinary' | 's3',
  localUploadDir: path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || './uploads'),

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // S3
  s3: {
    region: process.env.AWS_REGION || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucket: process.env.AWS_S3_BUCKET || '',
  }
};
