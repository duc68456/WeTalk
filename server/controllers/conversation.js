import express from 'express'
import zod from 'zod'
import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const ConversationTypeEnum = zod.enum(["DIRECT", "GROUP"]);

const conversationSchema = zod.object({
  type: ConversationTypeEnum.optional(),
  participantsIds: zod.array(
    zod.string().uuid({ message: "Invalid ID" })
  )
  .min(1, { message: "Must select at least one person to chat" })
})

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const validatedData = conversationSchema.parse(req.body)
    // logger.info(validatedData)
    const { participantsIds } = validatedData
    const type = validatedData.type || 'DIRECT'
    // logger.info('still ok')
    const creatorId = req.user?.userId
    // logger.info('creatorId: ', creatorId)
    const allMembersIds = [...new Set([creatorId, ...participantsIds])]
    // logger.info('okay line 25')
    // logger.info('type: ', type)
    // logger.info(allMembersIds)
    const newConversation = await prisma.conversation.create({
      data: {
        type: type,
        members: {
          create: allMembersIds.map((id) => ({
            user: { connect: { id: id } },
            role: { connect: { id: 1 } }
          }))
        }
      },
      include: {
        members: true
      }
    })

    logger.info(newConversation)

    res.status(201).json({
      message: "Conversation created succesfully",
      conversation: newConversation
    })
  }
  catch (error) {
    next(error)
  }
})

export default router