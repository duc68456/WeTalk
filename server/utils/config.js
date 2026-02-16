import dotenv from 'dotenv';
dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const DATABASE_URL = process.env.DATABASE_URL

const PORT = process.env.PORT || 3000

const JWT_SECRET = process.env.JWT_SECRET

export default {
  MONGO_URI,
  DATABASE_URL,
  PORT,
  JWT_SECRET
}