import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export async function uploadFileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const filePath = req.file.path;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      // Clean up unhandled file
      fs.unlinkSync(filePath);
      return sendError(res, 'Unsupported file type. Please upload a PDF or TXT file.', 400);
    }

    // Clean up file after reading
    fs.unlinkSync(filePath);

    // Return the extracted text
    return sendSuccess(res, { text: extractedText.trim() }, 'File parsed successfully');
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return next(err);
  }
}
