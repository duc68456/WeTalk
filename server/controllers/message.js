import express from 'express'

import logger from '../utils/logger.js'

import messageService from '../services/message.js'

const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const { conversationId, content } = req.body
    const senderId = req.user.userId

    const io = req.app.get('io')

    const newMessage = await messageService.postMessageToConversation(senderId, conversationId, content)

    io.to(conversationId).emit('new_message', newMessage)
    
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

router.get('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.userId

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await messageService.getMessagesByConversationId(userId, conversationId, page, limit)

    return res.status(200).json({
      message: "Messages of this conversation",
      messages: messages
    })
  }
  catch (error) {
    logger.info(error)
    next(error)
  }
})

export default router