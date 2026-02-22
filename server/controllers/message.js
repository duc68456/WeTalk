import express from 'express'
import mongoose from 'mongoose'

import logger from '../utils/logger.js'

import Message from '../models/message.js'

const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    logger.info('req arrived route POST message')
    const { conversationId, content } = req.body
    const senderId = req.user.userId
    
    const newMessage = await Message.create({
      conversationId: conversationId,
      senderId: senderId,
      content: content
    })

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