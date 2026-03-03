import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from '../utils/config.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.user.userId;

    return {
      folder: 'chat_app_avatars',
      public_id: `user_avatar_${userId}`,
      allowed_formats: ['jpeg', 'png', 'jpg'], 
      // transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
      transformation: [{ width: 500, height: 500, crop: 'fill' }],
      overwrite: true,
      invalidate: true 
    };
  }
});

const uploadCloud = multer({ storage });

export default uploadCloud;