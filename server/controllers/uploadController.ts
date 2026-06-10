import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

export const handleUpload = (req: Request, res: Response) => {
    console.log('Upload request received');
    // Allow either 'image' or 'video' or 'file' field names
    upload.any()(req, res, (err) => {
        console.log('Multer callback triggered', { err, files: req.files });
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('Upload Error:', err);
            return res.status(500).json({ message: err.message });
        }
        
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            
            const filePath = `/uploads/${files[0].filename}`;
            console.log('Upload success:', filePath);
            res.json({ url: filePath });
        } catch (err: any) {
            console.error('Route Error:', err);
            res.status(500).json({ message: err.message });
        }
    });
};
