import multer from 'multer';
import path from 'path';
import { MAX_UPLOAD_SIZE } from '../../constants';
import { ValidationError } from '../errors';

const _path = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, _path);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${req.body.name}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new ValidationError('Only image files are allowed!'), false); // Reject file
  }
};

export const upload = multer({ storage, limits: MAX_UPLOAD_SIZE, fileFilter });