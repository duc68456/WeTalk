import server from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'
import { connectPrisma } from './config/db.js'

async function start() {
  try {
    await connectPrisma()
  } catch (err) {
    logger.error('Failed to connect Postgres via Prisma', err)
    process.exit(1)
  }

  server.listen(config.PORT, '0.0.0.0', () => {
    logger.info(`Server is running on PORT ${config.PORT}`)
  })
}

start()