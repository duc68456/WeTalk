import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import mongoose from 'mongoose'
import config from '../utils/config.js'

async function main() {
  const mongo_conn = await mongoose.connect(config.MONGO_URI)  
  console.log(`MongoDB connected: ${mongo_conn.connection.host}`)

  await prisma.$connect()
  const pgHost = config.DATABASE_URL.split('@')[1]?.split('/')[0] || 'localhost';
  console.log(`Postgres connected: ${pgHost}`);
}

await main()
  .catch((error) => console.error(error))

export default prisma;