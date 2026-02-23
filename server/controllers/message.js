import express from 'express'

import logger from '../utils/logger.js'

import messageService from '../services/message.js'

const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const { conversationId, content } = req.body
    const senderId = req.user.userId

    const newMessage = await messageService.postMessageToConversation(senderId, conversationId, content)
    
    return res.status(201).json({
      message: "Message created succesfully",
      newMessage: newMessage
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router