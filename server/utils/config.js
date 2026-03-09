import dotenv from 'dotenv';
dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_URL = process.env.DIRECT_URL

const PORT = process.env.PORT || 3000

const JWT_SECRET = process.env.JWT_SECRET

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

export default {
  MONGO_URI,
  DATABASE_URL,
  PORT,
  JWT_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  DIRECT_URL
}