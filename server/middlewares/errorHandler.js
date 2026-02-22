import zod from 'zod'

import logger from '../utils/logger.js'

const errorHandler = (err, req, res, next) => {
  // logger.error(err)
  if (err.message === 'DIRECT_MIN_MEMBER') {
    return res.status(400).json({ message: "DIRECT chat can only have 2 participant" });
  }
  else if (err.message === 'GROUP_MIN_MEMBER') {
    return res.status(422).json({ message: "Group must have at least 3 members" })
  }

  else if (err.message === 'USER_NOT_FOUND') {
    return res.status(404).json({ message: "User not found" })
  }

  else if (err.message === 'CONVERSATION_NOT_FOUND') {
    return res.status(404).json({ message: "Conversation not found" })
  }
  else if (err.message === 'MISSING_ID_TO_GET_MEMBERS') {
    return res.status(400).json({ message: "ConversationId is required" })
  }

  else if (err.message === 'NOT_ALLOWED') {
    return res.status(401).json({ message: "You are not permitted to perform this action" })
  }

  else if (err instanceof zod.ZodError) {
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