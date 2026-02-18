import express from 'express'
import zod from 'zod'

import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const router = express.Router()

const updateMemberSchema = zod.object({
  roleId: zod.coerce.number().int({ message: "roleId must be Integer" })
})

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

router.delete('/', async (req, res, next) => {
  try {
    const { userId, conversationId } = req.query

    const requesterId = req.user.userId;

    if (userId !== requesterId) {
      const requesterMember = await prisma.member.findUnique({
        where: {
          userId_conversationId: {
            userId: requesterId,
            conversationId: conversationId
          }
        },
        include: { role: true }
      });

      if (!requesterMember || (requesterMember.roleId !== 2)) {
        return res.status(403).json({ 
          message: "You are not permitted to delete this member" 
        });
      }
    }

    const memberDeleted = await prisma.member.delete({
      where: {
        userId_conversationId: {
          userId: userId,
          conversationId: conversationId
        }
      }
    })

    return res.status(200).json({
      message: "Member deleted succesfully",
      member: memberDeleted
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { userId, conversationId } = req.query

    const validatedData = updateMemberSchema.parse(req.body)

    const { roleId } = validatedData
    const requesterId = req.user.userId;

    const requesterMember = await prisma.member.findUnique({
      where: {
        userId_conversationId: {
          userId: requesterId,
          conversationId: conversationId
        }
      },
      include: { role: true }
    });

    if (!requesterMember || (requesterMember.roleId !== 2)) {
      return res.status(403).json({ 
        message: "You are not permitted to edit the role of this member" 
      });
    }

    const editedMember = await prisma.member.update({
      where: {
        userId_conversationId: {
          userId: userId,
          conversationId: conversationId
        }
      },
      data: {
        roleId: roleId
      }
    })

    return res.status(200).json({
      message: "Member's role editted succesfully",
      member: editedMember
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router