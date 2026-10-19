import { Router, Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { PostModel } from '../../models/Post';
import { optionalAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// GET /api/v1/posts/:id/export?format=md|html|pdf|audio
router.get('/:id/export', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const format = ((req.query.format as string) || 'md').toLowerCase();
    const post = await PostModel.findById(req.params.id).populate('authorId', 'username displayName');

    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    // Check authorization for drafts
    const authorDoc = post.authorId as unknown as { _id: { toString(): string }; username: string; displayName: string };
    const isAuthor = req.user && authorDoc && authorDoc._id.toString() === req.user._id.toString();

    if (post.status === 'draft' && !isAuthor) {
      throw new AppError('Cannot export unpublished drafts.', 403, 'FORBIDDEN');
    }

    const safeFilename = post.slug || 'story';
    const authorName = authorDoc?.displayName || authorDoc?.username || 'Timbaktu Author';

    // 1. Markdown Export
    if (format === 'md' || format === 'markdown') {
      const audioSection = post.audio ? `\n> 🎙️ **Listen to Narration**: [Play Audio](${post.audio.url})\n` : '';
      const tagsSection = post.tags?.length ? `\n**Tags**: ${post.tags.map(t => `#${t}`).join(' ')}\n` : '';

      // Strip basic HTML tags for Markdown body
      const cleanBody = post.contentHtml
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<[^>]+>/g, '');

      const markdown = `# ${post.title}
*By ${authorName} — Published on Timbaktu*
${audioSection}${tagsSection}
---

${cleanBody.trim()}
`;

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.md"`);
      res.send(markdown);
      return;
    }

    // 2. Clean HTML Export
    if (format === 'html') {
      const audioHtml = post.audio ? `
        <div style="background: #EBF0E8; border: 1px solid #CAD6BF; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
          <strong>🎙️ Audio Narration Available:</strong>
          <audio controls src="${post.audio.url}" style="width: 100%; margin-top: 8px;"></audio>
        </div>` : '';

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${post.title} — Timbaktu</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.8;
      max-width: 720px;
      margin: 40px auto;
      padding: 0 20px;
      color: #382A20;
      background: #FAF6ED;
    }
    header {
      border-bottom: 2px solid #536B4E;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { color: #261C16; font-size: 2.2em; margin-bottom: 8px; }
    .meta { color: #644D3D; font-size: 0.95em; font-family: sans-serif; }
    .brand { font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; color: #536B4E; font-weight: bold; }
    blockquote { border-left: 3px solid #C87556; margin: 20px 0; padding-left: 15px; font-style: italic; }
    footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #CAD6BF; font-size: 0.85em; color: #846752; font-family: sans-serif; }
  </style>
</head>
<body>
  <header>
    <div class="brand">TIMBAKTU — Stories sound better here</div>
    <h1>${post.title}</h1>
    <div class="meta">By <strong>${authorName}</strong> | ${post.readingTimeMinutes} min read</div>
  </header>
  ${audioHtml}
  <article>
    ${post.contentHtml}
  </article>
  <footer>
    <p>Exported from Timbaktu on ${new Date().toLocaleDateString()}</p>
  </footer>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.html"`);
      res.send(fullHtml);
      return;
    }

    // 3. High-Quality PDF Export
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      doc.pipe(res);

      // Header Branding
      doc.fontSize(10).fillColor('#536B4E').text('TIMBAKTU  •  STORIES SOUND BETTER HERE', { align: 'center' });
      doc.moveDown(1.5);

      // Post Title
      doc.fontSize(24).fillColor('#261C16').text(post.title, { align: 'left' });
      doc.moveDown(0.5);

      // Metadata
      doc.fontSize(11).fillColor('#644D3D')
        .text(`By ${authorName}  |  ${post.readingTimeMinutes} min read  |  ${post.tags?.join(', ') || 'Story'}`);
      doc.moveDown(1);

      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#CAD6BF').stroke();
      doc.moveDown(1.5);

      // Audio note if exists
      if (post.audio) {
        doc.fontSize(10).fillColor('#C87556')
          .text(`[🎙️ Audio Narration: ${post.audio.url}]`, { align: 'left' });
        doc.moveDown(1);
      }

      // Plain body text lines
      const cleanParagraphs = post.contentHtml
        .replace(/<[^>]+>/g, '\n')
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean);

      doc.fontSize(12).fillColor('#382A20').lineGap(4);
      cleanParagraphs.forEach(p => {
        doc.text(p);
        doc.moveDown(0.8);
      });

      doc.moveDown(2);
      doc.fontSize(9).fillColor('#846752').text(`Generated from Timbaktu on ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
      return;
    }

    // 4. Audio Download
    if (format === 'audio') {
      if (!post.audio) {
        throw new AppError('This post does not have voice narration attached.', 404, 'NO_AUDIO_ATTACHED');
      }
      res.redirect(post.audio.url);
      return;
    }

    throw new AppError(`Unsupported export format: ${format}`, 400, 'INVALID_FORMAT');
  } catch (error) {
    next(error);
  }
});

export const exportRouter = router;
