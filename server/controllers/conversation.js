import express from 'express'
import zod from 'zod'

import prisma from '../config/db.js'
import logger from '../utils/logger.js'

import conversationService from '../services/conversation.js'

const ConversationTypeEnum = zod.enum(["DIRECT", "GROUP"]);

const conversationSchema = zod.object({
  type: ConversationTypeEnum.optional(),
  participantsIds: zod.array(
    zod.string().uuid({ message: "Invalid ID" })
  )
  .min(1, { message: "Must select at least one person to chat" })
})

const router = express.Router();

router.get('/myConversation', async (req, res, next) => {
  try {
    const userId = req.user.userId

    const memberRecords = await conversationService.getMyConversation(userId)
    logger.info(memberRecords)

    res.status(200).json(memberRecords)
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    logger.info('req arrived post')
    const validatedData = conversationSchema.parse(req.body)

    const { participantsIds } = validatedData
    const type = validatedData.type || 'DIRECT'

    const creatorId = req.user?.userId
    const allMembersIds = [...new Set([creatorId, ...participantsIds])]
    const inviteesIds = participantsIds.filter(id => id !== creatorId);

    const result = await conversationService.createConversation(type, inviteesIds, creatorId, allMembersIds)

    if (result.isAlreadyExisted) {
      return res.status(200).json({
        message: "This conversation already exist",
        conversation: result.data
      })
    }

    return res.status(201).json({
        message: "Group created succesfully",
        conversation: result.data
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

    const requesterId = req.user.userId

    // logger.info(conversation)

    const conversation = await conversationService.getConversationById(conversationId, requesterId)

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found or you do not have permission"
      })
    }
    
    return res.status(200).json({
      message: "Query conversation successfully",
      conversation: conversation
    })
  }
  catch (error) {
    logger.error('error: ', error)
    next(error)
  }
})

export default router