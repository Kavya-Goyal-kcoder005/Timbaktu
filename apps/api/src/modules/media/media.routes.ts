import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import { mediaService, LocalDiskStorageProvider } from '../../services/mediaService';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for high quality audio
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/x-m4a',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowedMime.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError(`Unsupported media type: ${file.mimetype}`, 400, 'UNSUPPORTED_MEDIA_TYPE'));
    }
  },
});

// POST /api/v1/media/upload
router.post(
  '/upload',
  requireAuth,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded.', 400, 'NO_FILE');
      }

      const mediaType = req.file.mimetype.startsWith('audio/') ? 'audio' : 'image';
      const durationSeconds = req.body.durationSeconds ? parseFloat(req.body.durationSeconds) : undefined;

      const provider = mediaService.getProvider();
      const metadata = await provider.uploadFile(req.file, mediaType, durationSeconds);

      res.status(201).json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/media/stream/:filename
// HTTP 206 Partial Content range support for flawless audio seeking & streaming
router.get('/stream/:filename', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const provider = mediaService.getProvider();
    if (!(provider instanceof LocalDiskStorageProvider)) {
      res.redirect(`/uploads/${req.params.filename}`);
      return;
    }

    const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
    const filePath = provider.getStreamPath(filename);
    if (!fs.existsSync(filePath)) {
      throw new AppError('Media asset not found.', 404, 'MEDIA_NOT_FOUND');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Detect MIME type by extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      webm: 'audio/webm',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    const contentType = (ext && mimeTypes[ext]) || 'application/octet-stream';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
        return;
      }

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/media/sign
router.post('/sign', requireAuth, (req: Request, res: Response): void => {
  const provider = mediaService.getProvider();
  res.json({
    success: true,
    data: {
      provider: provider.providerName,
      uploadUrl: '/api/v1/media/upload',
    },
  });
});

// DELETE /api/v1/media/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = mediaService.getProvider();
    const mediaId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await provider.deleteFile(mediaId);
    res.json({
      success: true,
      message: 'Media file removed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export const mediaRouter = router;
