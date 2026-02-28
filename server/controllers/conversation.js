import express from 'express'
import zod from 'zod'
import { ConversationType } from '@prisma/client';

import logger from '../utils/logger.js'

import conversationService from '../services/conversation.js'

// const ConversationTypeEnum = zod.enum(["DIRECT", "GROUP"]);

// const conversationSchema = zod.object({
//   type: ConversationTypeEnum.optional(),
//   participantsIds: zod.array(
//     zod.string().uuid({ message: "Invalid ID" })
//   )
//   .min(1, { message: "Must select at least one person to chat" })
// })

const conversationSchema = zod.object({
  type: zod.nativeEnum(ConversationType, { 
    invalid_type_error: "Type must be DIRECT or GROUP" 
  }).default("DIRECT"),
  
  name: zod.string().min(2, "Group name is too short").max(50).optional().or(zod.literal("")),

  participantsIds: zod.array(
    zod.string().uuid({ message: "Invalid ID" })
  ).min(1, { message: "Must select at least one person to chat" })
})
.refine((data) => {
  if (data.type === "GROUP" && (!data.name || data.name.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Group name is required for group chats",
  path: ["name"],
});

const router = express.Router();

router.get('/myConversation', async (req, res, next) => {
  try {
    const userId = req.user.userId

    const myConversations = await conversationService.getMyConversation(userId)
    // logger.info(myConversations)

    res.status(200).json(myConversations)
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

    const { name, participantsIds } = validatedData
    const type = validatedData.type || 'DIRECT'

    const creatorId = req.user?.userId
    const allMembersIds = [...new Set([creatorId, ...participantsIds])]
    const inviteesIds = participantsIds.filter(id => id !== creatorId);

    const result = await conversationService.createConversation(type, inviteesIds, creatorId, allMembersIds, name)

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

router.delete('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const requesterId = req.user.userId;

    const deletedConversation = await conversationService.deleteConversation(
      conversationId, 
      requesterId
    );

    return res.status(200).json({
      message: "Conversation deleted successfully",
      conversation: deletedConversation
    });
  }
  catch (error) {
    next(error);
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