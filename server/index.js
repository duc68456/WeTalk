import server from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'

server.listen(config.PORT, '0.0.0.0', () => {
  logger.info(`Server is running on PORT ${config.PORT}`)
})