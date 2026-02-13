import dotenv from 'dotenv';
dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const DATABASE_URL = process.env.DATABASE_URL

export default {
  MONGO_URI,
  DATABASE_URL
}