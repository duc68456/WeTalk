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

router.get('/myConversation', async (req, res, next) => {
  try {
    logger.info('req arrived my')
    logger.info('req user: ', req.user)
    const userId = req.user.userId

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!isUserExist) {
      return res.status(400).json({
        message: "User is not exist"
      })
    }

    const memberRecords = await prisma.member.findMany({
      where: {
        userId: userId
      },
      include: {
        conversation: true
      }
    })
    logger.info(memberRecords)
    res.json(memberRecords)
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

    const isInConversation = await prisma.member.findUnique({
      where: {
        userId_conversationId: {
          userId: requesterId,
          conversationId: conversationId
        }
      }}
    )

    if (!isInConversation) {
      return res.status(403).json({
        message: "You are not permitted to view this conversation"
      })
    }

    const queriedConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: { members: true }
    })

    return res.status(200).json({
      message: "Query conversation succesfully",
      conversation: queriedConversation
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  // logger.info('req: ', req.body)
  const { conversationId } = req.body
  logger.info(conversationId)
  if (conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      }
    })

    res.status(200).json({
      message: "Conversation found",
      conversation: conversation
    })
  }
  else {
    return res.status(404).json({
      message: "Conversation not found"
    })
  }
})

router.post('/', async (req, res, next) => {
  try {
    // logger.info('req arrived router')
    const validatedData = conversationSchema.parse(req.body)
    // logger.info('still ok')
    // logger.info('validated data: ', validatedData)
    const { participantsIds } = validatedData
    const type = validatedData.type || 'DIRECT'
    // logger.info('still ok')
    // logger.info('participantsIds: ', participantsIds)
    const creatorId = req.user?.userId
    // logger.info('creatorId: ', creatorId)
    const allMembersIds = [...new Set([creatorId, ...participantsIds])]
    // logger.info('okay line 25')
    // logger.info('type: ', type)
    // logger.info(allMembersIds)
    if (type === 'DIRECT') {
      const partnerId = participantsIds[0]

      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: creatorId } } },
            { members: { some: { userId: partnerId } } }
          ]
        },
        include: {
          members: true
        }
      })

      if (existingConversation) {
        return res.status(200).json({
          message: "This conversation already exist",
          conversation: existingConversation
        })
      }

      const newConversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
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

      return res.status(201).json({
        message: "Conversation created succesfully",
        conversation: newConversation
      })
    }

    else if (type === 'GROUP') {
      // logger.info('req arrived group')
      if (participantsIds.length < 2) {
        return res.status(422).json({ message: "Group must have at least 3 members" })
      }
      // logger.info('still ok')
      const newGroup = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          members: {
            create: [
              {
                user: { connect: { id: creatorId } },
                role: { connect: { id: 2} }
              },
              ...participantsIds.map((id) => ({
                user: { connect: { id: id } },
                role: { connect: {id: 3} }
              }))
            ]
          }
        },
        include: {
          members: true
        }
      })

      // logger.info('new Group: ', newGroup)
      return res.status(201).json({
        message: "Group created succesfully",
        conversation: newGroup
      })
    }
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router