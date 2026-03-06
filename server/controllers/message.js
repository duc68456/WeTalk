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

    // Emit to the conversation room (for clients already joined).
    io.to(conversationId).emit('new_message', newMessage)

    // Also emit to each member's user room so recipients get the message even
    // if they haven't joined this conversation room yet (new chat / first message).
    try {
      const members = await messageService.getConversationMemberUserIds(conversationId)
      for (const uid of members) {
        io.to(`user:${uid}`).emit('new_message', newMessage)
      }
    } catch (e) {
      logger.error('Failed to emit new_message to user rooms', e)
    }
    
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
    // logger.info('req limit: ', req.query.limit)

    const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    const limit = 20
    logger.info('limit: ', req.query.limit, ' query page: ', req.query.page)

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