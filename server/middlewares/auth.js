import jwt from 'jsonwebtoken'
import config from '../utils/config.js'
import logger from '../utils/logger.js'

const auth = async (req, res, next) => {
  // logger.info('req arrived')
  const authHeader = req.header('Authorization');
  // logger.info(authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token missing or invalid format" });
  }

  const token = authHeader.replace('Bearer ', '');
  // logger.info(token)
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = await jwt.verify(token, config.JWT_SECRET);
    
    req.user = decoded;
    // logger.info('req.user: ', req.user)
    next();
  }
  catch (error) {
    logger.error('logger from middleware auth: ', error)
    next(error);
  }
}

export default auth