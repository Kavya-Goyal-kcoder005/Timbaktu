import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { reportSchema } from '@timbaktu/shared';
import { optionalAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

interface IReportDocument extends Document {
  postId: mongoose.Types.ObjectId;
  reportedBy?: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });

const ReportModel = mongoose.models.ContentReport || mongoose.model<IReportDocument>('ContentReport', ReportSchema);

const router = Router();

// POST /api/v1/posts/:id/report
router.post('/:id/report', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = reportSchema.parse(req.body);

    const report = await ReportModel.create({
      postId: req.params.id,
      reportedBy: req.user?._id,
      reason: validated.reason,
      details: validated.details || '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review. Thank you for helping keep Timbaktu safe.',
      data: {
        id: report._id.toString(),
        createdAt: report.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export const reportRouter = router;
