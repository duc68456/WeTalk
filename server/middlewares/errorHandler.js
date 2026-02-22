import zod from 'zod'

import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
  if (err.message === 'DIRECT_MIN_MEMBER') {
    return res.status(400).json({ message: "DIRECT chat can only have 2 participant" });
  }
  if (err.message === 'GROUP_MIN_MEMBER') {
    // logger.error('yeah it fall this')
    return res.status(422).json({ message: "Group must have at least 3 members" })
  }
  if (err instanceof zod.ZodError) {
    const paths = err.issues.map(e => e.path)
    const messages = err.issues.map(e => e.message)
    return res.status(400).json({
      message: `These fields are invalid: ${paths.join(', ')}`,
      details: messages
    })
  }
  else if(err.code === 'P2002') {
    const field = err.meta.target[0]
    return res.status(409).json({
      message: `This ${field} is already exist`
    })
  }
  else if(err.code === 'P2025') {
    // const field = err.meta.target[0]
    const field = err.meta.modelName
    return res.status(409).json({
      message: `${field} was not found for delete`
    })
  }
  else {
    logger.error(err)
    return res.status(500).json({
      message: 'the error cannot be idenify'
    })
  }
}

export default errorHandler