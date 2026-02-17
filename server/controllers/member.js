import express from 'express'
import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { conversationId } = req.query

    if (!conversationId) {
      return res.status(400).json({
        message: "conversationId is required"
      })
    }

    const isConversationExist = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      }
    })

    logger.info(isConversationExist)
    if (!isConversationExist) {
      return res.status(400).json({
        message: "Conversation is not exist"
      })
    }

    const members = await prisma.member.findMany({
      where: {
        conversationId: conversationId
      }
    })
    // logger.info(members)
    res.json(members)
  }
  catch (error) {
    logger.info(error)
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    logger.info('req arrived')
    const { userId, conversationId } = req.body
    // logger.info('req user: ', req.user)
    const memberAddingId = req.user.userId
    logger.info('memberAddingId: ', memberAddingId)
    const isHaveAuthority = await prisma.member.findUnique({
      where: {
        // userId: memberAddingId,
        // conversationId: conversationId
        userId_conversationId: {
          userId: memberAddingId,
          conversationId: conversationId
        }
      }
    })

    if (!isHaveAuthority) {
      return res.status(401).json({
        message: "You are not allowed to add people to this conversation"
      })
    }

    const memberAdded = await prisma.member.create({
      data: {
        user: { connect: { id: userId } },
        conversation: { connect: { id: conversationId } },
        role: { connect: { id: 3 } }
      }
    })
    logger.info('member added: ', memberAdded)

    res.status(201).json({
      message: "Member added succesfully",
      member: memberAdded
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router