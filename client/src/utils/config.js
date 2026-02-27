import dotenv from 'dotenv';
dotenv.config()

const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL

export default {
  VITE_API_BASE_URL
}