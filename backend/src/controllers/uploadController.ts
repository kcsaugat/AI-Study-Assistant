import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import pdfParse from 'pdf-parse';

export async function uploadFileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(res, 'No file uploaded', 400);
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    } else {
      // Fallback: read as text for ALL other files directly from memory buffer
      extractedText = req.file.buffer.toString('utf8');
    }

    // Return the extracted text
    return sendSuccess(res, { text: extractedText.trim() }, 'File parsed successfully');
  } catch (err) {
    return next(err);
  }
}
