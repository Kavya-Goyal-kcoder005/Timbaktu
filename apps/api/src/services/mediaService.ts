import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaMetadata, MediaProvider } from '@timbaktu/shared';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface IMediaStorageProvider {
  providerName: MediaProvider;
  uploadFile(file: Express.Multer.File, mediaType: 'audio' | 'image', durationSeconds?: number): Promise<MediaMetadata>;
  deleteFile(publicId: string): Promise<void>;
  getStreamPath?(publicId: string): string;
}

export class LocalDiskStorageProvider implements IMediaStorageProvider {
  public providerName: MediaProvider = 'local';
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.localUploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, mediaType: 'audio' | 'image', durationSeconds?: number): Promise<MediaMetadata> {
    const fileExt = path.extname(file.originalname) || (mediaType === 'audio' ? '.webm' : '.png');
    const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const filename = `${uniqueId}${fileExt}`;
    const targetPath = path.join(this.uploadDir, filename);

    // Write file buffer to local disk
    await fs.promises.writeFile(targetPath, file.buffer);

    const publicUrl = `/api/v1/media/stream/${filename}`;

    logger.info(`Saved ${mediaType} file locally: ${filename} (${file.size} bytes)`);

    return {
      id: uniqueId,
      provider: 'local',
      publicId: filename,
      url: publicUrl,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      durationSeconds: durationSeconds || (mediaType === 'audio' ? 0 : undefined),
      mediaType,
      createdAt: new Date().toISOString(),
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(publicId);
    const targetPath = path.join(this.uploadDir, safeFilename);

    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      logger.info(`Deleted local media file: ${safeFilename}`);
    }
  }

  getStreamPath(publicId: string): string {
    const safeFilename = path.basename(publicId);
    return path.join(this.uploadDir, safeFilename);
  }
}

// Media Service Manager singleton
class MediaServiceManager {
  private provider: IMediaStorageProvider;

  constructor() {
    // Zero-config local provider by default, configurable for production Cloudinary / S3
    this.provider = new LocalDiskStorageProvider();
  }

  getProvider(): IMediaStorageProvider {
    return this.provider;
  }
}

export const mediaService = new MediaServiceManager();
